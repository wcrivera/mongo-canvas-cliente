// src/components/CKEditor/MathTextEditor.tsx
//
// Editor de texto matemático base (ClassicEditor) con soporte para fórmulas,
// entornos, imágenes, tablas, dos columnas, listas multicolumna, fragmentos y
// GeoGebra.
//
// Modo slide: si se pasa `porcentaje`, el área editable se comporta como un
// lienzo de diapositiva (SLIDE.width @ SLIDE.baseFontPx) escalado por ese
// factor. Sin `porcentaje` funciona como editor normal (font-size 14px, sin
// escalado). MathTextEditorDiapositiva es un wrapper que activa el modo slide.
//
// Toda la lógica de modales (estado, handlers) vive en useMathModals; el
// render de los modales en <MathEditorModals/>. El editorRef lo posee este
// componente y se pasa al hook.

import { useEffect, useMemo, useRef } from "react";
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
} from "./plugins/MathBlockPlugin";
import { TwoColumnsPlugin } from "./plugins/TwoColumnsPlugin";
import { MultiColumnListPlugin } from "./plugins/MultiColumnListPlugin";
import { FragmentPlugin } from "./plugins/FragmentPlugin";
import {
  InsertGeoGebraPlugin,
  type InsertGeoGebraPluginConfig,
} from "./plugins/InsertGeoGebraPlugin"; // + GEOGEBRA
import { SLIDE } from "@/pages/diapositiva/slideConstants";
import { cleanForDB } from "./mathUtils";
import { HTML_SUPPORT_CONFIG, FONT_COLORS } from "./mathEditorShared";
import { useMathModals } from "./useMathModals";
import MathEditorModals from "./MathEditorModals";

// ── Inyectar CSS de Reveal-WYSIWYG y Tailwind en el documento ────────────────
// CKEditor usa contenteditable en el mismo DOM (no iframe), por lo que los
// estilos del <head> aplican en el área editable.

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

  // 2. CSS scoped al área editable — reset de márgenes Reveal.
  const scopeId = "reveal-editor-scoped-css";
  if (!document.getElementById(scopeId)) {
    const style = document.createElement("style");
    style.id = scopeId;
    style.textContent = `
      .ck-editor__editable.reveal-preview {
        background: #ffffff;
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
  // Si se define, activa el modo slide: escala el área editable a
  // porcentaje * tamaño de slide. Sin definir → editor normal.
  porcentaje?: number;
}

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

// ── Componente ────────────────────────────────────────────────────────────────

const MathTextEditor: React.FC<EditorProps> = ({
  initialData = "",
  onChange,
  siglaCurso = "",
  tema = "beige",
  porcentaje,
}) => {
  const esSlide = porcentaje !== undefined;

  // El componente posee el editorRef (ref local) y lo pasa al hook de modales.
  const editorRef = useRef<Editor | null>(null);
  const m = useMathModals(editorRef);

  // Host medido para el escalado + función de recálculo expuesta a onReady.
  const scaleHostRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<HTMLDivElement>(null);
  const scaleWrapRef = useRef<HTMLDivElement>(null);
  const recalcularEscalaRef = useRef<() => void>(() => {});

  // Dato inicial fijado una sola vez al montar via useMemo con deps [].
  // No puede ser un ref porque leer .current durante render está
  // prohibido en React 19 (react-hooks/refs).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialDataFixed = useMemo(() => initialData, []);

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
      host.style.height = `${wrap.offsetHeight * scale}px`;
    };

    recalcularEscalaRef.current = aplicarEscala;
    aplicarEscala();

    const ro = new ResizeObserver(aplicarEscala);
    ro.observe(sensor);
    window.addEventListener("resize", aplicarEscala);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", aplicarEscala);
    };
  }, []);

  // ── Config — memoizado para que nunca cambie de referencia ────────────────
  // CRÍTICO: si editorConfig cambia referencia, CKEditor reinicializa el editor
  // y pierde el cursor. Los handlers del hook son estables (useCallback []).

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
          onInsertUrl: m.handleInsertUrl,
          onInsertGaleria: m.handleInsertGaleria,
        } satisfies InsertImageUrlPluginConfig,
        insertGeoGebra: {
          onInsert: m.handleInsertGeoGebra,
        } satisfies InsertGeoGebraPluginConfig, // + GEOGEBRA
        math: {
          onInsert: m.handleInsertMath,
          onEdit: m.handleEditMath,
        },
        mathBlock: {
          onEditSubtitulo: m.handleEditSubtitulo,
        } satisfies MathBlockPluginConfig,
      }) as unknown as EditorConfig,
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="editor-wrapper">
      {/* wrapper escalable: en modo slide tiene ancho/alto lógicos de slide */}
      <div
        ref={scaleWrapRef}
        style={
          esSlide
            ? {
                width: `${porcentaje * (SLIDE.width + 100)}px`,
                height: `${porcentaje * (SLIDE.height + 200)}px`,
              }
            : undefined
        }
      >
        <CKEditor
          editor={ClassicEditor}
          config={{
            ...editorConfig,
            toolbar: { ...editorConfig.toolbar, shouldNotGroupWhenFull: true },
          }}
          data={initialDataFixed}
          onReady={(editor) => {
            // FIX #3: sin esta asignación, editorRef.current queda en null y
            // los comandos de inserción (insertMathInline/insertMathBlock,
            // insertImageFromUrl, insertGeoGebra) ejecutados desde los modales
            // hacen no-op silencioso. La edición de fórmulas sí funcionaba
            // porque usa el `editor` del propio MathPlugin, no este ref.
            editorRef.current = editor;

            const root = editor.editing.view.document.getRoot();
            if (root) {
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.addClass("reveal-preview", root);
                if (esSlide) {
                  writer.setStyle(
                    "width",
                    `${porcentaje * (SLIDE.width + 100)}px`,
                    root,
                  );
                  writer.setStyle(
                    "height",
                    `${porcentaje * (SLIDE.height + 200)}px`,
                    root,
                  );
                  writer.setStyle(
                    "font-size",
                    `${porcentaje * SLIDE.baseFontPx}px`,
                    root,
                  );
                } else {
                  writer.setStyle("font-size", "14px", root);
                }
                writer.setStyle("box-sizing", "border-box", root);
                writer.setStyle("text-align", "justify!important", root);
                writer.setStyle("line-height", "1.8!important", root);
              });
            }
            requestAnimationFrame(() =>
              requestAnimationFrame(() => recalcularEscalaRef.current()),
            );
          }}
          onChange={(_event, editor) => onChange?.(cleanForDB(editor.getData()))}
          onFocus={m.handleFocus}
          onBlur={m.handleBlur}
        />
      </div>

      <MathEditorModals {...m} siglaCurso={siglaCurso} withGeoGebra />
    </div>
  );
};

export default MathTextEditor;