/**
 * Convierte HTML de Canvas LMS al formato HTML interno de Tiptap.
 *
 * Canvas almacena las fórmulas como texto plano con \(...\) y \[...\].
 * Tiptap las representa como nodos custom con atributos data-latex.
 *
 * Esta función hace el roundtrip inverso a toCanvasHTML:
 *   Canvas  →  \( latex \)           →  toEditorHTML  →  <span data-latex="latex" ...>
 *   Canvas  →  \[ latex \]           →  toEditorHTML  →  <div  data-latex="latex" ...>
 *
 * Uso al cargar contenido guardado en Canvas hacia el editor:
 *   import { toEditorHTML } from '../../components/Editor'
 *   const contenidoEditor = toEditorHTML(recurso.contenido)
 */
export function toEditorHTML(html: string): string {
  return html
    // \( latex \)  →  nodo inline de Tiptap
    .replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, latex) =>
        `<span data-latex="${latex}" data-type="inline-math"></span>`,
    )
    // \[ latex \]  →  nodo bloque de Tiptap
    .replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, latex) =>
        `<div data-latex="${latex}" data-type="block-math"></div>`,
    );
}