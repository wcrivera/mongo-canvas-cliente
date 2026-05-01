import { Plugin, Command, ButtonView, toWidget } from "ckeditor5";
import katex from "katex";
import { KATEX_MACROS } from "../components/katexMacros";

// ── Tipos para la configuración del plugin ────────────────────────────────────

export interface MathPluginConfig {
  /** Callback que abre el modal (el usuario elige inline/block dentro del modal) */
  onInsert: () => void;
  /**
   * Callback que abre el modal para EDITAR una fórmula existente.
   * Recibe el latex actual, el tipo, y una función para confirmar los cambios.
   */
  onEdit: (
    latex: string,
    type: "inline" | "block",
    onSave: (newLatex: string, newType: "inline" | "block") => void
  ) => void;
}

// ── Helpers de renderizado KaTeX ──────────────────────────────────────────────

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      macros: KATEX_MACROS,
    });
  } catch {
    return `<span style="color:#c0392b;font-family:monospace">${latex}</span>`;
  }
}

// ── Comandos ──────────────────────────────────────────────────────────────────

class InsertMathInlineCommand extends Command {
  override execute({ latex }: { latex: string }): void {
    this.editor.model.change((writer) => {
      const el = writer.createElement("mathInline", { latex });
      this.editor.model.insertObject(el, null, null, { setSelection: "after" });
    });
  }

  override refresh(): void {
    this.isEnabled = true;
  }
}

class InsertMathBlockCommand extends Command {
  override execute({ latex }: { latex: string }): void {
    this.editor.model.change((writer) => {
      const el = writer.createElement("mathBlock", { latex });
      this.editor.model.insertObject(el, null, null, { setSelection: "after" });
    });
  }

  override refresh(): void {
    this.isEnabled = true;
  }
}

class UpdateMathCommand extends Command {
  override execute({
    element,
    latex,
    type,
  }: {
    element: unknown;
    latex: string;
    type: "inline" | "block";
  }): void {
    this.editor.model.change((writer) => {
      if (!element) return;
      const targetName = type === "inline" ? "mathInline" : "mathBlock";

      if ((element as { name: string }).name === targetName) {
        writer.setAttribute(
          "latex",
          latex,
          element as Parameters<typeof writer.setAttribute>[2]
        );
      } else {
        const newEl = writer.createElement(targetName, { latex });
        writer.insert(
          newEl,
          element as Parameters<typeof writer.insert>[1],
          "before"
        );
        writer.remove(element as Parameters<typeof writer.remove>[0]);
      }
    });
  }

  override refresh(): void {
    this.isEnabled = true;
  }
}

// ── Plugin principal ──────────────────────────────────────────────────────────

export class MathPlugin extends Plugin {
  static get pluginName(): string {
    return "MathPlugin";
  }

  init(): void {
    this._defineSchema();
    this._defineConverters();
    this._defineCommands();
    this._defineToolbarButtons();
    this._defineClickHandler();
  }

  // ── Schema ──────────────────────────────────────────────────────────────────

  private _defineSchema(): void {
    const { schema } = this.editor.model;

    schema.register("mathInline", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["latex"],
    });

    schema.register("mathBlock", {
      allowWhere: "$block",
      isObject: true,
      isBlock: true,
      allowAttributes: ["latex"],
    });
  }

  // ── Conversores ─────────────────────────────────────────────────────────────

  private _defineConverters(): void {
    const { conversion } = this.editor;

    // ── mathInline: editingDowncast ────────────────────────────────────────────
    conversion.for("editingDowncast").elementToElement({
      model: "mathInline",
      view: (modelElement, { writer }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        const rendered = renderKatex(latex, false);

        const wrapper = writer.createContainerElement("span", {
          class: "ck-math-widget ck-math-inline",
          "data-latex": latex,
          style: [
            "display:inline-block",
            "cursor:pointer",
            // "padding:0 3px",
            "border-radius:3px",
            // "background:#f0f4ff",
            // "border:1px solid #c8d8f0",
            "vertical-align:middle",
          ].join(";"),
        });

        const inner = writer.createRawElement(
          "span",
          { style: "pointer-events:none" },
          (domElement) => { domElement.innerHTML = rendered; }
        );

        writer.insert(writer.createPositionAt(wrapper, 0), inner);
        return toWidget(wrapper, writer, { label: "fórmula inline" });
      },
    });

    // ── mathBlock: editingDowncast ─────────────────────────────────────────────
    conversion.for("editingDowncast").elementToElement({
      model: "mathBlock",
      view: (modelElement, { writer }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        const rendered = renderKatex(latex, true);

        const wrapper = writer.createContainerElement("div", {
          class: "ck-math-widget ck-math-block",
          "data-latex": latex,
          style: [
            "display:block",
            "cursor:pointer",
            "text-align:center",
            // "padding:12px 16px",
            // "margin:8px 0",
            "border-radius:6px",
            // "background:#f8fafc",
            // "border:1px solid #e2e8f0",
          ].join(";"),
        });

        const inner = writer.createRawElement(
          "span",
          { style: "pointer-events:none;display:block" },
          (domElement) => { domElement.innerHTML = rendered; }
        );

        writer.insert(writer.createPositionAt(wrapper, 0), inner);
        return toWidget(wrapper, writer, { label: "bloque matemático" });
      },
    });

    // ── mathInline: dataDowncast ───────────────────────────────────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "mathInline",
      view: (modelElement, { writer }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        return writer.createRawElement(
          "span",
          {
            "data-type": "math-inline",
            "data-latex": latex,
            style: [
              "display:inline-block",
              // "padding:0 3px",
              // "background:#f0f4ff",
              "border-radius:3px",
              // "border:1px solid #c8d8f0",
              "font-family:monospace",
              // "color:#185FA5",
              "font-size:0.95em",
            ].join(";"),
          },
          (domElement) => { domElement.textContent = `\\(${latex}\\)`; }
        );
      },
    });

    // ── mathBlock: dataDowncast ────────────────────────────────────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "mathBlock",
      view: (modelElement, { writer }) => {
        const latex = String(modelElement.getAttribute("latex") ?? "");
        return writer.createRawElement(
          "div",
          {
            "data-type": "math-block",
            "data-latex": latex,
            style: [
              "display:block",
              "text-align:center",
              // "padding:14px 18px",
              // "background:#E6F1FB",
              // "border:0.5px solid #b5d4f4",
              "border-radius:8px",
              "font-family:monospace",
              // "color:#185FA5",
            ].join(";"),
          },
          (domElement) => { domElement.textContent = `\\[${latex}\\]`; }
        );
      },
    });

    // ── upcast: HTML guardado → modelo ─────────────────────────────────────────
    conversion.for("upcast").elementToElement({
      view: { name: "span", attributes: { "data-type": "math-inline" } },
      model: (viewElement, { writer }) => {
        const latex = viewElement.getAttribute("data-latex") ?? "";
        return writer.createElement("mathInline", { latex });
      },
    });

    conversion.for("upcast").elementToElement({
      view: { name: "div", attributes: { "data-type": "math-block" } },
      model: (viewElement, { writer }) => {
        const latex = viewElement.getAttribute("data-latex") ?? "";
        return writer.createElement("mathBlock", { latex });
      },
    });
  }

  // ── Comandos ─────────────────────────────────────────────────────────────────

  private _defineCommands(): void {
    const { editor } = this;
    editor.commands.add("insertMathInline", new InsertMathInlineCommand(editor));
    editor.commands.add("insertMathBlock", new InsertMathBlockCommand(editor));
    editor.commands.add("updateMath", new UpdateMathCommand(editor));
  }

  // ── Botón de toolbar ──────────────────────────────────────────────────────────

  private _defineToolbarButtons(): void {
    const { editor } = this;

    editor.ui.componentFactory.add("insertMath", () => {
      const button = new ButtonView();
      button.set({
        label: "f(x)",
        withText: true,
        tooltip: "Insertar fórmula matemática",
        class: "ck-math-button",
      });
      button.on("execute", () => {
        const config = editor.config.get("math") as MathPluginConfig | undefined;
        config?.onInsert();
      });
      return button;
    });
  }

  // ── Click en widget para editar ───────────────────────────────────────────────

  private _defineClickHandler(): void {
    const { editor } = this;

    editor.editing.view.document.on("click", (_evt, data) => {
      // Ignorar clicks en los botones type-around (flechas naranjas de CKEditor)
      const clickedDom = data.domTarget as HTMLElement | null;
      if (clickedDom?.closest(".ck-widget__type-around__button, .ck-widget__type-around")) {
        return;
      }

      let target = clickedDom;
      while (target && target !== data.domEvent.currentTarget) {
        if (target.classList?.contains("ck-math-widget")) break;
        target = target.parentElement;
      }

      if (!target?.classList?.contains("ck-math-widget")) return;

      const latex = target.getAttribute("data-latex") ?? "";
      const type: "inline" | "block" = target.classList.contains("ck-math-inline")
        ? "inline"
        : "block";

      const viewElement = editor.editing.view.domConverter.domToView(target);
      if (!viewElement) return;

      const modelElement = editor.editing.mapper.toModelElement(
        viewElement as Parameters<typeof editor.editing.mapper.toModelElement>[0]
      );
      if (!modelElement) return;

      const config = editor.config.get("math") as MathPluginConfig | undefined;
      config?.onEdit(latex, type, (newLatex, newType) => {
        editor.execute("updateMath", { element: modelElement, latex: newLatex, type: newType });
      });
    });
  }
}