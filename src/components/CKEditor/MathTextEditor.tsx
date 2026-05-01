import React, { useState } from "react";
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
  // Undo,
  Alignment,
  FontSize,
  FontColor,
  // Table,
  TableToolbar,
  // HorizontalLine,
  Code,
  type EditorConfig,
  type ViewDowncastWriter,
  type Editor,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import { TimestampPlugin } from "./plugins/TimestampPlugin";
import { MathEditModal } from "./components/MathEditModal";

interface EditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

const editorConfig: EditorConfig = {
  licenseKey: "GPL",
  plugins: [
    Essentials,
    Paragraph,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Paragraph,
    Heading,
    Link,
    List,
    BlockQuote,
    // Undo,
    Alignment,
    FontSize,
    FontColor,
    // Table,
    TableToolbar,
    // HorizontalLine,
    Code,
    TimestampPlugin,
  ],
  toolbar: {
    items: [
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
      // "horizontalLine",
      "|",
      "timestamp",
    ],
    shouldNotGroupWhenFull: true,
  },
  // table: {
  //   contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  // },
  heading: {
    options: [
      {
        model: "paragraph",
        title: "Paragraph",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
    ],
  },
  // placeholder: "Start writing your document here...",
};

const MathTextEditor: React.FC<EditorProps> = ({
  initialData = "<p>Welcome to the <strong>CKEditor 5</strong> rich text editor with the <em>Timestamp Plugin</em>. Click the <strong>Insert Timestamp</strong> button in the toolbar to add the current date and time.</p>",
  onChange,
}) => {
  const [editorData, setEditorData] = useState<string>(initialData);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleChange = (_event: unknown, editor: Editor) => {
    const data = editor.getData();
    setEditorData(data);
    onChange?.(data);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLatex, setEditingLatex] = useState("");
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<"inline" | "block">("inline");

  // const editorConfig: EditorConfig = {
  //   plugins: [ TimestampPlugin],
  //   toolbar: { items: ["timestamp"] },
  //   timestamp: {
  //     onOpen: () => setModalOpen(true),
  //   },
  // };

  const handleSaveMath = (latex: string) => {
    if (editingPos === null) return;

    const mathHTML = `<span class="math-inline" data-latex="${latex}">[${latex}]</span>`;

    // Insertar el HTML en la posición correcta
    setEditorData((prev) => {
      const before = prev.slice(0, editingPos);
      const after = prev.slice(editingPos);
      return before + mathHTML + after;
    });

    setModalOpen(false);
    setEditingPos(null);
  }

  return (
    <div className={`editor-wrapper ${isFocused ? "focused" : ""}`}>
      <div className="p-3">
        <CKEditor
          editor={ClassicEditor}
          config={
            {
              ...editorConfig,
              root: {
                initialData: editorData,
              },
              timestamp: {
                onOpen: () => setModalOpen(true),
              },
            } as EditorConfig & { timestamp: { onOpen: () => void } }
          }
          onChange={handleChange}
          onReady={(editor) => {
            // editor.isReadOnly = true

            // editor.enableReadOnlyMode("feature-id");

            const root = editor.editing.view.document.getRoot();
            if (root) {
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.setStyle(
                  //use max-height(for scroll) or min-height(static)
                  "height",
                  "50vh",
                  root,
                );
              });
              editor.editing.view.change((writer: ViewDowncastWriter) => {
                writer.setStyle(
                  //use max-height(for scroll) or min-height(static)
                  "font-size",
                  "18px",
                  root,
                );
              });
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>

      {modalOpen && (
        <MathEditModal
          latex={editingLatex}
          type={editingType}
          onSave={handleSaveMath}
          onClose={() => {
            setModalOpen(false);
            setEditingPos(null);
          }}
        />
      )}
    </div>
  );
};

export default MathTextEditor;
