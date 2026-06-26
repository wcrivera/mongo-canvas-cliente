import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  InlineEditor as ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph,
  Heading,
  FontSize,
  FontColor,
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
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

import { MathPlugin } from "./plugins/MathPlugin";
import {
  ImageUploadPlugin,
  type ImageUploadPluginConfig,
} from "./plugins/ImageUploadPlugin";
import {
  InsertImageUrlPlugin,
  type InsertImageUrlPluginConfig,
} from "./plugins/InsertImageUrlPlugin";
import {
  MathBlockPlugin,
  type MathBlockPluginConfig,
  type TipoEntorno,
} from "./plugins/MathBlockPlugin";
import { InsertImageUrlModal } from "./components/InsertImageUrlModal";
import MathEditModal from "./components/MathEditModal";
import MathBlockModal from "./components/MathBlockModal";
import {
  type LatexModalState,
  type UrlModalState,
  type EnvModalState,
  LATEX_MODAL_CLOSED,
  ENV_MODAL_CLOSED,
  HTML_SUPPORT_CONFIG,
  FONT_COLORS,
} from "./mathEditorShared";
import { normalizeForEditor, cleanForDB } from "./mathUtils";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface EditorProps {
  // Se espera contenido LIMPIO (\(...\) / \[...\]). El editor normaliza
  // internamente para mostrar y devuelve contenido limpio en onChange.
  initialData?: string;
  onChange?: (data: string) => void;
  siglaCurso?: string;
}

// ── Constantes propias del Inline ─────────────────────────────────────────────

const BASE_PLUGINS = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  FontSize,
  FontColor,
  SourceEditing,
  Image,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageResizeEditing,
  ImageResizeHandles,
  ImageInsert,
  ImageUploadPlugin,
  InsertImageUrlPlugin,
  MathPlugin,
  MathBlockPlugin,
  GeneralHtmlSupport,
];

const TOOLBAR_ITEMS = [
  "undo",
  "redo",
  "|",
  "bold",
  "italic",
  "|",
  "fontSize",
  "fontColor",
  "|",
  "insertImageMenu",
  "insertMath",
  "|",
  "sourceEditing",
];

// ── Componente ────────────────────────────────────────────────────────────────

const MathTextEditorInline: React.FC<EditorProps> = ({
  initialData = "",
  onChange,
  siglaCurso = "",
}) => {
  const [latexModal, setLatexModal] =
    useState<LatexModalState>(LATEX_MODAL_CLOSED);
  const [urlModal, setUrlModal] = useState<UrlModalState>({ open: false });
  const [envModal, setEnvModal] = useState<EnvModalState>(ENV_MODAL_CLOSED);

  // Ref al editor — asignado en onReady, leído en handlers
  const editorRef = useRef<Editor | null>(null);

  // Dato inicial NORMALIZADO y CONGELADO una sola vez al montar.
  // - Normaliza el \(...\) limpio que llega como prop para que el editor lo
  //   renderice (spans intermedios → nodos mathInline vía MathPlugin).
  // - Congela con useMemo([]) para que los re-render del padre NO re-pasen
  //   data al wrapper de CKEditor (eso provocaba setData() en cada tecla y
  //   revertía la edición en curso → "solo se guardaba la última opción").
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialDataFixed = useMemo(() => normalizeForEditor(initialData), []);

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

  // ── Handlers fórmulas LaTeX ────────────────────────────────────────────────

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

  // ── Handlers entornos matemáticos ──────────────────────────────────────────

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
          ],
        },
        htmlSupport: HTML_SUPPORT_CONFIG,
        image: {
          toolbar: ["imageTextAlternative"],
          resizeUnit: "px",
          insert: {
            type: "auto",
            integrations: ["insertImageViaUrl", "upload"],
          },
        },
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
        imageUpload: {
          siglaCurso,
          backendUrl: import.meta.env.VITE_BACKEND_URL as string,
          token: sessionStorage.getItem("auth_token") ?? "",
        } satisfies ImageUploadPluginConfig,
        insertImageUrl: {
          onInsertUrl: handleInsertUrl,
          onInsertGaleria: handleInsertGaleria,
        } satisfies InsertImageUrlPluginConfig,
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
      <div className="p-3">
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={initialDataFixed}
          onReady={(editor) => {
            editorRef.current = editor;
            const root = editor.editing.view.document.getRoot();
            if (root) {
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.setStyle("min-height", "50px", root);
                writer.setStyle("font-size", "16px", root);
                writer.setStyle("line-height", "1.75", root);
                writer.setStyle("color", "#1f2c38", root);
                writer.setStyle("font-family", "Arial, sans-serif", root);
                writer.setStyle("padding", "8px", root);
                writer.setStyle("box-sizing", "border-box", root);
                writer.setStyle("border", "1px solid #c9dae8", root);
                writer.setStyle("border-radius", "8px", root);
                writer.setStyle("background", "#f8fafd", root);
                writer.setStyle("outline", "none", root);
                writer.setStyle("transition", "border-color 0.2s ease", root);
                writer.setStyle("min-width", "300px", root);
              });
            }
          }}
          onChange={(_event, editor) => onChange?.(cleanForDB(editor.getData()))}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Modal: imagen por URL / galería */}
      {urlModal.open && (
        <InsertImageUrlModal
          siglaCurso={siglaCurso}
          initialTab={urlModal.tab ?? 0}
          onInsert={handleImageUrlInsert}
          onClose={() => setUrlModal({ open: false, tab: 0 })}
        />
      )}

      {/* Modal: fórmula LaTeX — onSave: (latex, type) => void */}
      {latexModal.open && (
        <MathEditModal
          latex={latexModal.latex}
          type={latexModal.type}
          onSave={handleLatexModalSave}
          onClose={handleLatexModalClose}
        />
      )}

      {/* Modal: subtítulo de entorno — onSave: (subtitulo) => void
          key fuerza remonte limpio al cambiar de tipo */}
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

export default MathTextEditorInline;