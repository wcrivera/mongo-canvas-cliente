import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from "@tiptap/extension-mathematics";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import "katex/dist/katex.min.css";
import { useState, useCallback } from "react";
import { MathEditModal } from "./MathEditModal";
import { Toolbar } from "./Toolbar";
import styles from "./LatexEditor.module.css";

interface LatexEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
}

export function LatexEditor({
  initialContent = "",
  placeholder = "Escribe aquí… usa \\( ... \\) para fórmulas inline y \\[ ... \\] para bloques",
  onChange,
  minHeight = "180px",
}: LatexEditorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLatex, setEditingLatex] = useState("");
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<"inline" | "block">("inline");
  const [fullscreen, setFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Mathematics.configure({
        inlineOptions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick: (node: { attrs: Record<string, any> }, pos: number) => {
            setEditingLatex(String(node.attrs.latex ?? ""));
            setEditingPos(pos);
            setEditingType("inline");
            setModalOpen(true);
          },
        },
        blockOptions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick: (node: { attrs: Record<string, any> }, pos: number) => {
            setEditingLatex(String(node.attrs.latex ?? ""));
            setEditingPos(pos);
            setEditingType("block");
            setModalOpen(true);
          },
        },
        katexOptions: {
          throwOnError: false,
          macros: {
            "\\R": "\\mathbb{R}", // add a macro for the real numbers
            "\\N": "\\mathbb{N}", // add a macro for the natural numbers
          },
        },
      }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: styles.editorContent,
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
  });

  const handleSaveMath = useCallback(
    (latex: string) => {
      if (!editor) return;
      if (editingPos !== null) {
        editor
          .chain()
          .focus()
          .setNodeSelection(editingPos)
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              const node = tr.doc.nodeAt(editingPos);
              if (node)
                tr.setNodeMarkup(editingPos, undefined, {
                  ...node.attrs,
                  latex,
                });
            }
            return true;
          })
          .run();
      } else {
        if (editingType === "inline") {
          editor.chain().focus().insertInlineMath({ latex }).run();
        } else {
          editor.chain().focus().insertBlockMath({ latex }).run();
        }
      }
      setModalOpen(false);
      setEditingPos(null);
    },
    [editor, editingPos, editingType],
  );

  const insertInlineMath = useCallback(() => {
    setEditingLatex("");
    setEditingPos(null);
    setEditingType("inline");
    setModalOpen(true);
  }, []);

  const insertBlockMath = useCallback(() => {
    setEditingLatex("");
    setEditingPos(null);
    setEditingType("block");
    setModalOpen(true);
  }, []);

  return (
    <div className={`${styles.wrapper} ${fullscreen ? styles.fullscreen : ""}`}>
      <Toolbar
        editor={editor}
        onInsertInlineMath={insertInlineMath}
        onInsertBlockMath={insertBlockMath}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((v) => !v)}
      />
      <div className={styles.editorArea} style={{ minHeight }}>
        <EditorContent editor={editor} />
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
}
