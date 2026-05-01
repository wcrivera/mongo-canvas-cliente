// src/components/CKEditor/CKEditorField.tsx
import { useState, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials, Paragraph, Heading,
  Bold, Italic, Underline, Strikethrough,
  Subscript, Superscript,
  List, ListProperties,
  Alignment,
  Link,
  CodeBlock, Code,
  BlockQuote,
  Table, TableToolbar, TableCellProperties, TableProperties,
  FontColor, FontBackgroundColor, FontSize,
  Image, ImageUpload, ImageCaption, ImageStyle, ImageToolbar,
  Base64UploadAdapter,
  SourceEditing,
  HorizontalLine,
  Indent, IndentBlock,
  RemoveFormat,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, ToggleButtonGroup, ToggleButton,
  IconButton, Tooltip,
} from "@mui/material";
import FunctionsIcon from "@mui/icons-material/Functions";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

// import { MathPlugin }    from "./plugins/MathPlugin";
// import { InlineColumns } from "./plugins/InlineColumns";
// import { InlineTable }   from "./plugins/InlineTable";
// import { InlineImage }   from "./plugins/InlineImage";

import styles from "./CKEditorField.module.css";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialContent?: string;
  onChange?:       (html: string) => void;
  placeholder?:    string;
  minHeight?:      string;
  disabled?:       boolean;
}

// ─── Modal LaTeX ──────────────────────────────────────────────────────────────

const ModalLatex = ({
  open,
  onClose,
  onInsert,
}: {
  open:     boolean;
  onClose:  () => void;
  onInsert: (latex: string, tipo: "inline" | "block") => void;
}) => {
  const [latex, setLatex] = useState("");
  const [tipo,  setTipo]  = useState<"inline" | "block">("inline");

  const handleInsert = () => {
    if (!latex.trim()) return;
    onInsert(latex.trim(), tipo);
    setLatex("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#4A6D8C", color: "white", py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <FunctionsIcon />
        Insertar fórmula LaTeX
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <div className="flex flex-col gap-4">
          <ToggleButtonGroup
            value={tipo} exclusive
            onChange={(_, v) => v && setTipo(v)}
            size="small"
          >
            <ToggleButton value="inline" sx={{ fontSize: "0.75rem", px: 2 }}>
              Inline \( ... \)
            </ToggleButton>
            <ToggleButton value="block" sx={{ fontSize: "0.75rem", px: 2 }}>
              Bloque \[ ... \]
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Código LaTeX"
            placeholder="ej: \frac{a}{b} o \int_0^1 f(x)\,dx"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            multiline rows={3} fullWidth autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleInsert(); }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontFamily: "monospace" } }}
          />

          {latex.trim() && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#4A6D8C" }}>
              Preview: {tipo === "inline" ? `\\(${latex}\\)` : `\\[${latex}\\]`}
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="text" sx={{ color: "#6793ba", borderRadius: 2 }}>Cancelar</Button>
        <Button onClick={handleInsert} variant="contained" disabled={!latex.trim()}
          sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
          Insertar (Ctrl+Enter)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const CKEditorField = ({
  initialContent = "",
  onChange,
  placeholder    = "Escribe aquí...",
  minHeight      = "180px",
  disabled       = false,
}: Props) => {
  // Usamos unknown y casteamos para evitar el problema del constructor protected
  const editorRef = useRef<unknown>(null);
  const [modalLatex, setModalLatex] = useState(false);

  const config = {
    licenseKey: "GPL" as const,

    plugins: [
      Essentials, Paragraph, Heading,
      Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
      List, ListProperties,
      Alignment,
      Link,
      CodeBlock, Code, BlockQuote,
      Table, TableToolbar, TableCellProperties, TableProperties,
      FontColor, FontBackgroundColor, FontSize,
      Image, ImageUpload, ImageCaption, ImageStyle, ImageToolbar,
      Base64UploadAdapter,
      SourceEditing,
      HorizontalLine, Indent, IndentBlock, RemoveFormat,
      // Plugins custom con estilos inline
    //   MathPlugin, InlineColumns, InlineTable, InlineImage,
    ],

    toolbar: {
      items: [
        "heading", "|",
        "bold", "italic", "underline", "strikethrough", "|",
        "subscript", "superscript", "|",
        "fontColor", "fontBackgroundColor", "|",
        "alignment", "|",
        "bulletedList", "numberedList", "indent", "outdent", "|",
        "link", "blockQuote", "code", "codeBlock", "|",
        "insertTable", "|",
        "uploadImage", "|",
        "horizontalLine", "|",
        "removeFormat", "|",
        "sourceEditing", "|",
        "undo", "redo",
      ],
      shouldNotGroupWhenFull: false,
    },

    heading: {
      options: [
        { model: "paragraph" as const, title: "Párrafo",  class: "ck-heading_paragraph" },
        { model: "heading1"  as const, title: "Título 1", class: "ck-heading_heading1",  view: "h1" },
        { model: "heading2"  as const, title: "Título 2", class: "ck-heading_heading2",  view: "h2" },
        { model: "heading3"  as const, title: "Título 3", class: "ck-heading_heading3",  view: "h3" },
      ],
    },

    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableCellProperties"],
    },

    image: {
      toolbar: ["imageStyle:inline", "imageStyle:block", "|", "imageTextAlternative", "toggleImageCaption"],
    },

    link: { addTargetToExternalLinks: true, defaultProtocol: "https://" },

    placeholder,
    initialData: initialContent,
  };

  // ── Handlers LaTeX ─────────────────────────────────────────────────────────

  const handleInsertLatex = (latex: string, tipo: "inline" | "block") => {
    const editor = editorRef.current as { commands: { execute: (name: string, opts: object) => void } } | null;
    if (!editor) return;
    editor.commands.execute(
      tipo === "inline" ? "insertInlineMath" : "insertBlockMath",
      { latex },
    );
  };

  const handleInsertColumns = () => {
    const editor = editorRef.current as { commands: { execute: (name: string) => void } } | null;
    if (!editor) return;
    editor.commands.execute("insertColumns");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper} style={{ "--min-height": minHeight } as React.CSSProperties}>

      {/* Botones extra */}
      <div className={styles.extraToolbar}>
        <Tooltip title="Insertar fórmula LaTeX">
          <IconButton
            size="small"
            onClick={() => setModalLatex(true)}
            disabled={disabled}
            sx={{
              borderRadius: 1.5, px: 1.5, py: 0.5,
              color: "#4A6D8C", border: "1px solid #d9e4ee",
              fontSize: "0.75rem", fontWeight: 600,
              "&:hover": { bgcolor: "#f0f4f8" },
            }}
          >
            <FunctionsIcon sx={{ fontSize: 16, mr: 0.5 }} />
            LaTeX
          </IconButton>
        </Tooltip>

        <Tooltip title="Insertar dos columnas">
          <IconButton
            size="small"
            onClick={handleInsertColumns}
            disabled={disabled}
            sx={{
              borderRadius: 1.5, px: 1.5, py: 0.5,
              color: "#4A6D8C", border: "1px solid #d9e4ee",
              fontSize: "0.75rem", fontWeight: 600,
              "&:hover": { bgcolor: "#f0f4f8" },
            }}
          >
            <ViewColumnIcon sx={{ fontSize: 16, mr: 0.5 }} />
            2 columnas
          </IconButton>
        </Tooltip>
      </div>

      {/* Editor */}
      <div
        className={styles.editorContainer}
        style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}
      >
        <CKEditor
          editor={ClassicEditor}
          config={config}
          onReady={(editor) => { editorRef.current = editor; }}
          onChange={(_event, editor) => {
            if (onChange) onChange((editor as { getData: () => string }).getData());
          }}
        />
      </div>

      <ModalLatex
        open={modalLatex}
        onClose={() => setModalLatex(false)}
        onInsert={handleInsertLatex}
      />
    </div>
  );
};

export default CKEditorField;