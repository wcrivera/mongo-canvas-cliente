/**
 * MathPlugin.ts
 *
 * Plugin CKEditor 5 para fórmulas LaTeX.
 *
 * UPCAST (HTML → modelo): acepta los 4 formatos posibles:
 *   - Tiptap legado inline:  <span data-latex="..." data-type="inline-math"></span>
 *   - Tiptap legado block:   <div  data-latex="..." data-type="block-math"></div>
 *   - Formato nuevo inline:  \(...\)   (texto plano guardado en DB)
 *   - Formato nuevo block:   \[...\]   (texto plano guardado en DB)
 *
 * EDITING DOWNCAST (modelo → vista editable): renderiza KaTeX visual
 *
 * DATA DOWNCAST (modelo → HTML para guardar en DB): emite \(...\) o \[...\]
 *   → La DB queda limpia, sin tags HTML ni atributos data-*
 */

import { Plugin } from "ckeditor5";
import type { Editor } from "ckeditor5";
import katex from "katex";

// ── Helpers de renderizado KaTeX ──────────────────────────────────────────────

function renderKatexInline(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: false });
  } catch {
    return latex;
  }
}

function renderKatexBlock(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: true });
  } catch {
    return latex;
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class MathPlugin extends Plugin {
  static get pluginName() {
    return "MathPlugin" as const;
  }

  init() {
    const editor: Editor = this.editor;

    // ── Schema ──────────────────────────────────────────────────────────────

    editor.model.schema.register("mathInline", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["latex"],
    });

    editor.model.schema.register("mathBlock", {
      allowWhere: "$block",
      isObject: true,
      allowAttributes: ["latex"],
    });

    // ── Upcast: HTML → modelo ───────────────────────────────────────────────
    // Acepta formato Tiptap legado Y formato nuevo \(...\)

    // [Legado Tiptap] <span data-type="inline-math" data-latex="...">
    editor.conversion.for("upcast").elementToElement({
      view: { name: "span", attributes: { "data-type": "inline-math" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathInline", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });

    // [Legado Tiptap] <div data-type="block-math" data-latex="...">
    editor.conversion.for("upcast").elementToElement({
      view: { name: "div", attributes: { "data-type": "block-math" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathBlock", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });

    // [Formato nuevo] <span data-type="math-inline" data-latex="...">
    // (por si algún dato fue guardado con el formato intermedio de la sesión anterior)
    editor.conversion.for("upcast").elementToElement({
      view: { name: "span", attributes: { "data-type": "math-inline" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathInline", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });

    // [Formato nuevo] <div data-type="math-block" data-latex="...">
    editor.conversion.for("upcast").elementToElement({
      view: { name: "div", attributes: { "data-type": "math-block" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathBlock", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });

    // ── Editing Downcast: modelo → vista editable (KaTeX visual) ───────────

    editor.conversion.for("editingDowncast").elementToElement({
      model: "mathInline",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        const rendered = renderKatexInline(latex);

        const container = writer.createRawElement(
          "span",
          {
            class: "ck-math-inline",
            "data-latex": latex,
            style:
              "display:inline-flex;align-items:center;cursor:pointer;" +
              "background:#eef3f8;border:1px solid #c9dae8;" +
              "border-radius:4px;padding:1px 5px;margin:0 2px;vertical-align:middle;",
          },
          (el) => {
            el.innerHTML = rendered;
          },
        );

        return container;
      },
    });

    editor.conversion.for("editingDowncast").elementToElement({
      model: "mathBlock",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        const rendered = renderKatexBlock(latex);

        const container = writer.createRawElement(
          "div",
          {
            class: "ck-math-block",
            "data-latex": latex,
            style:
              "text-align:center;padding:14px 18px;margin:8px 0;" +
              "background:#eef3f8;border:1px solid #c9dae8;" +
              "border-radius:6px;cursor:pointer;",
          },
          (el) => {
            el.innerHTML = rendered;
          },
        );

        return container;
      },
    });

    // ── Data Downcast: modelo → HTML para guardar en DB ─────────────────────
    // IMPORTANTE: emite \(...\) y \[...\] limpio, sin tags HTML.
    // El contenido guardado en MongoDB no tendrá ningún tag data-* de fórmulas.

    editor.conversion.for("dataDowncast").elementToElement({
      model: "mathInline",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        // Emitimos como texto dentro de un span invisible que CKEditor
        // luego serializa como texto plano al hacer getData()
        return writer.createRawElement(
          "span",
          { class: "math-tex" },
          (el) => {
            el.innerHTML = `\\(${latex}\\)`;
          },
        );
      },
    });

    editor.conversion.for("dataDowncast").elementToElement({
      model: "mathBlock",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        return writer.createRawElement(
          "span",
          { class: "math-tex" },
          (el) => {
            el.innerHTML = `\\[${latex}\\]`;
          },
        );
      },
    });
  }
}