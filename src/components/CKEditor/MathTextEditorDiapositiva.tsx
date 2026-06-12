// src/components/CKEditor/MathTextEditorDiapositiva.tsx
//
// Editor especializado para diapositivas. Extiende MathTextEditor con:
//   - TwoColumnsPlugin   (bloques de dos columnas con ratios)
//   - MultiColumnListPlugin (listas en 2/3/4 columnas)
//   - Tailwind CDN inyectado en el <head> del documento para que las
//     clases de los plugins se vean en el editor (el área editable es un
//     contenteditable div en el mismo DOM, no un iframe).
//
// El área editable se comporta como un lienzo de slide (SLIDE.width @
// SLIDE.baseFontPx) y se escala automáticamente al espacio disponible con
// min(anchoPanel/width, altoPanel/height) para verse WYSIWYG sin desbordar.

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Essentials,
  Paragraph,
  Heading,
  Link,
  List,
  BlockQuote,
  Alignment,
  FontSize,
  FontColor,
  Code,
  Table,
  TableToolbar,
  SourceEditing,
  Image,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageResizeEditing,
  ImageResizeHandles,
  ImageInsert,
  GeneralHtmlSupport,
  type EditorConfig,
  type ViewDowncastWriter,
  type Editor,
  ListProperties,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

import { MathPlugin } from "./plugins/MathPlugin";
import { InlineTablePlugin } from "./plugins/InlineTablePlugin";
import {
  ImageUploadPlugin,
  type ImageUploadPluginConfig,
} from "./plugins/ImageUploadPlugin";
import { InlineStylesPlugin } from "./plugins/InlineStylesPlugin";
import { InlineHeadingPlugin } from "./plugins/InlineHeadingPlugin";
import {
  InsertImageUrlPlugin,
  type InsertImageUrlPluginConfig,
} from "./plugins/InsertImageUrlPlugin";
import {
  MathBlockPlugin,
  type MathBlockPluginConfig,
  type TipoEntorno,
} from "./plugins/MathBlockPlugin";
import { TwoColumnsPlugin } from "./plugins/TwoColumnsPlugin";
import { MultiColumnListPlugin } from "./plugins/MultiColumnListPlugin";
import { FragmentPlugin } from "./plugins/FragmentPlugin";
import {
  InsertGeoGebraPlugin,
  type InsertGeoGebraPluginConfig,
  type GeoGebraParams,
} from "./plugins/InsertGeoGebraPlugin"; // + GEOGEBRA
import { InsertImageUrlModal } from "./components/InsertImageUrlModal";
import { GeoGebraModal } from "./components/GeoGebraModal"; // + GEOGEBRA
import MathEditModal from "./components/MathEditModal";
import MathBlockModal from "./components/MathBlockModal";
import { SLIDE } from "../../pages/diapositiva/slideConstants";

// ── Inyectar CSS de Reveal-WYSIWYG y Tailwind en el documento ────────────────
// El área editable se comporta como un lienzo de slide: ancho lógico
// SLIDE.width @ SLIDE.baseFontPx. La escala tipográfica deriva de esa base,
// NO compite con las clases Tailwind de heading (text-3xl, etc.) del
// InlineHeadingPlugin. CKEditor usa contenteditable en el mismo DOM (no
// iframe), por lo que los estilos del <head> aplican en el área editable.

function injectRevealStyles(_tema: string) {
  console.log(_tema);
  // 1. Tailwind CDN — una sola vez
  if (!document.getElementById("reveal-editor-tailwind")) {
    const script = document.createElement("script");
    script.id = "reveal-editor-tailwind";
    script.src = "https://cdn.tailwindcss.com";
    script.onload = () => {
      const tw = (window as Window & { tailwind?: { config: object } })
        .tailwind;
      if (tw) tw.config = { corePlugins: { preflight: false } };
    };
    document.head.appendChild(script);
  }

  // 2. CSS scoped al área editable — base de fuente de slide + reset de
  //    márgenes Reveal. NO define tamaños de heading: esos vienen de las
  //    clases Tailwind del InlineHeadingPlugin.
  const scopeId = "reveal-editor-scoped-css";
  if (!document.getElementById(scopeId)) {
    const style = document.createElement("style");
    style.id = scopeId;
    style.textContent = `
      .ck-editor__editable.reveal-preview {
        background: #ffffff;
        font-size: ${SLIDE.baseFontPx}px;
        line-height: 1.4;
        text-align: left;
        box-sizing: border-box;
        padding: 24px;
      }
      .ck-editor__editable.reveal-preview p  { margin: 0.5em 0; }
      .ck-editor__editable.reveal-preview ul,
      .ck-editor__editable.reveal-preview ol { padding-left: 1.6em; margin: 0.5em 0; }
      .ck-editor__editable.reveal-preview li { margin: 0.25em 0; }
      .ck-editor__editable.reveal-preview strong { font-weight: bold; }
      .ck-editor__editable.reveal-preview em { font-style: italic; }
      .ck-editor__editable.reveal-preview iframe { max-width: 100%; }
    `;
    document.head.appendChild(style);
  }
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface EditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
  siglaCurso?: string;
  tema?: string;
  porcentaje?: number; // porcentaje del tamaño de slide a usar en el editor (ej: 0.7 = 70%)
}

interface LatexModalState {
  open: boolean;
  latex: string;
  type: "inline" | "block";
  onSave: ((latex: string, type: "inline" | "block") => void) | null;
}

interface UrlModalState {
  open: boolean;
  tab?: 0 | 1;
}

interface EnvModalState {
  open: boolean;
  tipo: TipoEntorno;
  subtituloActual: string;
  modoInsertar: boolean;
  onSave: ((subtitulo: string) => void) | null;
}

const LATEX_MODAL_CLOSED: LatexModalState = {
  open: false,
  latex: "",
  type: "inline",
  onSave: null,
};
const ENV_MODAL_CLOSED: EnvModalState = {
  open: false,
  tipo: "definicion",
  subtituloActual: "",
  modoInsertar: true,
  onSave: null,
};

// ── Plugins ───────────────────────────────────────────────────────────────────

const BASE_PLUGINS = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Link,
  List,
  ListProperties,
  BlockQuote,
  Alignment,
  FontSize,
  FontColor,
  Code,
  Table,
  TableToolbar,
  SourceEditing,
  Image,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageResizeEditing,
  ImageResizeHandles,
  ImageInsert,
  InlineTablePlugin,
  ImageUploadPlugin,
  InsertImageUrlPlugin,
  MathPlugin,
  MathBlockPlugin,
  TwoColumnsPlugin,
  MultiColumnListPlugin,
  FragmentPlugin,
  InsertGeoGebraPlugin, // + GEOGEBRA
  InlineStylesPlugin,
  InlineHeadingPlugin,
  GeneralHtmlSupport,
];

const TOOLBAR_ITEMS = [
  "undo",
  "redo",
  "|",
  "heading",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
  "|",
  "fontSize",
  "fontColor",
  "|",
  "alignment",
  // "|",
  "-", // break point
  "link",
  "bulletedList",
  "numberedList",
  "listType",
  "blockQuote",
  "|",
  "insertTable",
  "insertImageMenu",
  "insertMath",
  "insertMathEnvironment",
  "insertFragment",
  "insertGeoGebra", // + GEOGEBRA
  "insertTwoColumns",
  "insertMultiColList",
  "addMultiColListItem",
  "|",
  "sourceEditing",
];

// ── htmlSupport config — fuera del componente para referencia estable ─────────

const HTML_SUPPORT_CONFIG = {
  allow: [
    // {
    //   name: /.*/, // cualquier elemento HTML
    //   attributes: true, // cualquier atributo
    //   classes: true, // cualquier clase
    //   styles: true, // cualquier estilo inline
    // },
    { name: "ol", attributes: { type: true }, classes: true, styles: true },
    { name: "div", attributes: true, classes: true, styles: true },
    { name: "section", attributes: true, classes: true, styles: true },
    {
      name: "iframe",
      attributes: [
        "src",
        "width",
        "height",
        "style",
        "scrolling",
        "allowfullscreen",
        "fullscreen",
        "frameborder",
        "border",
      ],
      classes: false,
      styles: true,
    },
    {
      name: "table",
      attributes: ["border", "cellpadding", "cellspacing", "align"],
      classes: false,
      styles: true,
    },
    {
      name: "td",
      attributes: ["width", "valign", "align"],
      classes: false,
      styles: true,
    },
    {
      name: "th",
      attributes: ["width", "valign", "align"],
      classes: false,
      styles: true,
    },
    { name: "tbody", attributes: ["align"], classes: false, styles: false },
    { name: "center", attributes: false, classes: false, styles: false },
    { name: "u", attributes: false, classes: false, styles: false },
    { name: "h5", attributes: false, classes: false, styles: true },
    { name: /.*/, attributes: /^data-/, classes: false, styles: false },
  ],
};

// Paleta de color de texto — calza 1:1 con TEXT_COLOR_CLASS del InlineStylesPlugin
const FONT_COLORS = [
  { color: "#0f172a", label: "Slate" },
  { color: "#64748b", label: "Gris" },
  { color: "#0d9488", label: "Teal" },
  { color: "#16a34a", label: "Verde" },
  { color: "#dc2626", label: "Rojo" },
];

// ── Componente ────────────────────────────────────────────────────────────────

const MathTextEditorDiapositiva: React.FC<EditorProps> = ({
  initialData = "",
  onChange,
  siglaCurso = "",
  tema = "beige",
  porcentaje = 0.6,
}) => {
  const [latexModal, setLatexModal] =
    useState<LatexModalState>(LATEX_MODAL_CLOSED);
  const [urlModal, setUrlModal] = useState<UrlModalState>({ open: false });
  const [envModal, setEnvModal] = useState<EnvModalState>(ENV_MODAL_CLOSED);
  const [geogebraOpen, setGeogebraOpen] = useState(false); // + GEOGEBRA

  // Ref al editor — asignado en onReady, leído en handlers
  const editorRef = useRef<Editor | null>(null);

  // Host medido para el escalado + función de recálculo expuesta a onReady.
  const scaleHostRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<HTMLDivElement>(null);
  const scaleWrapRef = useRef<HTMLDivElement>(null); // ← NUEVO: wrapper escalable
  const recalcularEscalaRef = useRef<() => void>(() => {});

  // Dato inicial fijado una sola vez al montar via useMemo con deps [].
  // No puede ser un ref porque leer .current durante render está
  // prohibido en React 19 (react-hooks/refs).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialDataFixed = useMemo(() => initialData, []);

  // Refs a los callbacks onSave de los modales — actualizados via useEffect
  // para no violar react-hooks/refs (prohibido escribir refs durante render).
  const latexOnSaveRef = useRef(latexModal.onSave);
  const envOnSaveRef = useRef(envModal.onSave);

  useEffect(() => {
    latexOnSaveRef.current = latexModal.onSave;
  }, [latexModal.onSave]);
  useEffect(() => {
    envOnSaveRef.current = envModal.onSave;
  }, [envModal.onSave]);

  // Inyectar CSS de Reveal + Tailwind al montar y cuando cambia el tema
  useEffect(() => {
    injectRevealStyles(tema);
  }, [tema]);

  // ── Escalado automático del área editable al espacio disponible ───────────
  // scale = min(anchoPanel/width, altoPanel/height) → slide completa, sin
  // recortes. Se recalcula vía ResizeObserver, en resize de ventana, y desde
  // onReady (cuando el editable ya existe) con doble rAF.
  useEffect(() => {
    const host = scaleHostRef.current;
    const sensor = sensorRef.current;
    if (!host || !sensor) return;

    const aplicarEscala = () => {
      const wrap = scaleWrapRef.current;
      if (!wrap) return;

      const dispW = sensor.clientWidth - 24;
      const top = host.getBoundingClientRect().top;
      const dispH = window.innerHeight - top - 24;

      const scale = Math.min(dispW / SLIDE.width, dispH / SLIDE.height);
      if (scale <= 0 || !isFinite(scale)) return;

      // Escalamos el WRAPPER (no el .ck-editor__editable), porque CKEditor
      // reescribe el editable al enfocar y borraría el transform.
      wrap.style.transform = `scale(${scale})`;
      wrap.style.transformOrigin = "top left";
      // El wrapper mide 1280px de ancho; reservamos el alto escalado en el host.
      host.style.height = `${wrap.offsetHeight * scale}px`;
    };

    recalcularEscalaRef.current = aplicarEscala;
    aplicarEscala();

    const ro = new ResizeObserver(aplicarEscala);
    ro.observe(sensor); // ← observar el sensor, no el host ni el padre
    window.addEventListener("resize", aplicarEscala);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", aplicarEscala);
    };
  }, []);

  // ── Handlers imagen ────────────────────────────────────────────────────────

  const handleInsertUrl = useCallback(
    () => setUrlModal({ open: true, tab: 0 }),
    [],
  );
  const handleInsertGaleria = useCallback(
    () => setUrlModal({ open: true, tab: 1 }),
    [],
  );

  const handleImageUrlInsert = useCallback((url: string, alt: string) => {
    editorRef.current?.execute("insertImageFromUrl", { url, alt });
    editorRef.current?.editing.view.focus();
    setUrlModal({ open: false });
  }, []);

  // ── Handlers GeoGebra ──────────────────────────────────────────────────────
  // + GEOGEBRA
  const handleInsertGeoGebra = useCallback(() => setGeogebraOpen(true), []);
  const handleGeoGebraInsert = useCallback((params: GeoGebraParams) => {
    editorRef.current?.execute("insertGeoGebra", params);
    editorRef.current?.editing.view.focus();
    setGeogebraOpen(false);
  }, []);

  // ── Handlers LaTeX ─────────────────────────────────────────────────────────

  const handleInsertMath = useCallback(() => {
    setLatexModal({ open: true, latex: "", type: "inline", onSave: null });
  }, []);

  const handleEditMath = useCallback(
    (
      latex: string,
      type: "inline" | "block",
      onSave: (newLatex: string, newType: "inline" | "block") => void,
    ) => {
      setLatexModal({ open: true, latex, type, onSave });
    },
    [],
  );

  const handleLatexModalSave = useCallback(
    (latex: string, type: "inline" | "block") => {
      if (latexOnSaveRef.current) {
        // Editar existente: delegar al callback del plugin
        latexOnSaveRef.current(latex, type);
      } else {
        // Insertar nuevo: ejecutar comando
        const cmd = type === "inline" ? "insertMathInline" : "insertMathBlock";
        editorRef.current?.execute(cmd, { latex });
        editorRef.current?.editing.view.focus();
      }
      setLatexModal(LATEX_MODAL_CLOSED);
    },
    [],
  );

  const handleLatexModalClose = useCallback(
    () => setLatexModal(LATEX_MODAL_CLOSED),
    [],
  );

  // ── Handlers entornos ──────────────────────────────────────────────────────

  const handleEditSubtitulo = useCallback(
    (
      tipo: TipoEntorno,
      subtituloActual: string,
      onSave: (nuevoSubtitulo: string) => void,
    ) => {
      setEnvModal({
        open: true,
        tipo,
        subtituloActual,
        modoInsertar: subtituloActual === "",
        onSave,
      });
    },
    [],
  );

  const handleEnvModalSave = useCallback((subtitulo: string) => {
    envOnSaveRef.current?.(subtitulo);
    setEnvModal(ENV_MODAL_CLOSED);
  }, []);

  const handleEnvModalClose = useCallback(
    () => setEnvModal(ENV_MODAL_CLOSED),
    [],
  );

  const handleFocus = useCallback(() => {
    /* foco manejado por CSS :focus-within */
  }, []);
  const handleBlur = useCallback(() => {
    /* blur manejado por CSS :focus-within */
  }, []);

  // ── Config — memoizado para que nunca cambie de referencia ────────────────
  // CRÍTICO: si editorConfig cambia referencia, CKEditor reinicializa el editor
  // y pierde el cursor. Los handlers leen estado actualizado via ref.

  const editorConfig = useMemo(
    () =>
      ({
        licenseKey: "GPL",
        plugins: BASE_PLUGINS,
        toolbar: { items: TOOLBAR_ITEMS, shouldNotGroupWhenFull: true },
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Párrafo",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Título 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Título 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Título 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Título 4",
              class: "ck-heading_heading4",
            },
          ],
        },
        table: {
          contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
        },
        htmlSupport: HTML_SUPPORT_CONFIG,
        fontSize: {
          options: ["tiny", "small", "default", "big", "huge"],
          supportAllValues: false,
        },
        fontColor: {
          colors: FONT_COLORS,
          columns: 5,
          documentColors: 0,
          colorPicker: false,
        },
        image: {
          toolbar: ["imageTextAlternative"],
          resizeUnit: "%",
          insert: {
            type: "auto",
            integrations: ["insertImageViaUrl", "upload"],
          },
        },
        imageUpload: {
          siglaCurso,
          backendUrl: import.meta.env.VITE_BACKEND_URL as string,
          token: sessionStorage.getItem("auth_token") ?? "",
        } satisfies ImageUploadPluginConfig,
        insertImageUrl: {
          onInsertUrl: handleInsertUrl,
          onInsertGaleria: handleInsertGaleria,
        } satisfies InsertImageUrlPluginConfig,
        insertGeoGebra: {
          onInsert: handleInsertGeoGebra,
        } satisfies InsertGeoGebraPluginConfig, // + GEOGEBRA
        math: {
          onInsert: handleInsertMath,
          onEdit: handleEditMath,
        },
        mathBlock: {
          onEditSubtitulo: handleEditSubtitulo,
        } satisfies MathBlockPluginConfig,
      }) as unknown as EditorConfig,
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="editor-wrapper">
      {/* <div ref={sensorRef} style={{ width: "100%", height: 0 }} /> */}
      {/* <div ref={scaleHostRef} style={{ overflow: "hidden", padding: 12 }}> */}
      {/* wrapper escalable: ancho lógico fijo de slide; CKEditor vive dentro */}
      <div
        ref={scaleWrapRef}
        style={{
          width: `${porcentaje * (SLIDE.width+100)}px`,
          height: `${porcentaje * (SLIDE.height+200)}px`,
        }}
      >
        <CKEditor
          editor={ClassicEditor}
          config={{
            ...editorConfig,
            toolbar: { ...editorConfig.toolbar, shouldNotGroupWhenFull: true },
            fontSize: { ...editorConfig.fontSize, supportAllValues: false },
          }}
          data={initialDataFixed}
          onReady={(editor) => {
            const root = editor.editing.view.document.getRoot();
            if (root) {
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.addClass("reveal-preview", root);
                writer.setStyle("width", `${porcentaje * (SLIDE.width+100)}px`, root);
                writer.setStyle(
                  "height",
                  `${porcentaje * (SLIDE.height+200)}px`,
                  root,
                );
                writer.setStyle(
                  "font-size",
                  `${porcentaje * SLIDE.baseFontPx}px`,
                  root,
                );
                writer.setStyle("box-sizing", "border-box", root);
                writer.setStyle("text-align", "justify!important", root);
                writer.setStyle("line-height", "1.8!important", root);
              });
            }
            requestAnimationFrame(() =>
              requestAnimationFrame(() => recalcularEscalaRef.current()),
            );
          }}
          onChange={(_event, editor) => onChange?.(editor.getData())}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {/* </div> */}
      </div>

      {urlModal.open && (
        <InsertImageUrlModal
          siglaCurso={siglaCurso}
          initialTab={urlModal.tab ?? 0}
          onInsert={handleImageUrlInsert}
          onClose={() => setUrlModal({ open: false, tab: 0 })}
        />
      )}

      {/* + GEOGEBRA */}
      {geogebraOpen && (
        <GeoGebraModal
          onInsert={handleGeoGebraInsert}
          onClose={() => setGeogebraOpen(false)}
        />
      )}

      {latexModal.open && (
        <MathEditModal
          latex={latexModal.latex}
          type={latexModal.type}
          onSave={handleLatexModalSave}
          onClose={handleLatexModalClose}
        />
      )}

      {envModal.open && (
        <MathBlockModal
          key={envModal.tipo}
          tipo={envModal.tipo}
          subtituloActual={envModal.subtituloActual}
          modoInsertar={envModal.modoInsertar}
          onSave={handleEnvModalSave}
          onClose={handleEnvModalClose}
        />
      )}
    </div>
  );
};

export default MathTextEditorDiapositiva;
