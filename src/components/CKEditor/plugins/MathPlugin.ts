/**
 * MathPlugin.ts
 *
 * Plugin CKEditor 5 para fórmulas LaTeX.
 *
 * UPCAST  : acepta Tiptap legado, formato intermedio y \(...\) / \[...\]
 * EDITING : KaTeX visual
 *   - mathInline: RawElement (inline widget)
 *   - mathBlock:  ContainerElement decorado con toWidget() → activa las
 *                 flechas de inserción de párrafo arriba/abajo
 * DATA    : emite \(...\) y \[...\] limpios para la DB
 * TOOLBAR : botón f(x) para insertar nueva fórmula
 * CLICK   : abre modal de edición al hacer clic en una fórmula
 */

import { Plugin, ButtonView, Command, Widget, toWidget } from "ckeditor5";
import type { Editor } from "ckeditor5";
import katex from "katex";

// ── Tipos del config ──────────────────────────────────────────────────────────

export interface MathPluginConfig {
  onInsert: () => void;
  onEdit: (
    latex: string,
    type: "inline" | "block",
    onSave: (newLatex: string, newType: "inline" | "block") => void,
  ) => void;
}

// ── Helpers KaTeX ─────────────────────────────────────────────────────────────

function renderKatexInline(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    return latex;
  }
}

function renderKatexBlock(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
    });
  } catch {
    return latex;
  }
}

// ── Ícono f(x) ────────────────────────────────────────────────────────────────

// const iconFx = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//   <text x="1" y="15" font-family="Georgia,serif" font-style="italic" font-size="13" fill="currentColor">f</text>
//   <text x="8" y="15" font-family="Georgia,serif" font-size="13" fill="currentColor">(((x)</text>
// </svg>`;

const iconFx = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <text x="0" y="15" font-family="Georgia,serif" font-style="italic" font-size="13" fill="currentColor">f</text>
  <text x="7" y="15" font-family="Georgia,serif" font-size="13" fill="currentColor">(x)</text>
</svg>`;

// ── Comandos ──────────────────────────────────────────────────────────────────

class InsertMathInlineCommand extends Command {
  override execute({ latex }: { latex: string }): void {
    this.editor.model.change((writer) => {
      const node = writer.createElement("mathInline", { latex });
      this.editor.model.insertObject(node, null, null, {
        setSelection: "after",
      });
    });
  }
  override refresh(): void {
    this.isEnabled = true;
  }
}

class InsertMathBlockCommand extends Command {
  override execute({ latex }: { latex: string }): void {
    this.editor.model.change((writer) => {
      const node = writer.createElement("mathBlock", { latex });
      this.editor.model.insertObject(node, null, null, {
        setSelection: "after",
      });
    });
  }
  override refresh(): void {
    this.isEnabled = true;
  }
}

class UpdateMathCommand extends Command {
  override execute({
    latex,
    type,
  }: {
    latex: string;
    type: "inline" | "block";
  }): void {
    const { model } = this.editor;
    const selected = model.document.selection.getSelectedElement();
    if (!selected) return;

    const currentType = selected.name as "mathInline" | "mathBlock";

    if (
      (type === "inline" && currentType === "mathInline") ||
      (type === "block" && currentType === "mathBlock")
    ) {
      model.change((writer) => {
        writer.setAttribute("latex", latex, selected);
      });
    } else {
      const newName = type === "inline" ? "mathInline" : "mathBlock";
      model.change((writer) => {
        const newNode = writer.createElement(newName, { latex });
        writer.insert(newNode, selected, "before");
        writer.remove(selected);
        writer.setSelection(writer.createRangeOn(newNode));
      });
    }
  }

  override refresh(): void {
    const selected = this.editor.model.document.selection.getSelectedElement();
    this.isEnabled =
      selected?.name === "mathInline" || selected?.name === "mathBlock";
  }
}

// ── Plugin principal ──────────────────────────────────────────────────────────

export class MathPlugin extends Plugin {
  // Widget es requerido como dependencia para que toWidget() funcione
  static get requires() {
    return [Widget] as const;
  }

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

    // editor.model.schema.register("mathBlock", {
    //   allowWhere: "$text", // ← inline en el modelo, igual que mathInline
    //   isInline: true, // ← inline → no genera párrafos vacíos automáticos
    //   isObject: true,
    //   allowAttributes: ["latex"],
    // });

    // ── Comandos ─────────────────────────────────────────────────────────────

    editor.commands.add(
      "insertMathInline",
      new InsertMathInlineCommand(editor),
    );
    editor.commands.add("insertMathBlock", new InsertMathBlockCommand(editor));
    editor.commands.add("updateMath", new UpdateMathCommand(editor));

    // ── Upcast ───────────────────────────────────────────────────────────────

    // Tiptap legado inline
    editor.conversion.for("upcast").elementToElement({
      view: { name: "span", attributes: { "data-type": "inline-math" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathInline", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });
    // Tiptap legado block
    editor.conversion.for("upcast").elementToElement({
      view: { name: "div", attributes: { "data-type": "block-math" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathBlock", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });
    // Formato intermedio inline
    editor.conversion.for("upcast").elementToElement({
      view: { name: "span", attributes: { "data-type": "math-inline" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathInline", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });
    // Formato intermedio block
    editor.conversion.for("upcast").elementToElement({
      view: { name: "div", attributes: { "data-type": "math-block" } },
      model: (viewEl, { writer }) =>
        writer.createElement("mathBlock", {
          latex: viewEl.getAttribute("data-latex") ?? "",
        }),
    });

    // ── Editing Downcast ────────────────────────────────────────────────────

    // mathInline: RawElement con cursor:pointer para el click handler
    editor.conversion.for("editingDowncast").elementToElement({
      model: "mathInline",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        return writer.createRawElement(
          "span",
          {
            class: "ck-math-inline",
            "data-latex": latex,
            style:
              "display:inline-flex;align-items:center;cursor:pointer;" +
              "background: #eef3f8b8;border:1px solid #c9dae8b7;" +
              "border-radius:4px;padding:0px 0px;margin:0 0px;vertical-align:middle;",
          },
          (el) => {
            el.innerHTML = renderKatexInline(latex);
          },
        );
      },
    });

    // mathBlock: ContainerElement + toWidget()
    // toWidget() registra el elemento como widget CKEditor → activa las
    // flechas de inserción de párrafo (TypeAround) y la selección con click.
    editor.conversion.for("editingDowncast").elementToElement({
      model: "mathBlock",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";

        // Creamos un ContainerElement (no RawElement) para que toWidget funcione
        const container = writer.createContainerElement("div", {
          class: "ck-math-block",
          "data-latex": latex,
          style:
            "text-align:center;padding:0px;margin:0px;" +
            "background: #eef3f8b8;border:1px solid #c9dae8b7;" +
            "border-radius:4px;padding:0px 0px;margin:0 0px;vertical-align:middle;",
        });

        // RawElement interno para el HTML de KaTeX (no editable)
        const inner = writer.createRawElement(
          "div",
          { style: "pointer-events:none;" },
          (el) => {
            el.innerHTML = renderKatexBlock(latex);
          },
        );

        writer.insert(writer.createPositionAt(container, 0), inner);

        // toWidget() activa el TypeAround (flechas arriba/abajo) y el
        // comportamiento de widget: selección, teclas de borrado, etc.
        return toWidget(container, writer, { label: "Fórmula LaTeX" });
      },
    });

    // ── Data Downcast ───────────────────────────────────────────────────────

    editor.conversion.for("dataDowncast").elementToElement({
      model: "mathInline",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        return writer.createRawElement("span", {}, (el) => {
          el.textContent = `\\(${latex}\\)`;
        });
      },
    });

    editor.conversion.for("dataDowncast").elementToElement({
      model: "mathBlock",
      view: (modelEl, { writer }) => {
        const latex = (modelEl.getAttribute("latex") as string) ?? "";
        return writer.createRawElement("span", {}, (el) => {
          el.textContent = `\\[${latex}\\]`;
        });
      },
    });

    // ── Click handler ───────────────────────────────────────────────────────
    // Para mathInline usamos el evento click de la vista.
    // Para mathBlock, el widget captura el click vía selección —
    // escuchamos el cambio de selección del modelo.

    // Click en mathInline (RawElement, no widget)
    editor.editing.view.document.on("click", (_evt, data) => {
      const config = editor.config.get("math") as MathPluginConfig | undefined;
      if (!config?.onEdit) return;

      const domTarget = data.domTarget as HTMLElement | null;
      if (!domTarget) return;

      const mathEl = domTarget.closest<HTMLElement>(".ck-math-inline");
      if (!mathEl) return;

      const latex = mathEl.getAttribute("data-latex") ?? "";

      // Seleccionar el nodo modelo
      const viewEl = editor.editing.view.domConverter.domToView(mathEl);
      if (viewEl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modelEl = editor.editing.mapper.toModelElement(viewEl as any);
        if (modelEl) {
          editor.model.change((writer) => {
            writer.setSelection(writer.createRangeOn(modelEl));
          });
        }
      }

      data.preventDefault();

      config.onEdit(latex, "inline", (newLatex, newType) => {
        editor.execute("updateMath", { latex: newLatex, type: newType });
        editor.editing.view.focus();
      });
    });

    // Doble click en mathBlock (widget — el click simple lo usa CKEditor para seleccionar)
    editor.editing.view.document.on("dblclick", (_evt, data) => {
      const config = editor.config.get("math") as MathPluginConfig | undefined;
      if (!config?.onEdit) return;

      const domTarget = data.domTarget as HTMLElement | null;
      if (!domTarget) return;

      const mathEl =
        domTarget.closest<HTMLElement>(".ck-math-block") ??
        domTarget.closest<HTMLElement>("[data-latex]");

      // Solo si tiene clase ck-math-block (el widget de bloque)
      if (!mathEl?.classList.contains("ck-math-block")) return;

      const latex = mathEl.getAttribute("data-latex") ?? "";
      data.preventDefault();

      config.onEdit(latex, "block", (newLatex, newType) => {
        editor.execute("updateMath", { latex: newLatex, type: newType });
        editor.editing.view.focus();
      });
    });

    // ── Toolbar: botón f(x) ─────────────────────────────────────────────────

    editor.ui.componentFactory.add("insertMath", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: "Insertar fórmula",
        icon: iconFx,
        tooltip: true,
      });

      // Agrandar el ícono después del render
      button.once("render", () => {
        const iconEl = button.element?.querySelector<HTMLElement>(".ck-icon");
        if (iconEl) {
          iconEl.style.width = "32px"; // ← ajusta aquí
          iconEl.style.height = "24px";
        }
      });

      button.on("execute", () => {
        const config = editor.config.get("math") as
          | MathPluginConfig
          | undefined;
        config?.onInsert();
      });

      return button;
    });
  }
}
