// src/components/Editor/extensions/TwoColumns.extension.tsx
/* eslint-disable react-refresh/only-export-components */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

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

// ── TwoColumns NodeView ───────────────────────────────────────────────────────

function TwoColumnsNodeView() {
  return (
    <NodeViewWrapper
      as="div"
      style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "1.5em",
        margin:              "10px 0",
        border:              "1.5px dashed #e2e8f0",
        borderRadius:        "8px",
        padding:             "18px 12px 10px",
        background:          "#fafafa",
        position:            "relative",
      }}
    >
      {/* Label decorativo — no editable */}
      <div
        contentEditable={false}
        style={{
          position:      "absolute",
          top:           -11,
          left:          12,
          background:    "#f1f5f9",
          border:        "1px solid #e2e8f0",
          borderRadius:  "4px",
          padding:       "1px 8px",
          fontSize:      10,
          color:         "#94a3b8",
          fontWeight:    600,
          letterSpacing: "0.05em",
          userSelect:    "none",
        }}
      >
        DOS COLUMNAS
      </div>

      {/* El contenido (dos columnContent) lo renderiza TipTap aquí */}
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

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
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwoColumnsNodeView);
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