"use client";

import { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import styles from "./MathEditModal.module.css";

interface MathEditModalProps {
  latex: string;
  type: "inline" | "block";
  onSave: (latex: string) => void;
  onClose: () => void;
}

const SNIPPETS = [
  { label: "Fracción", value: "\\frac{a}{b}" },
  { label: "Raíz", value: "\\sqrt{x}" },
  { label: "Potencia", value: "x^{n}" },
  { label: "Subíndice", value: "x_{i}" },
  { label: "Suma", value: "\\sum_{i=1}^{n} x_i" },
  { label: "Integral", value: "\\int_{a}^{b} f(x)\\,dx" },
  { label: "Límite", value: "\\lim_{x \\to \\infty}" },
  {
    label: "Matriz",
    value: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
  },
  { label: "Binomial", value: "\\binom{n}{k}" },
  { label: "Parcial", value: "\\frac{\\partial f}{\\partial x}" },
  { label: "Griego α", value: "\\alpha" },
  { label: "Griego β", value: "\\beta" },
  { label: "Griego Σ", value: "\\Sigma" },
  { label: "Griego π", value: "\\pi" },
  { label: "Infinito", value: "\\infty" },
];

export function MathEditModal({
  latex,
  type,
  onSave,
  onClose,
}: MathEditModalProps) {
  const [value, setValue] = useState(latex);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  useEffect(() => {
    try {
      const rendered = katex.renderToString(value, {
        displayMode: type === "block",
        throwOnError: true,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
          "\\Z": "\\mathbb{Z}",
        },
      });
      setPreview(rendered);
      setError("");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Error de sintaxis";
      setError(errorMessage);
      try {
        setPreview(
          katex.renderToString(value, {
            displayMode: type === "block",
            throwOnError: false,
          }),
        );
      } catch {
        setPreview("");
      }
    }
  }, [value, type]);

  const insertSnippet = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = value.slice(0, start) + snippet + value.slice(end);
    setValue(newVal);
    setTimeout(() => {
      ta.selectionStart = start + snippet.length;
      ta.selectionEnd = start + snippet.length;
      ta.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      onSave(value);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>
            {type === "block" ? "Ecuación en bloque" : "Fórmula inline"}
          </span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={styles.snippets}>
          {SNIPPETS.map((s) => (
            <button
              key={s.label}
              className={styles.snippet}
              onClick={() => insertSnippet(s.value)}
              title={s.value}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <div className={styles.inputSection}>
            <label className={styles.label}>LaTeX</label>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              spellCheck={false}
              placeholder="\frac{a}{b}"
            />
            <span className={styles.hint}>
              ⌘↵ para guardar · Esc para cancelar
            </span>
          </div>

          <div className={styles.previewSection}>
            <label className={styles.label}>Vista previa</label>
            <div
              className={`${styles.preview} ${error ? styles.hasError : ""}`}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
            {error && <span className={styles.error}>{error}</span>}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.saveBtn}
            onClick={() => onSave(value)}
            disabled={!!error}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
