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
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { OrderedList } from "@tiptap/extension-list";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

// ── NodeView React para imagen ────────────────────────────────────────────
const ImageNodeView = ({ node, selected }: NodeViewProps) => {
  const { src, alt, title, width, align } = node.attrs as {
    src: string; alt?: string; title?: string;
    width?: string; align?: "left" | "center" | "right";
  };

  const alignStyle: Record<string, React.CSSProperties> = {
    left:   { textAlign: "left" },
    center: { textAlign: "center" },
    right:  { textAlign: "right" },
  };

  return (
    <NodeViewWrapper
      as="figure"
      style={{
        display: "block",
        margin: "0.6em 0",
        padding: 0,
        ...alignStyle[align ?? "left"],
      }}
      data-align={align ?? "left"}
    >
      <img
        src={src}
        alt={alt ?? ""}
        title={title ?? ""}
        style={{
          maxWidth: "100%",
          height: "auto",
          width: width ?? undefined,
          borderRadius: 8,
          outline: selected ? "3px solid #4A6D8C" : "none",
          display: "inline-block",
        }}
      />
    </NodeViewWrapper>
  );
};

// ── Extensión Image con figure + align + width ────────────────────────────
const CustomImage = Image.extend({
  // Renderiza como figure en el HTML exportado
  renderHTML({ HTMLAttributes }) {
    const align = (HTMLAttributes.align as string) ?? "left";
    const width = HTMLAttributes.width as string | undefined;
    const alignStyle: Record<string, string> = {
      left:   "text-align: left;",
      center: "text-align: center;",
      right:  "text-align: right;",
    };
    const figureStyle = alignStyle[align] ?? alignStyle.left;
    const imgStyle = width ? `width: ${width}; max-width: 100%; height: auto;` : "max-width: 100%; height: auto;";

    // Excluir align/width del img y ponerlos en el figure
    const imgAttrs = Object.fromEntries(
      Object.entries(HTMLAttributes as Record<string, unknown>)
        .filter(([k]) => k !== "align" && k !== "width")
    );
    return [
      "figure",
      { style: figureStyle, "data-align": align },
      ["img", { ...imgAttrs, style: imgStyle }],
    ];
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-align]",
        getAttrs: (el) => {
          const figure = el as HTMLElement;
          const img = figure.querySelector("img");
          if (!img) return false;

          // Extrae el width del style: "width: 350px; max-width: 100%..."
          const styleWidth = img.style.width;
          const width = (styleWidth && styleWidth !== "100%") ? styleWidth : (img.getAttribute("width") || null);

          return {
            src:   img.getAttribute("src"),
            alt:   img.getAttribute("alt") ?? "",
            title: img.getAttribute("title") ?? "",
            width,
            align: figure.getAttribute("data-align") ?? "left",
          };
        },
      },
      // Compatibilidad con <img> suelto legacy
      { tag: "img[src]" },
    ];
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          // Intenta leer del style inline primero (ej: "width: 350px;")
          const sw = el.style.width;
          if (sw && sw !== "100%" && !sw.startsWith("max")) return sw;
          return el.getAttribute("width") || null;
        },
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.width ? { width: attrs.width } : {},
      },
      align: {
        default: "left",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-align") || "left",
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.align ? { align: attrs.align } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
import "katex/dist/katex.min.css";
import { useState, useCallback, useRef, useEffect } from "react";
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
  placeholder = "Escribe aquí… usa f(x) para LaTeX inline y ∑ para bloques",
  onChange,
  minHeight = "180px",
}: LatexEditorProps) {
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingLatex, setEditingLatex] = useState("");
  const [editingPos,   setEditingPos]   = useState<number | null>(null);
  const [editingType,  setEditingType]  = useState<"inline" | "block">("inline");
  const [fullscreen,   setFullscreen]   = useState(false);
  const [showHtml,     setShowHtml]     = useState(false);
  const [htmlDraft,    setHtmlDraft]    = useState("");
  const showHtmlRef = useRef(false);
  useEffect(() => { showHtmlRef.current = showHtml; }, [showHtml]);

  // ── OrderedList extendido con listStyleType ──────────────────────────────
  const CustomOrderedList = OrderedList.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        listStyleType: {
          default: "decimal",
          parseHTML: (el: HTMLElement) => el.style.listStyleType || "decimal",
          renderHTML: (attrs: Record<string, string>) =>
            attrs.listStyleType && attrs.listStyleType !== "decimal"
              ? { style: `list-style-type: ${attrs.listStyleType}` }
              : {},
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ orderedList: false }),
      CustomOrderedList,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      CustomImage.configure({ inline: false, allowBase64: true }),
      Mathematics.configure({
        inlineOptions: {
          onClick: (node: { attrs?: Record<string, unknown> }, pos: number) => {
            setEditingLatex(String(node.attrs?.latex ?? ""));
            setEditingPos(pos);
            setEditingType("inline");
            setModalOpen(true);
          },
        },
        blockOptions: {
          onClick: (node: { attrs?: Record<string, unknown> }, pos: number) => {
            setEditingLatex(String(node.attrs?.latex ?? ""));
            setEditingPos(pos);
            setEditingType("block");
            setModalOpen(true);
          },
        },
        katexOptions: {
          throwOnError: false,
          macros: {
            "\\R": "\\mathbb{R}",
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\C": "\\mathbb{C}",
            "\\E": "\\mathbb{E}",
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
      const html = e.getHTML();
      onChange?.(html);
      if (showHtmlRef.current) {
        setHtmlDraft(html);
      }
    },
  });

  // ── Guardar fórmula ──────────────────────────────────────────────────────
  const handleSaveMath = useCallback(
    (latex: string, type: "inline" | "block") => {
      if (!editor) return;
      if (editingPos !== null) {
        editor
          .chain()
          .focus()
          .setNodeSelection(editingPos)
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              const node = tr.doc.nodeAt(editingPos);
              if (node) tr.setNodeMarkup(editingPos, undefined, { ...node.attrs, latex });
            }
            return true;
          })
          .run();
      } else {
        if (type === "inline") {
          editor.chain().focus().insertInlineMath({ latex }).run();
        } else {
          editor.chain().focus().insertBlockMath({ latex }).run();
        }
      }
      setModalOpen(false);
      setEditingPos(null);
    },
    [editor, editingPos],
  );

  // ── Toggle HTML ──────────────────────────────────────────────────────────
  const handleToggleHtml = useCallback(() => {
    if (!editor) return;
    if (!showHtml) {
      setHtmlDraft(editor.getHTML());
      setShowHtml(true);
    } else {
      setShowHtml(false);
    }
  }, [editor, showHtml]);

  const handleHtmlChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setHtmlDraft(val);
      editor?.commands.setContent(val);
      onChange?.(val);
    },
    [editor, onChange],
  );

  // ── Abrir modal LaTeX ────────────────────────────────────────────────────
  const openMathModal = useCallback((defaultType: "inline" | "block" = "inline") => {
    setEditingLatex("");
    setEditingPos(null);
    setEditingType(defaultType);
    setModalOpen(true);
  }, []);

  return (
    <div className={`${styles.wrapper} ${fullscreen ? styles.fullscreen : ""}`}>
      <Toolbar
        editor={editor}
        onInsertMath={openMathModal}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((v) => !v)}
        showHtml={showHtml}
        onToggleHtml={handleToggleHtml}
      />

      <div className={styles.editorArea} style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>

      {/* ── Panel HTML editable ── */}
      {showHtml && (
        <div className={styles.htmlPanel}>
          <textarea
            className={styles.htmlTextarea}
            value={htmlDraft}
            onChange={handleHtmlChange}
            spellCheck={false}
          />
        </div>
      )}

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