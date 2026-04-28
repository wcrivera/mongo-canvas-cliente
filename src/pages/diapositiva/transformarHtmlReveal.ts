// src/pages/diapositiva/transformarHtmlReveal.ts
//
// Convierte el HTML generado por TipTap (con data-math-block, data-two-columns, etc.)
// al HTML que entienden los estilos CSS de Reveal.js (.math-block, .two-col, etc.)
//
// Se usa ANTES de meter el contenido en cada <section> de Reveal.js.

import {
  MATH_BLOCK_LABELS,
} from "../../components/Editor/extensions/MathBlock.extension";
import type { MathBlockType } from "../../components/Editor/extensions/MathBlock.extension";

// ── Helpers DOM ───────────────────────────────────────────────────────────────

/**
 * Parsea un string HTML y retorna un Document del navegador.
 * Funciona en el contexto del browser (frontend).
 */
const parseHTML = (html: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

// ── Transformaciones ──────────────────────────────────────────────────────────

/**
 * Transforma bloques matemáticos:
 * <div data-math-block="" data-tipo="definicion" data-subtitulo="...">
 *   <div class="math-block-title">...</div>
 *   <div class="math-block-body">...</div>
 * </div>
 * →
 * <div class="math-block definicion">
 *   <div class="math-block-title">DEFINICIÓN (subtítulo)</div>
 *   <div class="math-block-body">...</div>
 * </div>
 */
const transformarMathBlocks = (doc: Document): void => {
  const bloques = doc.querySelectorAll("[data-math-block]");

  bloques.forEach((el) => {
    const tipo      = (el.getAttribute("data-tipo") ?? "definicion") as MathBlockType;
    const subtitulo = el.getAttribute("data-subtitulo") ?? "";
    const label     = MATH_BLOCK_LABELS[tipo] ?? tipo;

    // Limpiar atributos data-*
    el.removeAttribute("data-math-block");
    el.removeAttribute("data-tipo");
    el.removeAttribute("data-subtitulo");

    // Aplicar clases CSS de Reveal
    el.className = `math-block ${tipo}`;

    // Remover estilos inline (el CSS del compilador ya los maneja)
    (el as HTMLElement).style.cssText = "";

    // Buscar o crear el título
    let titleEl = el.querySelector(".math-block-title");
    if (!titleEl) {
      titleEl = doc.createElement("div");
      titleEl.className = "math-block-title";
      el.insertBefore(titleEl, el.firstChild);
    }

    // Reconstruir el título con label + subtítulo
    const tituloHtml = subtitulo.trim()
      ? `${label} <span style="font-weight:400;text-transform:none;font-style:italic;">(${subtitulo})</span>`
      : label;
    titleEl.innerHTML = tituloHtml;
    (titleEl as HTMLElement).removeAttribute("contenteditable");
    (titleEl as HTMLElement).style.cssText = "";

    // Buscar o crear el body
    const bodyEl = el.querySelector(".math-block-body");
    if (!bodyEl) {
      // Si no existe body, envolver el contenido restante
      const body = doc.createElement("div");
      body.className = "math-block-body";
      while (el.children.length > 1) {
        body.appendChild(el.children[1]);
      }
      el.appendChild(body);
    } else {
      (bodyEl as HTMLElement).style.cssText = "";
    }

    // Agregar ∎ para demostraciones
    if (tipo === "demostracion") {
      const qed = doc.createElement("div");
      qed.style.textAlign = "right";
      qed.style.fontSize  = "1.1em";
      qed.style.color     = "#64748b";
      qed.textContent     = "∎";
      el.appendChild(qed);
    }
  });
};

/**
 * Transforma dos columnas:
 * <div data-two-columns="" class="two-col">
 *   <div data-column="" class="col">izquierda</div>
 *   <div data-column="" class="col">derecha</div>
 * </div>
 * → ya tiene las clases correctas, solo limpiar atributos innecesarios
 */
const transformarTwoColumns = (doc: Document): void => {
  const contenedores = doc.querySelectorAll("[data-two-columns]");

  contenedores.forEach((el) => {
    el.removeAttribute("data-two-columns");
    el.className = "two-col";
    (el as HTMLElement).style.cssText = "";

    // Limpiar columnas hijas
    el.querySelectorAll("[data-column]").forEach((col) => {
      col.removeAttribute("data-column");
      col.className = "col";
      (col as HTMLElement).style.cssText = "";
    });
  });
};

/**
 * Limpia atributos residuales que TipTap agrega y que no sirven en Reveal.
 */
const limpiarAtributosResiduals = (doc: Document): void => {
  // Quitar contenteditable de cualquier elemento
  doc.querySelectorAll("[contenteditable]").forEach((el) => {
    el.removeAttribute("contenteditable");
  });

  // Quitar data-node-view-wrapper y similares de TipTap
  doc.querySelectorAll("[data-node-view-wrapper]").forEach((el) => {
    el.removeAttribute("data-node-view-wrapper");
  });
};

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Transforma el HTML generado por TipTap al formato que entiende Reveal.js.
 * Usar antes de insertar el contenido en un <section> de Reveal.
 *
 * @param html - HTML crudo de TipTap (getHTML())
 * @returns HTML transformado listo para Reveal.js
 */
export const transformarHtmlParaReveal = (html: string): string => {
  if (!html || html.trim() === "" || html === "<p></p>") return "";

  const doc = parseHTML(html);

  transformarMathBlocks(doc);
  transformarTwoColumns(doc);
  // Transformar clases de @tiptap-extend/columns al formato Reveal
  doc.querySelectorAll(".column-block").forEach((el) => {
    el.className = "two-col";
    (el as HTMLElement).removeAttribute("data-type");
  });
  doc.querySelectorAll(".column").forEach((el) => {
    el.className = "col";
    (el as HTMLElement).removeAttribute("data-type");
  });
  limpiarAtributosResiduals(doc);

  // Retornar solo el contenido del body (sin <html><head><body> wrapper)
  return doc.body.innerHTML;
};