/**
 * Convierte el HTML interno de Tiptap a HTML compatible con Canvas LMS.
 * Los nodos math se convierten a \(...\) y \[...\] para que Canvas
 * los renderice con su MathJax integrado.
 *
 * Uso en deploy:
 *   import { toCanvasHTML } from '../../components/Editor/canvasHTML'
 *   const enunciadoCanvas = toCanvasHTML(ej.enunciado)
 */
export function toCanvasHTML(html: string): string {
  return html
    .replace(
      /<span data-latex="([^"]*)" data-type="inline-math"><\/span>/g,
      function (match, contents, offset, input_string) {
        console.log(match, offset, input_string);
        return `\\(${contents}\\)`;
      },
    )
    .replace(
      /<div data-latex="([^"]*)" data-type="block-math"><\/div>/g,
      function (match, contents, offset, input_string) {
        console.log(match, offset, input_string);
        return `\\[${contents}\\]`;
      },
    );
  // .replace(/<math-inline latex="([^"]*)"><\/math-inline>/g,  (_, l) => `\\(${l}\\)`)
  // .replace(/<math-block latex="([^"]*)"><\/math-block>/g,    (_, l) => `\\[${l}\\]`)
  // .replace(
  //   /<span[^>]*data-type="math-inline"[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/span>/g,
  //   (_, l) => `\\(${l}\\)`
  // )
  // .replace(
  //   /<div[^>]*data-type="math-block"[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/div>/g,
  //   (_, l) => `\\[${l}\\]`
  // )
}
