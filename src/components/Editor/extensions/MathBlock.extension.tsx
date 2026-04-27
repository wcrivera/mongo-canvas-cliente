// src/components/Editor/extensions/MathBlock.extension.tsx
/* eslint-disable react-refresh/only-export-components */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type MathBlockType =
  | "definicion"
  | "teorema"
  | "proposicion"
  | "corolario"
  | "lema"
  | "ejemplo"
  | "demostracion"
  | "observacion";

export const MATH_BLOCK_LABELS: Record<MathBlockType, string> = {
  definicion:   "Definición",
  teorema:      "Teorema",
  proposicion:  "Proposición",
  corolario:    "Corolario",
  lema:         "Lema",
  ejemplo:      "Ejemplo",
  demostracion: "Demostración",
  observacion:  "Observación",
};

export const MATH_BLOCK_COLORS: Record<MathBlockType, { bg: string; border: string; title: string }> = {
  definicion:   { bg: "rgba(37,99,180,0.07)",   border: "#2563b4", title: "#1d4ed8" },
  teorema:      { bg: "rgba(21,128,61,0.07)",    border: "#15803d", title: "#166534" },
  proposicion:  { bg: "rgba(109,40,217,0.07)",   border: "#7c3aed", title: "#6d28d9" },
  corolario:    { bg: "rgba(2,132,199,0.07)",     border: "#0284c7", title: "#0369a1" },
  lema:         { bg: "rgba(13,148,136,0.07)",   border: "#0d9488", title: "#0f766e" },
  ejemplo:      { bg: "rgba(234,88,12,0.07)",    border: "#ea580c", title: "#c2410c" },
  demostracion: { bg: "rgba(100,116,139,0.06)",  border: "#94a3b8", title: "#475569" },
  observacion:  { bg: "rgba(202,138,4,0.08)",    border: "#ca8a04", title: "#92400e" },
};

// ── React NodeView ────────────────────────────────────────────────────────────

function MathBlockNodeView({ node, updateAttributes }: NodeViewProps) {
  const tipo           = node.attrs.tipo as MathBlockType;
  const subtitulo      = (node.attrs.subtitulo as string) ?? "";
  const colors         = MATH_BLOCK_COLORS[tipo] ?? MATH_BLOCK_COLORS.definicion;
  const label          = MATH_BLOCK_LABELS[tipo] ?? tipo;
  const isDemostracion = tipo === "demostracion";

  return (
    <NodeViewWrapper
      style={{
        borderLeft:   `4px solid ${colors.border}`,
        background:   colors.bg,
        borderRadius: "6px",
        padding:      "10px 14px",
        margin:       "10px 0",
        position:     "relative",
      }}
    >
      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
        <span style={{
          fontWeight: 700, fontSize: "0.82em", textTransform: "uppercase",
          letterSpacing: "0.05em", color: colors.title, flexShrink: 0, fontStyle: "normal",
        }}>
          {label}
        </span>
        <input
          value={subtitulo}
          onChange={(e) => updateAttributes({ subtitulo: e.target.value })}
          placeholder="(subtítulo opcional)"
          style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: "0.82em", color: "#475569", fontStyle: "italic",
            flex: 1, minWidth: 0,
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Contenido editable */}
      <NodeViewContent
        style={{
          fontSize:  "0.88em",
          lineHeight: 1.65,
          fontStyle: isDemostracion ? "italic" : "normal",
          flex: 1, minWidth: 0,
        }}
      />

      {/* ∎ para demostraciones */}
      {isDemostracion && (
        <div style={{ textAlign: "right", fontSize: "1.1em", color: "#64748b", userSelect: "none" }}>
          ∎
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ── Extensión TipTap ──────────────────────────────────────────────────────────

const MathBlockNode = Node.create({
  name:      "mathBlock",
  group:     "block",
  content:   "block+",
  defining:  true,
  isolating: false,

  addAttributes() {
    return {
      tipo: {
        default:    "definicion",
        parseHTML:  (el: HTMLElement) => el.getAttribute("data-tipo") ?? "definicion",
        renderHTML: (attrs) => ({ "data-tipo": attrs.tipo }),
      },
      subtitulo: {
        default:    "",
        parseHTML:  (el: HTMLElement) => el.getAttribute("data-subtitulo") ?? "",
        renderHTML: (attrs) => attrs.subtitulo ? { "data-subtitulo": attrs.subtitulo } : {},
      },
    };
  },

  parseHTML() {
    return [{
      tag: "div[data-math-block]",
      getAttrs: (el: HTMLElement) => ({
        tipo:      el.getAttribute("data-tipo")      ?? "definicion",
        subtitulo: el.getAttribute("data-subtitulo") ?? "",
      }),
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const tipo      = (HTMLAttributes["data-tipo"] as MathBlockType) ?? "definicion";
    const subtitulo = (HTMLAttributes["data-subtitulo"] as string)   ?? "";
    const label     = MATH_BLOCK_LABELS[tipo];
    const colors    = MATH_BLOCK_COLORS[tipo];

    const tituloHtml = subtitulo
      ? `${label} <span style="font-weight:400;text-transform:none;font-style:italic;">(${subtitulo})</span>`
      : label;

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-math-block": "",
        class: `math-block ${tipo}`,
      }),
      [
        "div",
        {
          class:           "math-block-title",
          style:           `font-weight:700;font-size:0.9em;letter-spacing:0.03em;margin-bottom:0.35em;text-transform:uppercase;color:${colors.title};`,
          contenteditable: "false",
          innerHTML:       tituloHtml,
        },
      ],
      [
        "div",
        { class: "math-block-body" },
        0,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockNodeView);
  },
});

// ── Comandos ──────────────────────────────────────────────────────────────────

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      insertMathBlock: (tipo: MathBlockType) => ReturnType;
    };
  }
}

export const MathBlockExtension = MathBlockNode.extend({
  addCommands() {
    return {
      insertMathBlock:
        (tipo: MathBlockType) =>
        ({ commands }) =>
          commands.insertContent({
            type:    "mathBlock",
            attrs:   { tipo, subtitulo: "" },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});