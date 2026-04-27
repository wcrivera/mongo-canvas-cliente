// src/components/Editor/extensions/TwoColumns.extension.tsx
/* eslint-disable react-refresh/only-export-components */
import { Node, mergeAttributes } from "@tiptap/core";

// ── Column — nodo hijo individual ────────────────────────────────────────────

export const ColumnContent = Node.create({
  name:     "columnContent",
  group:    "columnContent",
  content:  "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: "div[data-column]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-column": "",
        class: "col",
        style: "overflow:hidden;padding:6px;min-height:60px;",
      }),
      0,
    ];
  },

  // NodeView nativo (sin React): retorna dom + contentDOM
  // Así TipTap sabe exactamente dónde renderizar el contenido editable
  addNodeView() {
    return () => {
      const dom = document.createElement("div");
      dom.setAttribute("data-column", "");
      dom.className = "col";
      dom.style.overflow  = "hidden";
      dom.style.padding   = "6px";
      dom.style.minHeight = "60px";
      dom.style.flex      = "1";

      // contentDOM es el mismo div — TipTap pone el contenido aquí
      return { dom, contentDOM: dom };
    };
  },
});

// ── TwoColumns — nodo contenedor ─────────────────────────────────────────────

const TwoColumnsNode = Node.create({
  name:      "twoColumns",
  group:     "block",
  content:   "columnContent columnContent",
  defining:  true,
  isolating: false,

  parseHTML() {
    return [{ tag: "div[data-two-columns]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-two-columns": "",
        class: "two-col",
      }),
      0,
    ];
  },

  // NodeView nativo: el contenedor es un grid, los hijos (columnContent) van dentro
  addNodeView() {
    return () => {
      // Wrapper exterior visible con label
      const wrapper = document.createElement("div");
      wrapper.style.position   = "relative";
      wrapper.style.margin     = "10px 0";
      wrapper.style.border     = "1.5px dashed #e2e8f0";
      wrapper.style.borderRadius = "8px";
      wrapper.style.padding    = "18px 8px 8px";
      wrapper.style.background = "#fafafa";

      // Label "DOS COLUMNAS"
      const label = document.createElement("div");
      label.contentEditable = "false";
      label.textContent     = "DOS COLUMNAS";
      label.style.position      = "absolute";
      label.style.top           = "-11px";
      label.style.left          = "12px";
      label.style.background    = "#f1f5f9";
      label.style.border        = "1px solid #e2e8f0";
      label.style.borderRadius  = "4px";
      label.style.padding       = "1px 8px";
      label.style.fontSize      = "10px";
      label.style.color         = "#94a3b8";
      label.style.fontWeight    = "600";
      label.style.letterSpacing = "0.05em";
      label.style.userSelect    = "none";
      wrapper.appendChild(label);

      // contentDOM: div con grid — TipTap pone los columnContent aquí
      const contentDOM = document.createElement("div");
      contentDOM.style.display             = "grid";
      contentDOM.style.gridTemplateColumns = "1fr 1fr";
      contentDOM.style.gap                 = "1em";
      wrapper.appendChild(contentDOM);

      return { dom: wrapper, contentDOM };
    };
  },
});

// ── Comandos ──────────────────────────────────────────────────────────────────

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    twoColumns: {
      insertTwoColumns: () => ReturnType;
    };
  }
}

export const TwoColumnsExtension = TwoColumnsNode.extend({
  addCommands() {
    return {
      insertTwoColumns:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type:    "twoColumns",
            content: [
              { type: "columnContent", content: [{ type: "paragraph" }] },
              { type: "columnContent", content: [{ type: "paragraph" }] },
            ],
          }),
    };
  },
});