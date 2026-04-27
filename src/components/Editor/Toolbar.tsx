// src/components/Editor/extensions/TwoColumns.extension.tsx
import { Node, mergeAttributes } from "@tiptap/core";

// ── ColumnContent — nodo hijo de cada columna ─────────────────────────────────

export const ColumnContent = Node.create({
  name:     "columnContent",
  group:    "columnContent",
  content:  "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div[data-column]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-column": "", class: "col" }), 0];
  },
});

// ── TwoColumns — nodo contenedor ─────────────────────────────────────────────

const TwoColumnsNode = Node.create({
  name:      "twoColumns",
  group:     "block",
  content:   "columnContent columnContent",
  defining:  true,
  isolating: true,

  parseHTML() {
    return [{ tag: "div[data-two-columns]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-two-columns": "",
        class:              "two-col",
        style:              "display:grid;grid-template-columns:1fr 1fr;gap:1.5em;",
      }),
      0,
    ];
  },
  // Sin addNodeView — el CSS maneja el layout directamente
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