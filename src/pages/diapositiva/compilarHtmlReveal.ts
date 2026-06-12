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
    bg: "rgba(37,99,180,0.07)",
    label: "#1d4ed8",
  },
  teorema: { border: "#15803d", bg: "rgba(21,128,61,0.07)", label: "#166534" },
  proposicion: {
    border: "#7c3aed",
    bg: "rgba(109,40,217,0.07)",
    label: "#6d28d9",
  },
  corolario: {
    border: "#0284c7",
    bg: "rgba(2,132,199,0.07)",
    label: "#0369a1",
  },
  lema: { border: "#0d9488", bg: "rgba(13,148,136,0.07)", label: "#0f766e" },
  ejemplo: { border: "#ea580c", bg: "rgba(234,88,12,0.07)", label: "#c2410c" },
  demostracion: {
    border: "#94a3b8",
    bg: "rgba(100,116,139,0.06)",
    label: "#475569",
  },
  observacion: {
    border: "#ca8a04",
    bg: "rgba(202,138,4,0.08)",
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

  // console.log(result)

  // ── 2. Formato legacy: div[data-math-block] ───────────────────────────────
  // result = result.replace(
  //   /<div([^>]*data-math-block[^>]*)>([\s\S]*?)<\/div>/gi,
  //   (_match, attrs, inner) => {
  //     const tipoMatch      = attrs.match(/data-tipo="([^"]*)"/);
  //     const subtituloMatch = attrs.match(/data-subtitulo="([^"]*)"/);

  //     const tipo      = (tipoMatch?.[1] ?? "definicion") as TipoEntorno;
  //     const subtitulo = subtituloMatch?.[1] ?? "";
  //     const colors    = ENTORNO_COLORS[tipo] ?? ENTORNO_COLORS.definicion;
  //     const label     = ENTORNO_LABELS[tipo] ?? tipo;

  //     const tituloHtml = subtitulo.trim()
  //       ? `${label} <span style="font-weight:400;text-transform:none;font-style:italic;">(${subtitulo})</span>`
  //       : label;

  //     const bodyHtml = inner
  //       .replace(/<div[^>]*class="math-env-(?:body|inner)"[^>]*>/gi, "")
  //       .replace(/<\/div>/gi, "")
  //       .trim();

  //     return renderEntorno(colors, tituloHtml, bodyHtml);
  //   },
  // );

  return result;
};

// Helper: HTML con estilos inline para un entorno
const renderEntorno = (
  colors: { border: string; bg: string; label: string },
  tituloHtml: string,
  bodyHtml: string,
): string =>
  `<div style="border-left:4px solid ${colors.border};background:${colors.bg};border-radius:6px;padding:0.5em 1em 0.7em 1em;margin:0.5em 0;">` +
  `<h4 style="color:${colors.label};font-weight:700;font-size:0.85em;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:0.3em;">${tituloHtml}</h4>` +
  `<div>${bodyHtml}</div>` +
  `</div>`;

// ── Layouts ───────────────────────────────────────────────────────────────────
// Sin titulo — el contenido ocupa todo el slide.
