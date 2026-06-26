/**
 * mathUtils.ts
 *
 * Utilidades para manejar el contenido LaTeX almacenado en distintos formatos.
 *
 * FLUJO COMPLETO:
 *
 *   DB (guardado limpio)          Editor CKEditor           DB (guardar)
 *   \(...\)  o  \[...\]    →   normalizeForEditor()  →   CKEditor.getData()
 *   <span data-type="inline-math">  (Tiptap legado)         → \(...\) limpio automático
 *   <table> sin wrapper            (carga directa DB)        → sanitizado automático
 *
 *   DB  →  TiptapRenderer / Preview
 *   Cualquier formato  →  renderLatexInHtml()  →  KaTeX HTML
 *
 * PIPELINE DE ENTRADA AL EDITOR (normalizeForEditor):
 *   paso A → sanitizeHtml          (limpia HTML malformado: <div >, <h4>, etc.)
 *   paso 0 → sanitizeTables        (envuelve <table> desnudos en <figure class="table">)
 *   paso 1 → prepareForEditor      (convierte \(...\) y \[...\] a spans intermedios)
 *   paso 2 → prepareBlocksForEditor (convierte spans intermedios a divs para mathBlock)
 *
 * Para agregar soporte de un nuevo formato externo, añadir un paso más aquí.
 * Todos los editores heredan el cambio automáticamente.
 */

import katex from "katex";
import { KATEX_MACROS } from "./components/katexMacros";

// ── Helper interno ────────────────────────────────────────────────────────────

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}

// ── -1. Limpiar HTML malformado antes de cualquier otra transformación ────────
//
// Corrige problemas de HTML legacy que confunden el parser de CKEditor:
//   - <div > con espacio vacío → <div>
//   - <h4>, <h5>, <h6> → convertidos a <h3> porque CKEditor solo registra h1-h3
//     (a menos que heading4 esté en las opciones del editor)
//   - Atributos vacíos sobrantes de la migración

function sanitizeHtml(html: string): string {
  if (!html) return "";

  return html
    // <div > con espacio pero sin atributos → <div>
    .replace(/<div\s+>/g, "<div>")
    // <span > → <span>
    .replace(/<span\s+>/g, "<span>")
    // <h4> → <h3> (CKEditor solo registra h1-h3 por defecto)
    // Si heading4 está habilitado en editorConfig, eliminar esta línea
    .replace(/<h4([^>]*)>/gi, "<h3$1>")
    .replace(/<\/h4>/gi, "</h3>")
    // <h5>, <h6> → <h3>
    .replace(/<h[56]([^>]*)>/gi, "<h3$1>")
    .replace(/<\/h[56]>/gi, "</h3>");
}

// ── 0. Sanitizar tablas para el upcast de CKEditor ───────────────────────────
//
// Problema: HTML cargado directamente en MongoDB puede contener <table> sin el
// wrapper <figure class="table"> que el upcast nativo de CKEditor espera.
// Cuando CKEditor recibe un <table> desnudo, su modelo interno queda
// inconsistente y el editor se duplica o no permite edición.
//
// Solución: envolver cada <table> que NO esté ya dentro de un <figure class="table">
// en ese wrapper antes de pasarlo como initialData.
//
// También limpia atributos style/class/width/border del propio <table> porque
// CKEditor los ignora en el modelo y generan ruido en el upcast.

function sanitizeTables(html: string): string {
  if (!html || !html.includes("<table")) return html;

  // Marcador temporal para proteger tablas ya envueltas
  const MARKER = "\x00CK_WRAPPED\x00";

  // Paso 1: marcar los <figure class="table">...</figure> ya existentes
  let result = html.replace(
    /(<figure[^>]*class="[^"]*\btable\b[^"]*"[^>]*>)([\s\S]*?)(<\/figure>)/gi,
    (_match, open, inner, close) => `${MARKER}${open}${inner}${close}${MARKER}`,
  );

  // Paso 2: envolver <table> que quedaron sin wrapper
  // Capturamos <table ... > ... </table> completo con un regex no-greedy
  result = result.replace(
    /<table([\s\S]*?)<\/table>/gi,
    (match) => {
      // Si está dentro de un bloque marcado, no tocar
      if (match.startsWith(MARKER) || match.includes(MARKER)) return match;

      // Limpiar atributos de presentación del tag <table> de apertura
      const cleaned = match.replace(
        /^<table([^>]*)>/i,
        (_full, attrs: string) => {
          const cleanAttrs = attrs
            .replace(/\s*style="[^"]*"/gi, "")
            .replace(/\s*class="[^"]*"/gi, "")
            .replace(/\s*width="[^"]*"/gi, "")
            .replace(/\s*height="[^"]*"/gi, "")
            .replace(/\s*border="[^"]*"/gi, "")
            .replace(/\s*cellspacing="[^"]*"/gi, "")
            .replace(/\s*cellpadding="[^"]*"/gi, "")
            .replace(/\s*align="[^"]*"/gi, "");
          return `<table${cleanAttrs}>`;
        },
      );

      return `<figure class="table">${cleaned}</figure>`;
    },
  );

  // Paso 3: quitar marcadores temporales
  result = result.replace(new RegExp(MARKER, "g"), "");

  return result;
}

// ── 1. Preparar contenido para CKEditor ──────────────────────────────────────
//
// Convierte \(...\) y \[...\] de texto plano a elementos que el upcast
// de MathPlugin puede reconocer. También mantiene compatibilidad con
// los tags data-type de Tiptap (el upcast los maneja directamente).
//
// IMPORTANTE: llamar esta función ANTES de pasar initialData a CKEditor.

export function prepareForEditor(html: string): string {
  if (!html) return "";

  return html
    // \[...\] → span para mathBlock upcast
    .replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, latex) =>
        `<div data-type="block-math" data-latex="${escapeAttr(latex.trim())}"></div>`,
    )
    // \(...\) → span para mathInline upcast
    .replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, latex) =>
        `<span data-type="math-inline" data-latex="${escapeAttr(latex.trim())}"></span>`,
    );
}

// ── 2. Preparar contenido guardado en \[...\] para el upcast de mathBlock ────
//
// Convierte el span temporal generado por prepareForEditor al div que
// el upcast de MathPlugin espera para bloques.

// export function prepareBlocksForEditor(html: string): string {
//   return html.replace(
//     /<span data-type="math-inline-block" data-latex="([^"]*)"><\/span>/g,
//     (_, latex) => `<div data-type="block-math" data-latex="${latex}"></div>`,
//   );
// }

/**
 * normalizeForEditor — pipeline de entrada unificado para CKEditor.
 *
 * Aplica TODAS las transformaciones necesarias antes de pasar HTML como
 * initialData a cualquier instancia del editor. Agregar pasos aquí cuando
 * aparezcan nuevos formatos externos que rompan el upcast.
 *
 * @example
 *   <CKEditor data={normalizeForEditor(slide.contenido)} ... />
 */
export function normalizeForEditor(html: string): string {
  if (!html) return "";
  const stepA = sanitizeHtml(html);            // HTML malformado → limpio
  const step0 = sanitizeTables(stepA);         // tablas desnudas → <figure class="table">
  const step1 = prepareForEditor(step0);       // \(...\) → spans intermedios
  // const step2 = prepareBlocksForEditor(step1); // spans → divs para mathBlock
  return step1;
}

// ── 3. Entornos matemáticos (data-math-block) ─────────────────────────────────
//
// Convierte el formato emitido por MathBlockPlugin.dataDowncast a HTML
// con estilos inline para el preview (TiptapRenderer).
//
// Formato esperado:
//   <div data-math-block="" data-tipo="teorema" data-subtitulo="Bolzano">
//     <p>contenido...</p>
//   </div>

const ENTORNO_LABELS: Record<string, string> = {
  definicion:   "Definición",
  teorema:      "Teorema",
  proposicion:  "Proposición",
  corolario:    "Corolario",
  lema:         "Lema",
  ejemplo:      "Ejemplo",
  demostracion: "Demostración",
  observacion:  "Observación",
};

const ENTORNO_COLORS: Record<string, { border: string; bg: string; title: string }> = {
  definicion:   { border: "#2563b4", bg: "transparent",   title: "#1d4ed8" },
  teorema:      { border: "#15803d", bg: "transparent",   title: "#166534" },
  proposicion:  { border: "#7c3aed", bg: "transparent",  title: "#6d28d9" },
  corolario:    { border: "#0284c7", bg: "transparent",   title: "#0369a1" },
  lema:         { border: "#0d9488", bg: "transparent",  title: "#0f766e" },
  ejemplo:      { border: "#ea580c", bg: "transparent",   title: "#c2410c" },
  demostracion: { border: "#94a3b8", bg: "transparent", title: "#475569" },
  observacion:  { border: "#ca8a04", bg: "transparent",   title: "#92400e" },
};

function renderMathEnvironments(html: string): string {
  return html.replace(
    /<div([^>]*data-math-block[^>]*)>([\s\S]*?)<\/div>/gi,
    (_match, openAttrs, contenido) => {
      const tipoMatch      = openAttrs.match(/data-tipo="([^"]*)"/);
      const subtituloMatch = openAttrs.match(/data-subtitulo="([^"]*)"/);

      const tipo      = tipoMatch?.[1]      ?? "definicion";
      const subtitulo = subtituloMatch?.[1] ?? "";
      const colors    = ENTORNO_COLORS[tipo] ?? ENTORNO_COLORS.definicion;
      const label     = ENTORNO_LABELS[tipo]  ?? tipo;

      const tituloHtml = subtitulo.trim()
        ? `${label} <span style="font-weight:400;text-transform:none;font-style:italic;">(${subtitulo})</span>`
        : label;

      return (
        `<div style="border-left:4px solid ${colors.border};` +
        `border-radius:6px;padding:0.7em 1em;margin:0.6em 0;line-height:1.65;">` +
        `<div style="color:${colors.title};font-weight:700;font-size:0.85em;` +
        `letter-spacing:0.04em;text-transform:uppercase;margin-bottom:0.4em;">` +
        `${tituloHtml}</div>` +
        `<div>${contenido.trim()}</div>` +
        `</div>`
      );
    },
  );
}

// ── 4. Renderizar LaTeX en HTML para preview (TiptapRenderer) ────────────────
//
// Acepta TODOS los formatos posibles que pueden estar en la DB:
//   - \(...\)  y  \[...\]        (formato limpio actual)
//   - <span data-type="inline-math">   (Tiptap legado)
//   - <div  data-type="block-math">    (Tiptap legado)
//   - <div  data-math-block="">        (CKEditor MathBlockPlugin)

export function renderLatexInHtml(html: string): string {
  if (!html) return "";

  let result = html;

  // Paso 0: convertir entornos matemáticos (data-math-block) a estilos inline
  result = renderMathEnvironments(result);

  // Paso 1: convertir tags Tiptap legados a \(...\) para procesarlos uniforme
  // Los atributos pueden venir en cualquier orden: data-latex primero o data-type primero
  result = result
    // <span data-latex="..." data-type="inline-math"> o al revés
    .replace(
      /<span\s[^>]*data-latex="([^"]*)"[^>]*data-type="inline-math"[^>]*><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    .replace(
      /<span\s[^>]*data-type="inline-math"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    // <div data-latex="..." data-type="block-math"> o al revés
    .replace(
      /<div\s[^>]*data-latex="([^"]*)"[^>]*data-type="block-math"[^>]*><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    )
    .replace(
      /<div\s[^>]*data-type="block-math"[^>]*data-latex="([^"]*)"[^>]*><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    )
    // Formato "math-inline" / "math-block" del periodo de transición
    .replace(
      /<span\s[^>]*data-latex="([^"]*)"[^>]*data-type="math-inline"[^>]*><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    .replace(
      /<span\s[^>]*data-type="math-inline"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    .replace(
      /<div\s[^>]*data-latex="([^"]*)"[^>]*data-type="math-block"[^>]*><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    )
    .replace(
      /<div\s[^>]*data-type="math-block"[^>]*data-latex="([^"]*)"[^>]*><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    )
    // Nuevo formato CKEditor: <span data-math="inline">\(...\)</span>
    .replace(/<span[^>]*data-math="inline"[^>]*>([\s\S]*?)<\/span>/g, (_, inner) => inner)
    // Nuevo formato CKEditor: <span data-math="block">\[...\]</span>
    .replace(/<span[^>]*data-math="block"[^>]*>([\s\S]*?)<\/span>/g, (_, inner) => inner)
    // Wrapper math-tex (formato anterior del MathPlugin)
    .replace(/<span class="math-tex">([\s\S]*?)<\/span>/g, (_, inner) => inner)

    .replace(/&amp;/g, "&")
     .replace(/&lt;/g, "<")
     .replace(/&gt;/g, ">")
     .replace(/&quot;/g, '"')
     .replace(/&#39;/g, "'");

  // Paso 2: renderizar \[...\] con KaTeX en display mode
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: true,
        macros: KATEX_MACROS,
      });
    } catch {
      return `<span style="color:red;">[Error: ${latex}]</span>`;
    }
  });

  // Paso 3: renderizar \(...\) con KaTeX en inline mode
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: false,
        macros: KATEX_MACROS,
      });
    } catch {
      return `<span style="color:red;">[Error: ${latex}]</span>`;
    }
  });

  return result;
}


// ── 5. Limpiar contenido del editor para guardar en DB ───────────────────────
//
// Inverso de prepareForEditor: convierte el formato intermedio del editor
// (<span data-type="math-inline" data-latex="X">) y los formatos legados de
// vuelta al canónico \(...\) / \[...\] que se persiste en la DB.
// Garantiza que lo guardado nunca sea el formato intermedio (que Canvas
// renderiza vacío). Idempotente: si ya está limpio, no toca nada.

function decodeLatexAttr(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function cleanForDB(html: string): string {
  if (!html) return "";
  return html
    // inline: <span data-type="math-inline|inline-math" data-latex="X"></span> → \(X\)
    .replace(
      /<span\s[^>]*data-latex="([^"]*)"[^>]*data-type="(?:math-inline|inline-math)"[^>]*><\/span>/g,
      (_, l) => `\\(${decodeLatexAttr(l)}\\)`,
    )
    .replace(
      /<span\s[^>]*data-type="(?:math-inline|inline-math)"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g,
      (_, l) => `\\(${decodeLatexAttr(l)}\\)`,
    )
    // block: <div data-type="block-math|math-block" data-latex="X"></div> → \[X\]
    .replace(
      /<div\s[^>]*data-latex="([^"]*)"[^>]*data-type="(?:block-math|math-block)"[^>]*><\/div>/g,
      (_, l) => `\\[${decodeLatexAttr(l)}\\]`,
    )
    .replace(
      /<div\s[^>]*data-type="(?:block-math|math-block)"[^>]*data-latex="([^"]*)"[^>]*><\/div>/g,
      (_, l) => `\\[${decodeLatexAttr(l)}\\]`,
    );
}