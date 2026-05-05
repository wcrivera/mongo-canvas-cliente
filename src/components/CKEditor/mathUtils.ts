/**
 * mathUtils.ts
 *
 * Utilidades para manejar el contenido LaTeX almacenado en distintos formatos.
 *
 * FLUJO COMPLETO:
 *
 *   DB (guardado limpio)          Editor CKEditor           DB (guardar)
 *   \(...\)  o  \[...\]    →   prepareForEditor()   →   CKEditor.getData()
 *   <span data-type="inline-math">  (Tiptap legado)         → \(...\) limpio automático
 *
 *   DB  →  TiptapRenderer / Preview
 *   Cualquier formato  →  renderLatexInHtml()  →  KaTeX HTML
 */

import katex from "katex";

// ── Helper interno ────────────────────────────────────────────────────────────

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
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

  // Si ya tiene tags data-type (Tiptap legado), el upcast de MathPlugin
  // los maneja directamente — no necesita transformación.
  // Solo convertimos \(...\) y \[...\] a spans para que el upcast los lea.

  return html
    // \[...\] → span para mathBlock upcast
    .replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, latex) =>
        `<span data-type="math-inline-block" data-latex="${escapeAttr(latex.trim())}"></span>`,
    )
    // \(...\) → span para mathInline upcast
    .replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, latex) =>
        `<span data-type="math-inline" data-latex="${escapeAttr(latex.trim())}"></span>`,
    );
}

// ── 2. Preparar contenido guardado en \(...\) para el upcast de mathBlock ────
//
// El problema: \[...\] necesita su propio upcast. Agregamos un segundo
// paso que convierte el span temporal de mathInline-block al div correcto.

export function prepareBlocksForEditor(html: string): string {
  return html.replace(
    /<span data-type="math-inline-block" data-latex="([^"]*)"><\/span>/g,
    (_, latex) => `<div data-type="block-math" data-latex="${latex}"></div>`,
  );
}

/**
 * Función principal — combina ambos pasos.
 * Usar esta en lugar de prepareForEditor directamente.
 *
 * @example
 *   <CKEditor data={normalizeForEditor(pregunta.enunciado)} ... />
 */
export function normalizeForEditor(html: string): string {
  if (!html) return "";
  const step1 = prepareForEditor(html);
  const step2 = prepareBlocksForEditor(step1);
  return step2;
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
  definicion:   { border: "#2563b4", bg: "rgba(37,99,180,0.07)",   title: "#1d4ed8" },
  teorema:      { border: "#15803d", bg: "rgba(21,128,61,0.07)",   title: "#166534" },
  proposicion:  { border: "#7c3aed", bg: "rgba(109,40,217,0.07)",  title: "#6d28d9" },
  corolario:    { border: "#0284c7", bg: "rgba(2,132,199,0.07)",   title: "#0369a1" },
  lema:         { border: "#0d9488", bg: "rgba(13,148,136,0.07)",  title: "#0f766e" },
  ejemplo:      { border: "#ea580c", bg: "rgba(234,88,12,0.07)",   title: "#c2410c" },
  demostracion: { border: "#94a3b8", bg: "rgba(100,116,139,0.06)", title: "#475569" },
  observacion:  { border: "#ca8a04", bg: "rgba(202,138,4,0.08)",   title: "#92400e" },
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
        `<div style="border-left:4px solid ${colors.border};background:${colors.bg};` +
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
    .replace(/<span class="math-tex">([\s\S]*?)<\/span>/g, (_, inner) => inner);

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

// ── Macros KaTeX compartidos ──────────────────────────────────────────────────
//
// Exportados para uso en MathEditModal y otros previews.

export const KATEX_MACROS: Record<string, string> = {
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\C": "\\mathbb{C}",
  "\\E": "\\mathbb{E}",
};