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

import { MathPlugin, } from "./plugins/MathPlugin";
import { InlineTablePlugin } from "./plugins/InlineTablePlugin";
import { ImageUploadPlugin, type ImageUploadPluginConfig } from "./plugins/ImageUploadPlugin";
import { InlineStylesPlugin } from "./plugins/InlineStylesPlugin";
import { InlineHeadingPlugin } from "./plugins/InlineHeadingPlugin";
import { InsertImageUrlPlugin, type InsertImageUrlPluginConfig } from "./plugins/InsertImageUrlPlugin";
import { InsertImageUrlModal } from "./components/InsertImageUrlModal";
import { MathEditModal } from "./components/MathEditModal";

interface EditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
  siglaCurso?: string;
}

interface ModalState {
  open: boolean;
  latex: string;
  type: "inline" | "block";
  onSave: ((latex: string, type: "inline" | "block") => void) | null;
}

interface UrlModalState {
  open: boolean;
  tab?: 0 | 1;
}

const MODAL_CLOSED: ModalState = {
  open: false,
  latex: "",
  type: "inline",
  onSave: null,
};

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
  InlineStylesPlugin,
  InlineHeadingPlugin,
];

const TOOLBAR_ITEMS = [
  "undo", "redo", "|",
  "heading", "|",
  "bold", "italic", "underline", "strikethrough", "code", "|",
  "fontSize", "fontColor", "|",
  "alignment", "|",
  "link", "bulletedList", "numberedList", "blockQuote", "|",
  "insertTable",
  "insertImageMenu",
  "insertMath",
  "|",
  "sourceEditing",
];

const MathTextEditor: React.FC<EditorProps> = ({
  initialData = "",
  onChange,
  siglaCurso = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const [urlModal, setUrlModal] = useState<UrlModalState>({ open: false });

  const handleInsertUrl = useCallback(() => {
    setUrlModal({ open: true, tab: 0 });
  }, []);

  const handleInsertGaleria = useCallback(() => {
    setUrlModal({ open: true, tab: 1 });
  }, []);

  const handleImageUrlInsert = useCallback((url: string, alt: string) => {
    if (editorInstance) {
      editorInstance.execute("insertImageFromUrl", { url, alt });
      editorInstance.editing.view.focus();
    }
    setUrlModal({ open: false });
  }, [editorInstance]);

  const handleInsert = useCallback(() => {
    setModal({ open: true, latex: "", type: "inline", onSave: null });
  }, []);

  const handleEdit = useCallback((
    latex: string,
    type: "inline" | "block",
    onSave: (newLatex: string, newType: "inline" | "block") => void
  ) => {
    setModal({ open: true, latex, type, onSave });
  }, []);

  const handleModalSave = useCallback((latex: string, type: "inline" | "block") => {
    if (modal.onSave) {
      modal.onSave(latex, type);
    } else if (editorInstance) {
      const command = type === "inline" ? "insertMathInline" : "insertMathBlock";
      editorInstance.execute(command, { latex });
      editorInstance.editing.view.focus();
    }
    setModal(MODAL_CLOSED);
  }, [modal, editorInstance]);

  const handleModalClose = useCallback(() => {
    setModal(MODAL_CLOSED);
  }, []);

  const editorConfig: EditorConfig = {
    licenseKey: "GPL",
    plugins: BASE_PLUGINS,
    toolbar: {
      items: TOOLBAR_ITEMS,
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        { model: "paragraph", title: "Párrafo", class: "ck-heading_paragraph" },
        { model: "heading1", view: "h1", title: "Título 1", class: "ck-heading_heading1" },
        { model: "heading2", view: "h2", title: "Título 2", class: "ck-heading_heading2" },
        { model: "heading3", view: "h3", title: "Título 3", class: "ck-heading_heading3" },
      ],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    image: {
      toolbar: ["imageTextAlternative"],
      resizeUnit: "px",
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
      onInsertUrl:     handleInsertUrl,
      onInsertGaleria: handleInsertGaleria,
    } satisfies InsertImageUrlPluginConfig,
    math: {
      onInsert: handleInsert,
      onEdit: handleEdit,
    },
  };

  return (
    <div className={`editor-wrapper ${isFocused ? "focused" : ""}`}>
      <div className="p-3">
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={initialData}
          onReady={(editor) => {
            setEditorInstance(editor);
            const root = editor.editing.view.document.getRoot();
            if (root) {
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.setStyle("min-height", "50vh", root);
                writer.setStyle("font-size", "16px", root);
              });
            }
          }}
          onChange={(_event, editor) => {
            onChange?.(editor.getData());
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>

      {urlModal.open && (
        <InsertImageUrlModal
          siglaCurso={siglaCurso}
          initialTab={urlModal.tab ?? 0}
          onInsert={handleImageUrlInsert}
          onClose={() => setUrlModal({ open: false, tab: 0 })}
        />
      )}

      {modal.open && (
        <MathEditModal
          latex={modal.latex}
          type={modal.type}
          onSave={handleModalSave}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default MathTextEditor;