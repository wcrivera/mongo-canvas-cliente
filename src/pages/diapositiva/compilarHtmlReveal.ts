// src/pages/diapositiva/compilarHtmlReveal.ts
//
// Compila el HTML generado por CKEditor al formato HTML completo de Reveal.js.
// Procesa entornos matemáticos del MathBlockPlugin (section.math-environment)
// y el formato legacy (data-math-block).

// ── Colores de entornos ───────────────────────────────────────────────────────

type TipoEntorno =
  | "definicion"
  | "teorema"
  | "proposicion"
  | "corolario"
  | "lema"
  | "ejemplo"
  | "demostracion"
  | "observacion";

const ENTORNO_LABELS: Record<TipoEntorno, string> = {
  definicion: "Definición",
  teorema: "Teorema",
  proposicion: "Proposición",
  corolario: "Corolario",
  lema: "Lema",
  ejemplo: "Ejemplo",
  demostracion: "Demostración",
  observacion: "Observación",
};

const ENTORNO_COLORS: Record<
  TipoEntorno,
  { border: string; bg: string; label: string }
> = {
  definicion: {
    border: "#2563b4",
    bg: "transparent",
    label: "#1d4ed8",
  },
  teorema: { border: "#15803d", bg: "transparent", label: "#166534" },
  proposicion: {
    border: "#7c3aed",
    bg: "transparent",
    label: "#6d28d9",
  },
  corolario: {
    border: "#0284c7",
    bg: "transparent",
    label: "#0369a1",
  },
  lema: { border: "#0d9488", bg: "transparent", label: "#0f766e" },
  ejemplo: { border: "#ea580c", bg: "transparent", label: "#c2410c" },
  demostracion: {
    border: "#94a3b8",
    bg: "transparent",
    label: "#475569",
  },
  observacion: {
    border: "#ca8a04",
    bg: "transparent",
    label: "#92400e",
  },
};

// ── Transformar HTML de CKEditor para Reveal ──────────────────────────────────
//
// Exportada para que SlidePreview y transformarHtmlReveal.ts puedan usarla.
//
// Procesa dos formatos:
//   Nuevo:  <section class="math-environment" data-tipo="teorema">
//   Legacy: <div data-math-block="" data-tipo="teorema" ...>

export const transformarHtmlParaReveal = (html: string): string => {
  if (!html || html.trim() === "" || html === "<p></p>") return "";

  let result = html;

  // ── 1. Formato nuevo: section.math-environment ────────────────────────────
  result = result.replace(
    /<div[^>]*class="math-environment"[^>]*data-tipo="([^"]*)"[^>]*>([\s\S]*?)<\/div>/gi,
    (_match, tipo, inner) => {
      const colors =
        ENTORNO_COLORS[tipo as TipoEntorno] ?? ENTORNO_COLORS.definicion;
      const label = ENTORNO_LABELS[tipo as TipoEntorno] ?? tipo;

      const titleMatch = inner.match(
        /<h2[^>]*class="math-environment-title"[^>]*>([\s\S]*?)<\/h2>/i,
      );
      const titleText = titleMatch ? titleMatch[1].trim() : label;

      // const bodyMatch = inner.match(/<div[^>]*class="math-environment-body"[^>]*>([\s\S]*?)<\/div>/i);
      // const bodyHtml  = bodyMatch ? bodyMatch[1].trim() : inner;

      const bodyHtml = inner
        .replace(
          /<h2[^>]*class="math-environment-title"[^>]*>[\s\S]*?<\/h2>/gi,
          "",
        )
        .trim();

      return renderEntorno(colors, titleText, bodyHtml);
    },
  );

  return result;
};

// Helper: HTML con estilos inline para un entorno
const renderEntorno = (
  colors: { border: string; bg: string; label: string },
  tituloHtml: string,
  bodyHtml: string,
): string =>
  `<div style="border-left:4px solid ${colors.border};border-radius:6px;padding:0.5em 1em 0.7em 1em;margin:0.5em 0;">` +
  `<h4 style="color:${colors.label};font-family:'Cormorant SC',serif;font-weight:700;font-size:1.1em;;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:0.3em;">${tituloHtml}</h4>` +
  `<div>${bodyHtml}</div>` +
  `</div>`;

// ── Layouts ───────────────────────────────────────────────────────────────────
// Sin titulo — el contenido ocupa todo el slide.
