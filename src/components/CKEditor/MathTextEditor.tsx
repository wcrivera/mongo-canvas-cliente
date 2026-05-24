import { useState, useCallback } from "react";
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
  type EditorConfig,
  type ViewDowncastWriter,
  type Editor,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

import { MathPlugin }                                              from "./plugins/MathPlugin";
import { InlineTablePlugin }                                       from "./plugins/InlineTablePlugin";
import { ImageUploadPlugin, type ImageUploadPluginConfig }         from "./plugins/ImageUploadPlugin";
import { InlineStylesPlugin }                                      from "./plugins/InlineStylesPlugin";
import { InlineHeadingPlugin }                                     from "./plugins/InlineHeadingPlugin";
import { InsertImageUrlPlugin, type InsertImageUrlPluginConfig }   from "./plugins/InsertImageUrlPlugin";
import { MathBlockPlugin, type MathBlockPluginConfig, type TipoEntorno } from "./plugins/MathBlockPlugin";
import { InsertImageUrlModal }                                     from "./components/InsertImageUrlModal";
import MathEditModal                                               from "./components/MathEditModal";
import MathBlockModal                                              from "./components/MathBlockModal";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface EditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
  siglaCurso?: string;
}

// Estado del modal de fórmulas LaTeX
interface LatexModalState {
  open: boolean;
  latex: string;
  type: "inline" | "block";
  onSave: ((latex: string, type: "inline" | "block") => void) | null;
}

// Estado del modal de imagen
interface UrlModalState {
  open: boolean;
  tab?: 0 | 1;
}

// Estado del modal de entornos matemáticos
interface EnvModalState {
  open: boolean;
  tipo: TipoEntorno;
  subtituloActual: string;
  modoInsertar: boolean;
  onSave: ((subtitulo: string) => void) | null;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const LATEX_MODAL_CLOSED: LatexModalState = {
  open: false, latex: "", type: "inline", onSave: null,
};

const ENV_MODAL_CLOSED: EnvModalState = {
  open: false, tipo: "definicion", subtituloActual: "", modoInsertar: true, onSave: null,
};

const BASE_PLUGINS = [
  Essentials, Paragraph, Bold, Italic, Underline, Strikethrough,
  Heading, Link, List, BlockQuote, Alignment, FontSize, FontColor,
  Code, Table, TableToolbar, SourceEditing,
  Image, ImageToolbar, ImageUpload, ImageResize, ImageResizeEditing,
  ImageResizeHandles, ImageInsert,
  InlineTablePlugin,
  ImageUploadPlugin,
  InsertImageUrlPlugin,
  MathPlugin,
  MathBlockPlugin,
  InlineStylesPlugin,
  InlineHeadingPlugin,
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
  "|",
  "link",
  "bulletedList",
  "numberedList",
  "blockQuote",
  "|",
  "insertTable",
  "insertImageMenu",
  "insertMath",
  "insertFragment",
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
}) => {
  const [isFocused,      setIsFocused]  = useState(false);
  const [latexModal,     setLatexModal] = useState<LatexModalState>(LATEX_MODAL_CLOSED);
  const [editorInstance, setEditor]     = useState<Editor | null>(null);
  const [urlModal,       setUrlModal]   = useState<UrlModalState>({ open: false });
  const [envModal,       setEnvModal]   = useState<EnvModalState>(ENV_MODAL_CLOSED);

  // ── Handlers imagen ────────────────────────────────────────────────────────

  const handleInsertUrl = useCallback(() => setUrlModal({ open: true, tab: 0 }), []);
  const handleInsertGaleria = useCallback(() => setUrlModal({ open: true, tab: 1 }), []);

  const handleImageUrlInsert = useCallback((url: string, alt: string) => {
    if (editorInstance) {
      editorInstance.execute("insertImageFromUrl", { url, alt });
      editorInstance.editing.view.focus();
    }
    setUrlModal({ open: false });
  }, [editorInstance]);

  // ── Handlers fórmulas LaTeX ────────────────────────────────────────────────

  // Llamado desde el botón f(x) → abrir modal vacío
  const handleInsertMath = useCallback(() => {
    setLatexModal({ open: true, latex: "", type: "inline", onSave: null });
  }, []);

  // Llamado desde el click en una fórmula existente → abrir modal con latex actual
  const handleEditMath = useCallback((
    latex: string,
    type: "inline" | "block",
    onSave: (newLatex: string, newType: "inline" | "block") => void,
  ) => {
    setLatexModal({ open: true, latex, type, onSave });
  }, []);

  // Guardar desde MathEditModal
  // Firma: (latex: string, type: "inline" | "block") => void
  const handleLatexModalSave = useCallback((
    latex: string,
    type: "inline" | "block",
  ) => {
    if (latexModal.onSave) {
      // Editar existente: delegar al callback que viene del click handler del plugin
      latexModal.onSave(latex, type);
    } else if (editorInstance) {
      // Insertar nuevo: ejecutar comando
      const cmd = type === "inline" ? "insertMathInline" : "insertMathBlock";
      editorInstance.execute(cmd, { latex });
      editorInstance.editing.view.focus();
    }
    setLatexModal(LATEX_MODAL_CLOSED);
  }, [latexModal, editorInstance]);

  const handleLatexModalClose = useCallback(() => setLatexModal(LATEX_MODAL_CLOSED), []);

  // ── Handlers entornos matemáticos ──────────────────────────────────────────

  const handleEditSubtitulo = useCallback((
    tipo: TipoEntorno,
    subtituloActual: string,
    onSave: (nuevoSubtitulo: string) => void,
  ) => {
    setEnvModal({ open: true, tipo, subtituloActual, modoInsertar: subtituloActual === "", onSave });
  }, []);

  // Guardar desde MathBlockModal
  // Firma: (subtitulo: string) => void
  const handleEnvModalSave = useCallback((subtitulo: string) => {
    envModal.onSave?.(subtitulo);
    setEnvModal(ENV_MODAL_CLOSED);
  }, [envModal]);

  const handleEnvModalClose = useCallback(() => setEnvModal(ENV_MODAL_CLOSED), []);

  // ── Config del editor ──────────────────────────────────────────────────────

  const editorConfig = {
    licenseKey: "GPL",
    plugins: BASE_PLUGINS,
    toolbar: { items: TOOLBAR_ITEMS, shouldNotGroupWhenFull: true },
    heading: {
      options: [
        { model: "paragraph", title: "Párrafo",   class: "ck-heading_paragraph"  },
        { model: "heading1",  view: "h1", title: "Título 1", class: "ck-heading_heading1" },
        { model: "heading2",  view: "h2", title: "Título 2", class: "ck-heading_heading2" },
        { model: "heading3",  view: "h3", title: "Título 3", class: "ck-heading_heading3" },
      ],
    },
    table:  { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
    image:  {
      toolbar: ["imageTextAlternative"],
      resizeUnit: "px",
      insert: { type: "auto", integrations: ["insertImageViaUrl", "upload"] },
    },
    // imageUpload es clave custom del plugin, no existe en EditorConfig → cast al final
    imageUpload: {
      siglaCurso,
      backendUrl: import.meta.env.VITE_BACKEND_URL as string,
      token: sessionStorage.getItem("auth_token") ?? "",
    } satisfies ImageUploadPluginConfig,
    insertImageUrl: {
      onInsertUrl:     handleInsertUrl,
      onInsertGaleria: handleInsertGaleria,
    } satisfies InsertImageUrlPluginConfig,
    math: {
      onInsert: handleInsertMath,
      onEdit:   handleEditMath,
    },
    mathBlock: {
      onEditSubtitulo: handleEditSubtitulo,
    } satisfies MathBlockPluginConfig,
  } as unknown as EditorConfig;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`editor-wrapper ${isFocused ? "focused" : ""}`}>
      <div className="p-3">
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={initialData}
          onReady={(editor) => {
            setEditor(editor);
            const root = editor.editing.view.document.getRoot();
            if (root) {
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.setStyle("min-height", "150px", root);
                writer.setStyle("font-size", "16px", root);
              });
            }
          }}
          onChange={(_event, editor) => onChange?.(editor.getData())}
          onFocus={() => setIsFocused(true)}
          onBlur={()  => setIsFocused(false)}
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

export default MathTextEditor;