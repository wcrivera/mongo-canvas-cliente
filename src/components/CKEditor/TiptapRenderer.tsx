/**
 * TiptapRenderer.tsx
 *
 * Renderiza contenido guardado en la DB, independientemente del formato:
 *
 *   - Texto plano legacy \(...\) / \[...\]        → KaTeX directo
 *   - HTML con \(...\) / \[...\] embebidos         → KaTeX inline
 *   - HTML Tiptap legado (data-type="inline-math") → normalizado → KaTeX
 *   - HTML Tiptap legado (data-type="block-math")  → normalizado → KaTeX
 *
 * Usar este componente en TODOS los lugares donde se muestra contenido
 * guardado: preguntas, ayudantías, vistas previas, etc.
 */

import { useMemo } from "react";
import LatexRenderer from "../LaTeX/LatexRenderer";
import { renderLatexInHtml } from "./mathUtils";
import "katex/dist/katex.min.css";
import styles from "./TiptapRenderer.module.css";

interface Props {
  children: string;
}

const TiptapRenderer = ({ children }: Props) => {
  const { isHtml, processed } = useMemo(() => {
    if (!children) return { isHtml: false, processed: "" };

    const trimmed = children.trimStart();

    // Si empieza con "<" es HTML (Tiptap, CKEditor, o legado)
    if (trimmed.startsWith("<")) {
      return {
        isHtml: true,
        processed: renderLatexInHtml(children),
      };
    }

    // Texto plano con \(...\) — puede ser legacy o contenido guardado limpio
    // Si contiene \( o \[, renderizamos igual pasándolo por renderLatexInHtml
    if (children.includes("\\(") || children.includes("\\[")) {
      // Envolvemos en un párrafo para que renderLatexInHtml lo procese
      return {
        isHtml: true,
        processed: renderLatexInHtml(`<p>${children}</p>`),
      };
    }

    // Texto plano puro sin LaTeX → LatexRenderer legacy
    return { isHtml: false, processed: children };
  }, [children]);

  if (!children) return null;

  if (isHtml) {
    return (
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: processed }}
        style={{ lineHeight: 1.75, fontSize: 14, color: "#1f2c38" }}
      />
    );
  }

  return <LatexRenderer>{processed}</LatexRenderer>;
};

export default TiptapRenderer;