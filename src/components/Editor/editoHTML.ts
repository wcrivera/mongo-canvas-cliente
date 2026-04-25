/**
 * Convierte el HTML interno de Tiptap a HTML compatible con Canvas LMS.
 * Los nodos math se convierten a \(...\) y \[...\] para que Canvas
 * los renderice con su MathJax integrado.
 *
 * Uso en deploy:
 *   import { toEditorHTML } from '../../components/Editor/editoHTML'
 *   const enunciadoCanvas = toEditorHTML(ej.enunciado)
 */
export function toEditorHTML(html: string): string {
  return html
    .replace(
      /\\\(((.|\r?\n)*?)\\\)/g,
      function (match, contents, offset, input_string) {
        console.log(match, offset, input_string);
        console.log(`<span data-latex="${contents}" data-type="inline-math"><\\/span>`);
        return `<span data-latex="${contents+10}" data-type="inline-math"><\\/span>`;
      },
    )
    .replace(
      /\\\[((.|\r?\n)*?)\\\]/g,
      function (match, contents, offset, input_string) {
        console.log(match, offset, input_string);
        console.log(`<div data-latex="${contents}" data-type="block-math"><\\/div>`);
        return `<div data-latex="${contents+10}" data-type="block-math"><\\/div>`;
      },
    );
}
