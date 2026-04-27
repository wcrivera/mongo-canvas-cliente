// src/pages/diapositiva/compilarHtmlReveal.ts
import { toCanvasHTML } from "../../components/Editor";
import type { ISlide, IConfigReveal, Layout } from "./EditorDiapositiva";

// ── Genera el HTML de una sección <section> de Reveal.js ─────────────────────

const compilarSeccion = (slide: ISlide): string => {
  const fondoAttr = slide.fondo ? ` data-background-color="${slide.fondo}"` : "";
  const notas     = slide.notas?.trim()
    ? `<aside class="notes">${slide.notas}</aside>`
    : "";

  const contenido = toCanvasHTML(slide.contenido ?? "");
  const contenidoDerecho = toCanvasHTML(slide.contenido_derecho ?? "");

  const inner = generarLayout(slide.layout, slide.titulo, contenido, contenidoDerecho, slide.contenido ?? "");

  return `
    <section data-menu-title="${escapeAttr(slide.titulo || `Slide ${slide.pagina}`)}"${fondoAttr}>
      ${inner}
      ${notas}
    </section>`;
};

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// ── Layouts ───────────────────────────────────────────────────────────────────

const generarLayout = (
  layout: Layout,
  titulo: string,
  contenido: string,
  contenidoDerecho: string,
  contenidoRaw: string,  // texto plano para código
): string => {
  const tituloHtml = titulo
    ? `<h2 style="font-size:1.4em;margin-bottom:0.5em;">${titulo}</h2>`
    : "";

  switch (layout) {

    case "titulo":
      return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
          <h2 style="font-size:1.8em;">${titulo}</h2>
        </div>`;

    case "titulo_contenido":
      return `
        ${tituloHtml}
        <div style="font-size:0.85em;text-align:left;line-height:1.6;">
          ${contenido}
        </div>`;

    case "dos_columnas":
      return `
        ${tituloHtml}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2em;font-size:0.82em;text-align:left;line-height:1.6;">
          <div>${contenido}</div>
          <div>${contenidoDerecho}</div>
        </div>`;

    case "titulo_imagen":
      return `
        ${tituloHtml}
        <div style="font-size:0.85em;text-align:left;">
          ${contenido}
        </div>`;

    case "codigo":
      return `
        ${tituloHtml}
        <pre style="font-size:0.7em;text-align:left;"><code class="hljs">${escapeHtml(contenidoRaw)}</code></pre>`;

    case "definicion":
      return `
        ${tituloHtml}
        <div style="
          background: rgba(74,109,140,0.1);
          border-left: 4px solid #4A6D8C;
          border-radius: 4px;
          padding: 1em 1.2em;
          font-size: 0.85em;
          text-align: left;
          line-height: 1.7;
        ">
          ${contenido}
        </div>`;

    case "libre":
    default:
      return contenido;
  }
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

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

  <!-- Reveal.js -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reset.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reveal.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/theme/${config.tema}.min.css" crossorigin="anonymous" />

  <!-- KaTeX -->
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

  <!-- Highlight.js (código) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

  <!-- Menú -->
  ${menuCss}

  <style>
    .reveal .slides { text-align: left; }
    .reveal h2 { text-align: left; }
    .reveal pre { box-shadow: none; width: 100%; }
    .reveal code { font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${secciones}
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reveal.js" crossorigin="anonymous"></script>
  ${menuPlugin}

  <script>
    Reveal.initialize({
      hash: true,
      transition: '${config.transicion}',
      ${menuConfig}
      plugins: ${pluginsArr},
    });

    // Highlight.js
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el);
    });
  </script>
</body>
</html>`;
};

// ── Para Canvas: genera el HTML de la Wiki Page con iframe fullscreen ─────────

export const compilarHtmlCanvasIframe = (data: {
  titulo:       string;
  file_url:     string;
  curso_nombre: string;
  clase_nombre: string;
  tema_nombre:  string;
}): string => {
  return `
<div style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:sans-serif;background-color:#f0f4f8;min-height:100vh;">

  <!-- Header -->
  <div style="background-color:#f47c3c;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
    <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:4px;">${data.curso_nombre} · ${data.clase_nombre}</div>
    <div style="font-size:18px;font-weight:500;color:white;margin-bottom:4px;">${data.titulo}</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.8);">${data.tema_nombre}</div>
  </div>

  <!-- Presentación 16:9 -->
  <div style="background:#000;border-radius:12px;overflow:hidden;position:relative;padding-top:56.25%;">
    <iframe
      id="slide-frame"
      src="${data.file_url}"
      style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
      allowfullscreen
      allow="fullscreen"
    ></iframe>
  </div>

  <!-- Botón pantalla completa -->
  <div style="text-align:center;margin-top:12px;">
    <button
      onclick="var f=document.getElementById('slide-frame');if(f.requestFullscreen)f.requestFullscreen();else if(f.webkitRequestFullscreen)f.webkitRequestFullscreen();"
      style="padding:8px 20px;border-radius:8px;background:#f47c3c;color:white;border:none;cursor:pointer;font-size:13px;font-family:sans-serif;font-weight:500;"
    >
      ⛶ Pantalla completa
    </button>
  </div>

</div>`;
};