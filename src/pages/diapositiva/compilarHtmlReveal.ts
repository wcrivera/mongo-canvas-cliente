// src/pages/diapositiva/compilarHtmlReveal.ts
//
// Compila el HTML generado por CKEditor al formato HTML completo de Reveal.js.
// Procesa entornos matemáticos del MathBlockPlugin (section.math-environment)
// y el formato legacy (data-math-block).

import type { ISlide, IConfigReveal, Layout } from "./EditorDiapositiva";
import { REVEAL_STYLES } from "./revealStyles";

// ── Escape helpers ────────────────────────────────────────────────────────────

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── Colores de entornos ───────────────────────────────────────────────────────

type TipoEntorno =
  | "definicion" | "teorema" | "proposicion" | "corolario"
  | "lema" | "ejemplo" | "demostracion" | "observacion";

const ENTORNO_LABELS: Record<TipoEntorno, string> = {
  definicion:   "Definición",
  teorema:      "Teorema",
  proposicion:  "Proposición",
  corolario:    "Corolario",
  lema:         "Lema",
  ejemplo:      "Ejemplo",
  demostracion: "Demostración",
  observacion:  "Observación",
};

const ENTORNO_COLORS: Record<TipoEntorno, { border: string; bg: string; label: string }> = {
  definicion:   { border: "#2563b4", bg: "rgba(37,99,180,0.07)",   label: "#1d4ed8" },
  teorema:      { border: "#15803d", bg: "rgba(21,128,61,0.07)",   label: "#166534" },
  proposicion:  { border: "#7c3aed", bg: "rgba(109,40,217,0.07)",  label: "#6d28d9" },
  corolario:    { border: "#0284c7", bg: "rgba(2,132,199,0.07)",   label: "#0369a1" },
  lema:         { border: "#0d9488", bg: "rgba(13,148,136,0.07)",  label: "#0f766e" },
  ejemplo:      { border: "#ea580c", bg: "rgba(234,88,12,0.07)",   label: "#c2410c" },
  demostracion: { border: "#94a3b8", bg: "rgba(100,116,139,0.06)", label: "#475569" },
  observacion:  { border: "#ca8a04", bg: "rgba(202,138,4,0.08)",   label: "#92400e" },
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
    /<section[^>]*class="math-environment"[^>]*data-tipo="([^"]*)"[^>]*>([\s\S]*?)<\/section>/gi,
    (_match, tipo, inner) => {
      const colors = ENTORNO_COLORS[tipo as TipoEntorno] ?? ENTORNO_COLORS.definicion;
      const label  = ENTORNO_LABELS[tipo as TipoEntorno] ?? tipo;

      const titleMatch = inner.match(/<h2[^>]*class="math-environment-title"[^>]*>([\s\S]*?)<\/h2>/i);
      const titleText  = titleMatch ? titleMatch[1].trim() : label;

      const bodyMatch = inner.match(/<div[^>]*class="math-environment-body"[^>]*>([\s\S]*?)<\/div>/i);
      const bodyHtml  = bodyMatch ? bodyMatch[1].trim() : inner;

      return renderEntorno(colors, titleText, bodyHtml);
    },
  );

  // ── 2. Formato legacy: div[data-math-block] ───────────────────────────────
  result = result.replace(
    /<div([^>]*data-math-block[^>]*)>([\s\S]*?)<\/div>/gi,
    (_match, attrs, inner) => {
      const tipoMatch      = attrs.match(/data-tipo="([^"]*)"/);
      const subtituloMatch = attrs.match(/data-subtitulo="([^"]*)"/);

      const tipo      = (tipoMatch?.[1] ?? "definicion") as TipoEntorno;
      const subtitulo = subtituloMatch?.[1] ?? "";
      const colors    = ENTORNO_COLORS[tipo] ?? ENTORNO_COLORS.definicion;
      const label     = ENTORNO_LABELS[tipo] ?? tipo;

      const tituloHtml = subtitulo.trim()
        ? `${label} <span style="font-weight:400;text-transform:none;font-style:italic;">(${subtitulo})</span>`
        : label;

      const bodyHtml = inner
        .replace(/<div[^>]*class="math-env-(?:body|inner)"[^>]*>/gi, "")
        .replace(/<\/div>/gi, "")
        .trim();

      return renderEntorno(colors, tituloHtml, bodyHtml);
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
  `<div style="border-left:4px solid ${colors.border};background:${colors.bg};border-radius:6px;padding:0.5em 1em 0.7em 1em;margin:0.5em 0;">` +
  `<div style="color:${colors.label};font-weight:700;font-size:0.85em;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:0.3em;">${tituloHtml}</div>` +
  `<div>${bodyHtml}</div>` +
  `</div>`;

// ── Layouts ───────────────────────────────────────────────────────────────────
// Sin titulo — el contenido ocupa todo el slide.

const generarLayout = (
  layout:           Layout,
  contenido:        string,
  contenidoDerecho: string,
): string => {
  const c  = transformarHtmlParaReveal(contenido);
  const cd = transformarHtmlParaReveal(contenidoDerecho);

  switch (layout) {
    case "dos_columnas":
      return `
        <div class="two-col">
          <div class="col">${c}</div>
          <div class="col">${cd}</div>
        </div>`;

    case "codigo":
      return `<pre><code class="hljs">${escapeHtml(contenido)}</code></pre>`;

    case "titulo_contenido":
    case "titulo_imagen":
    case "libre":
    default:
      return c;
  }
};

// ── Sección ───────────────────────────────────────────────────────────────────

const compilarSeccion = (slide: ISlide): string => {
  const fondoAttr = slide.fondo ? ` data-background-color="${slide.fondo}"` : "";
  const notas     = slide.notas?.trim()
    ? `<aside class="notes">${slide.notas}</aside>`
    : "";

  const inner = generarLayout(
    slide.layout,
    slide.contenido         ?? "",
    slide.contenido_derecho ?? "",
  );

  return `
    <section data-menu-title="${escapeAttr(`Slide ${slide.pagina}`)}"${fondoAttr}>
      ${inner}
      ${notas}
    </section>`;
};

// ── Función principal ─────────────────────────────────────────────────────────

export const compilarHtmlReveal = (
  slides: ISlide[],
  config: IConfigReveal,
): string => {
  const secciones = slides.map(compilarSeccion).join("\n");

  const menuPlugin = config.menu
    ? `<script src="https://cdn.jsdelivr.net/npm/reveal.js-menu@2.1.0/menu.js"></script>`
    : "";
  const menuCss = config.menu
    ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-menu@2.1.0/menu.css">`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentación</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/${config.tema}.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
  <link rel="stylesheet" href="https://manthano.cl/css/diapositivas.css">
  ${menuCss}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    ${REVEAL_STYLES}
    .reveal strong { font-weight: bold; }
    .reveal em     { font-style: italic; }
    .reveal u      { text-decoration: underline; }
    .reveal table  { border-collapse: collapse; width: 100%; }
    .reveal td, .reveal th { border: 1px solid #cbd5e1; padding: 6px 10px; vertical-align: top; }
    .reveal th     { font-weight: 600; background: #f1f5f9; }
    .reveal img    { max-width: 100%; height: auto; }
    .reveal figure { margin: 0.75em auto; text-align: center; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${secciones}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/math/math.js"></script>
  ${menuPlugin}
  <script>
    Reveal.initialize({
      hash: true,
      transition: '${config.transicion ?? "slide"}',
      plugins: [RevealNotes, RevealHighlight, RevealMath.KaTeX, ${config.menu ? "RevealMenu" : ""}],
      ${config.menu ? "menu: { side: 'left', width: 'normal', numbers: false, markers: true }," : ""}
    });
  </script>
</body>
</html>`;
};

// ── Miniatura para el editor ──────────────────────────────────────────────────

export const compilarHtmlMiniatura = (
  slides: ISlide[],
  config: IConfigReveal,
): string => {
  const secciones = slides.map(compilarSeccion).join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/${config.tema}.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://manthano.cl/css/diapositivas.css">
  <style>
    ${REVEAL_STYLES}
    body, html { margin: 0; padding: 0; overflow: hidden; }
    .reveal .slides section { font-size: 0.6em; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${secciones}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: false, 
      controls: false, 
      progress: false,
      keyboard: false, 
      overview: false, 
      touch: false,
      embedded: true, 
      center: false,
      width: 1280, 
      height: 800,
      margin: 0.05, 
      minScale: 0.05, 
      maxScale: 1.0,
      plugins: [],
    });
  </script>
</body>
</html>`;
};