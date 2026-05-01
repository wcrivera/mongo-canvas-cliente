// src/components/CKEditor/plugins/MathPlugin.ts
import { Plugin, Command, Widget, toWidget } from "ckeditor5";
import type { ViewDowncastWriter, ModelWriter, ViewElement } from "ckeditor5";

// ─── Comandos ─────────────────────────────────────────────────────────────────

export class InsertInlineMathCommand extends Command {
  execute({ latex = "" }: { latex?: string } = {}) {
    this.editor.model.change((writer: ModelWriter) => {
      const math = writer.createElement("inlineMath", { latex });
      this.editor.model.insertObject(math);
    });
  }
  refresh() { this.isEnabled = true; }
}

export class InsertBlockMathCommand extends Command {
  execute({ latex = "" }: { latex?: string } = {}) {
    this.editor.model.change((writer: ModelWriter) => {
      const math = writer.createElement("blockMath", { latex });
      const pos  = this.editor.model.document.selection.getFirstPosition();
      if (pos) this.editor.model.insertObject(math, pos, null, { setSelection: "after" });
    });
  }
  refresh() { this.isEnabled = true; }
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export class MathPlugin extends Plugin {
  static get requires() { return [Widget]; }
  static get pluginName() { return "MathPlugin"; }

  init() {
    const { model, conversion } = this.editor;

    // Schema
    model.schema.register("inlineMath", {
      allowWhere: "$text", isInline: true, isObject: true,
      allowAttributes: ["latex"],
    });
    model.schema.register("blockMath", {
      allowIn: "$root", isObject: true, isBlock: true,
      allowAttributes: ["latex"],
    });

    // ── Inline \(...\) ────────────────────────────────────────────────────────

    // Editor: muestra visualmente el LaTeX
    conversion.for("editingDowncast").elementToElement({
      model: "inlineMath",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        const span  = writer.createContainerElement("span", {
          class: "ck-math-inline",
          "data-latex": latex,
          style: "background:#f0f4f8;border-radius:3px;padding:1px 4px;font-family:monospace;font-size:0.9em;color:#4A6D8C;cursor:pointer;",
        });
        writer.insert(writer.createPositionAt(span, 0), writer.createText(`\\(${latex}\\)`));
        return toWidget(span, writer, { label: "fórmula inline" });
      },
    });

    // Data: \(...\) texto plano para Canvas/MathJax
    conversion.for("dataDowncast").elementToElement({
      model: "inlineMath",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        const span  = writer.createContainerElement("span", {});
        writer.insert(writer.createPositionAt(span, 0), writer.createText(`\\(${latex}\\)`));
        return span;
      },
    });

    // ── Bloque \[...\] ────────────────────────────────────────────────────────

    // Editor: muestra visualmente el bloque
    conversion.for("editingDowncast").elementToElement({
      model: "blockMath",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        const div   = writer.createContainerElement("div", {
          class: "ck-math-block",
          "data-latex": latex,
          style: "text-align:center;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin:8px 0;font-family:monospace;color:#4A6D8C;cursor:pointer;",
        });
        writer.insert(writer.createPositionAt(div, 0), writer.createText(`\\[${latex}\\]`));
        return toWidget(div, writer, { label: "bloque matemático" });
      },
    });

    // Data: \[...\] texto plano para Canvas/MathJax
    conversion.for("dataDowncast").elementToElement({
      model: "blockMath",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        const div   = writer.createContainerElement("div", { style: "text-align:center;margin:1em 0;" });
        writer.insert(writer.createPositionAt(div, 0), writer.createText(`\\[${latex}\\]`));
        return div;
      },
    });

    // ── Upcast ────────────────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      view:  { name: "span", classes: "ck-math-inline" },
      model: (viewElement: ViewElement, { writer }: { writer: ModelWriter }) =>
        writer.createElement("inlineMath", { latex: viewElement.getAttribute("data-latex") ?? "" }),
    });

    conversion.for("upcast").elementToElement({
      view:  { name: "div", classes: "ck-math-block" },
      model: (viewElement: ViewElement, { writer }: { writer: ModelWriter }) =>
        writer.createElement("blockMath", { latex: viewElement.getAttribute("data-latex") ?? "" }),
    });

    // ── Comandos ──────────────────────────────────────────────────────────────
    this.editor.commands.add("insertInlineMath", new InsertInlineMathCommand(this.editor));
    this.editor.commands.add("insertBlockMath",  new InsertBlockMathCommand(this.editor));
  }
}