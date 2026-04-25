/**
 * Macros KaTeX compartidos entre LatexEditor y MathEditModal.
 * Cualquier macro nuevo se agrega aquí y queda disponible
 * tanto en el preview del modal como en el renderizado del editor.
 */
export const KATEX_MACROS: Record<string, string> = {
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\C": "\\mathbb{C}",
  "\\E": "\\mathbb{E}",
};