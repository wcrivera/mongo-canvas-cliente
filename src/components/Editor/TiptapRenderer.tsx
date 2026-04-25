/**
 * TiptapRenderer
 *
 * Renderiza contenido guardado por el editor Tiptap/LaTeX.
 *
 * Estrategia:
 *   - HTML de Tiptap (empieza con "<"):
 *       1. Convierte nodos LaTeX a \(...\) con toCanvasHTML
 *       2. Renderiza el HTML resultante con dangerouslySetInnerHTML
 *       3. MathJax/KaTeX del navegador renderiza los \(...\) — o usamos
 *          un post-proceso con react-latex-next en el HTML
 *   - Texto plano legacy \(...\): LatexRenderer directo
 */
import { useMemo } from "react";
import LatexRenderer from "../LaTeX/LatexRenderer";
import { toCanvasHTML } from "../Editor";
import "katex/dist/katex.min.css";
import katex from "katex";
import styles from "./TiptapRenderer.module.css";

interface Props {
  children: string;
}

// Convierte \(...\) y \[...\] a HTML de KaTeX
const renderLatexInHtml = (html: string): string => {
  return html
    // Bloques \[...\]
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
      try {
        return `<div style="text-align:center;margin:0.8em 0;">${katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch { return `\\[${latex}\\]`; }
    })
    // Inline \(...\)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
      } catch { return `\\(${latex}\\)`; }
    });
};

const TiptapRenderer = ({ children }: Props) => {
  const { isHtml, html } = useMemo(() => {
    if (!children) return { isHtml: false, html: "" };

    if (children.trimStart().startsWith("<")) {
      // HTML de Tiptap → convertir LaTeX a \(...\) → renderizar KaTeX
      const withCanvas = toCanvasHTML(children);
      const withKatex  = renderLatexInHtml(withCanvas);
      return { isHtml: true, html: withKatex };
    }

    return { isHtml: false, html: children };
  }, [children]);

  if (!children) return null;

  if (isHtml) {
    return (
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ lineHeight: 1.75, fontSize: 14, color: "#1f2c38" }}
      />
    );
  }

  return <LatexRenderer>{html}</LatexRenderer>;
};

export default TiptapRenderer;