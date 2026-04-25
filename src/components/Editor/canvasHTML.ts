/**
 * Convierte el HTML interno de Tiptap al formato compatible con Canvas LMS.
 *
 * Tiptap guarda las fórmulas como nodos custom con atributos data-latex.
 * Canvas LMS incluye MathJax y reconoce \(...\) y \[...\] directamente.
 *
 *   <span data-latex="latex" data-type="inline-math"></span>  →  \( latex \)
 *   <div  data-latex="latex" data-type="block-math"></div>    →  \[ latex \]
 *
 * Si el contenido no es HTML de Tiptap (texto plano legacy), lo devuelve tal cual.
 */
export function toCanvasHTML(html: string): string {
  if (!html) return "";
  return html
    .replace(
      /<span data-latex="([^"]*)" data-type="inline-math"><\/span>/g,
      (_, latex) => `\\(${latex}\\)`,
    )
    .replace(
      /<div data-latex="([^"]*)" data-type="block-math"><\/div>/g,
      (_, latex) => `\\[${latex}\\]`,
    );
}
