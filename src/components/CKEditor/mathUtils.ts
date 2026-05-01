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

// ── 3. Renderizar LaTeX en HTML para preview (TiptapRenderer) ────────────────
//
// Acepta TODOS los formatos posibles que pueden estar en la DB:
//   - \(...\)  y  \[...\]        (formato limpio actual)
//   - <span data-type="inline-math">   (Tiptap legado)
//   - <div  data-type="block-math">    (Tiptap legado)

export function renderLatexInHtml(html: string): string {
  if (!html) return "";

  let result = html;

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
      return `<div style="text-align:center;margin:0.8em 0;">${katex.renderToString(
        latex.trim(),
        { displayMode: true, throwOnError: false },
      )}</div>`;
    } catch {
      return `\\[${latex}\\]`;
    }
  });

  // Paso 3: renderizar \(...\) con KaTeX en inline mode
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `\\(${latex}\\)`;
    }
  });

  return result;
}

// ── 4. Limpiar HTML para guardar en DB ───────────────────────────────────────
//
// Por si acaso algún dato viene con tags Tiptap y necesita ser
// normalizado antes de guardar en MongoDB.
// Con el nuevo MathPlugin esto no debería ser necesario, pero
// se deja como utilidad de migración.

export function cleanForDB(html: string): string {
  if (!html) return "";
  return html
    .replace(
      /<span[^>]*data-type="inline-math"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    .replace(
      /<div[^>]*data-type="block-math"[^>]*data-latex="([^"]*)"[^>]*><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    )
    .replace(
      /<span[^>]*data-type="math-inline"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    .replace(
      /<div[^>]*data-type="math-block"[^>]*data-latex="([^"]*)"[^>]*><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    )
    // Quitar el wrapper <span class="math-tex"> que CKEditor puede emitir
    .replace(/<span class="math-tex">([\s\S]*?)<\/span>/g, (_, inner) => inner);
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}