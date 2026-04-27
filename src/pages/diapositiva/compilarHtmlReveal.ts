// src/pages/diapositiva/compilarHtmlReveal.ts
import type { ISlide, IConfigReveal, Layout } from "./EditorDiapositiva";
import { REVEAL_STYLES } from "./revealStyles";
import { transformarHtmlParaReveal } from "./transformarHtmlReveal";

// ── Escape helpers ────────────────────────────────────────────────────────────

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── Layouts ───────────────────────────────────────────────────────────────────

const generarLayout = (
  layout: Layout,
  titulo:           string,
  contenido:        string,
  contenidoDerecho: string,
  contenidoRaw:     string,
): string => {
  // Transformar HTML de TipTap a formato Reveal antes de insertar
  const html  = transformarHtmlParaReveal(contenido);
  const htmlD = transformarHtmlParaReveal(contenidoDerecho);

  const tituloHtml = titulo
    ? `<h2>${titulo}</h2>`
    : "";

  switch (layout) {

    case "titulo":
      return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
          <h2 style="font-size:1.8em;">${titulo}</h2>
        </div>`;

    case "titulo_contenido":
      return `${tituloHtml}<div>${html}</div>`;

    case "dos_columnas":
      return `
        ${tituloHtml}
        <div class="two-col">
          <div class="col">${html}</div>
          <div class="col">${htmlD}</div>
        </div>`;

    case "titulo_imagen":
      return `${tituloHtml}<div>${html}</div>`;

    case "codigo":
      return `
        ${tituloHtml}
        <pre><code class="hljs">${escapeHtml(contenidoRaw)}</code></pre>`;

    case "definicion":
      return `${tituloHtml}${html}`;

    case "libre":
    default:
      return html;
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
    slide.titulo       ?? "",
    slide.contenido    ?? "",
    slide.contenido_derecho ?? "",
    slide.contenido    ?? "",
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
  const secciones = slides.map(compilarSeccion).join("\n");

  const menuPlugin = config.menu
    ? `<script src="https://cdn.jsdelivr.net/npm/reveal.js-menu@2.1.0/menu.js"></script>`
    : "";

  const menuCss = config.menu
    ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-menu@2.1.0/menu.css" />`
    : "";

  const menuConfig = config.menu
    ? `
        menu: {
          side: 'left',
          width: 'normal',
          numbers: false,
          titleSelector: 'h1, h2, h3',
          markers: true,
          themes: true,
          themesPath: 'https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/theme/',
          transitions: true,
          openButton: true,
          keyboard: true,
          sticky: false,
        },`
    : "";

  const pluginsArr = config.menu ? "[ RevealMenu ]" : "[]";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Diapositivas</title>

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reset.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reveal.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/theme/${config.tema}.min.css" crossorigin="anonymous" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {
      delimiters: [
        {left:'$$',right:'$$',display:true},
        {left:'$',right:'$',display:false},
        {left:'\\\\(',right:'\\\\)',display:false},
        {left:'\\\\[',right:'\\\\]',display:true}
      ]
    });"
  ></script>

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/screenfull@5.2.0/dist/screenfull.min.js"></script>

  ${menuCss}

  <style>${REVEAL_STYLES}</style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${secciones}
    </div>
  </div>

  <button id="fs-btn" style="
    position:fixed;bottom:14px;right:14px;z-index:9999;
    background:rgba(0,0,0,0.5);color:white;
    border:1.5px solid rgba(255,255,255,0.3);border-radius:6px;
    padding:5px 11px;font-size:13px;cursor:pointer;
    font-family:sans-serif;transition:background 0.2s;
  ">⛶ Pantalla completa</button>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reveal.js" crossorigin="anonymous"></script>
  ${menuPlugin}

  <script>
    Reveal.initialize({
      hash:                 true,
      transition:           '${config.transicion}',
      backgroundTransition: 'slide',
      embedded:             false,
      keyboard:             true,
      controlsLayout:       'edges',
      center:               false,
      margin:               0.05,
      ${menuConfig}
      plugins: ${pluginsArr},
    });

    document.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });

    document.getElementById('fs-btn').addEventListener('click', function() {
      if (typeof screenfull !== 'undefined' && screenfull.isEnabled) {
        screenfull.request(document.documentElement);
      } else {
        var el = document.documentElement;
        if      (el.requestFullscreen)       el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      }
    });
    if (typeof screenfull !== 'undefined' && screenfull.isEnabled) {
      screenfull.on('change', function() {
        document.getElementById('fs-btn').style.display =
          screenfull.isFullscreen ? 'none' : 'block';
      });
    }
  </script>
</body>
</html>`;
};

// Re-export para uso en otros módulos
export { htmlComponente, COMPONENTES_LABELS, COMPONENTES_COLORS } from "./revealStyles";
export type { ComponenteMatematico } from "./revealStyles";