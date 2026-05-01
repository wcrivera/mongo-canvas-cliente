// src/pages/diapositiva/compilarHtmlReveal.ts
//
// Compila el HTML generado por CKEditor (con estilos inline) al formato
// HTML completo de Reveal.js listo para publicar en Canvas.
//
// A diferencia de la versión anterior (que usaba TipTap), CKEditor ya
// emite HTML limpio con estilos inline — no se necesita transformación.

import type { ISlide, IConfigReveal, Layout } from "./EditorDiapositiva";
import { REVEAL_STYLES } from "./revealStyles";

// ── Escape helpers ────────────────────────────────────────────────────────────

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── Layouts ───────────────────────────────────────────────────────────────────
// CKEditor ya produce HTML con estilos inline, no necesita transformación.
// Solo estructuramos el HTML en el layout correspondiente de Reveal.

const generarLayout = (
  layout:          Layout,
  titulo:          string,
  contenido:       string,
  contenidoDerecho: string,
  contenidoRaw:    string,
): string => {
  const tituloHtml = titulo ? `<h2>${titulo}</h2>` : "";

  switch (layout) {
    case "titulo":
      return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
          <h2 style="font-size:1.8em;">${titulo}</h2>
        </div>`;

    case "titulo_contenido":
      return `${tituloHtml}<div>${contenido}</div>`;

    case "dos_columnas":
      return `
        ${tituloHtml}
        <div class="two-col">
          <div class="col">${contenido}</div>
          <div class="col">${contenidoDerecho}</div>
        </div>`;

    case "titulo_imagen":
      return `${tituloHtml}<div>${contenido}</div>`;

    case "codigo":
      return `
        ${tituloHtml}
        <pre><code class="hljs">${escapeHtml(contenidoRaw)}</code></pre>`;

    case "definicion":
      return `${tituloHtml}${contenido}`;

    case "libre":
    default:
      return contenido;
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
    slide.titulo            ?? "",
    slide.contenido         ?? "",
    slide.contenido_derecho ?? "",
    slide.contenido         ?? "",
  );

  return `
    <section data-menu-title="${escapeAttr(slide.titulo || `Slide ${slide.pagina}`)}"${fondoAttr}>
      ${inner}
      ${notas}
    </section>`;
};

// ── Función principal ─────────────────────────────────────────────────────────

export const compilarHtmlReveal = (
  slides: ISlide[],
  config: IConfigReveal,
): string => {
  const secciones  = slides.map(compilarSeccion).join("\n");

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
  ${menuCss}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    ${REVEAL_STYLES}

    /* Estilos inline de CKEditor — asegurar que se respetan dentro de Reveal */
    .reveal strong  { font-weight: bold; }
    .reveal em      { font-style: italic; }
    .reveal u       { text-decoration: underline; }
    .reveal s       { text-decoration: line-through; }
    .reveal table   { border-collapse: collapse; width: 100%; }
    .reveal td, .reveal th {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      vertical-align: top;
    }
    .reveal th {
      font-weight: 600;
      background: #f1f5f9;
    }
    .reveal img     { max-width: 100%; height: auto; }
    .reveal figure  { margin: 0.75em auto; text-align: center; }
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
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

  <script>
    Reveal.initialize({
      hash: true,
      transition: '${config.transicion ?? "slide"}',
      plugins: [RevealNotes, RevealHighlight, RevealMath.KaTeX, ${config.menu ? "RevealMenu" : ""}],
      ${config.menu ? `menu: { side: 'left', width: 'normal', numbers: false, markers: true }` : ""},
    });
  </script>
</body>
</html>`;
};

// ── Miniatura para el editor ──────────────────────────────────────────────────
// Versión ligera del HTML para renderizar en los iframes de previsualización

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
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script>
    Reveal.initialize({
      hash: false,
      controls: false,
      progress: false,
      keyboard: false,
      overview: false,
      touch: false,
      embedded: true,
      plugins: [],
    });
  </script>
</body>
</html>`;
};