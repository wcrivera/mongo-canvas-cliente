/**
 * TwoColumnsPlugin.ts
 *
 * Plugin CKEditor 5 para insertar bloques de dos columnas con diferentes ratios.
 * El HTML generado usa clases Tailwind para que se vea correctamente en el
 * HTML final de Reveal.js (que incluye Tailwind CDN).
 *
 * Estructura del modelo:
 *   <twoColumns ratio="6-6">
 *     <twoColumnsLeft>  ← isLimit, allowContentOf "$root"
 *     <twoColumnsRight> ← isLimit, allowContentOf "$root"
 *   </twoColumns>
 *
 * Estructura del HTML guardado (data downcast):
 *   <div class="grid grid-cols-12 gap-6" data-two-columns="6-6">
 *     <div class="col-span-6 two-col-left">...</div>
 *     <div class="col-span-6 two-col-right">...</div>
 *   </div>
 */

import {
  Plugin,
  Command,
  Widget,
  toWidget,
  toWidgetEditable,
  createDropdown,
  addListToDropdown,
  Collection,
  UIModel,
  type ListDropdownItemDefinition,
} from "ckeditor5";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ColumnRatio = "6-6" | "4-8" | "8-4" | "3-9" | "9-3";

export const RATIO_LABELS: Record<ColumnRatio, string> = {
  "6-6": "½ — ½  (igual)",
  "4-8": "⅓ — ⅔  (izq. angosta)",
  "8-4": "⅔ — ⅓  (der. angosta)",
  "3-9": "¼ — ¾  (izq. muy angosta)",
  "9-3": "¾ — ¼  (der. muy angosta)",
};

// Ancho en col-span de 12 para cada ratio
const RATIO_SPANS: Record<ColumnRatio, [number, number]> = {
  "6-6": [6, 6],
  "4-8": [4, 8],
  "8-4": [8, 4],
  "3-9": [3, 9],
  "9-3": [9, 3],
};

const RATIOS_ORDEN: ColumnRatio[] = ["6-6", "4-8", "8-4", "3-9", "9-3"];

// ── SVG ícono ─────────────────────────────────────────────────────────────────

const iconTwoCol = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <rect x="2" y="3" width="7" height="14" rx="1.5" fill="currentColor" opacity="0.9"/>
  <rect x="11" y="3" width="7" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
</svg>`;

// ── Comando ───────────────────────────────────────────────────────────────────

class InsertTwoColumnsCommand extends Command {
  override execute({ ratio }: { ratio: ColumnRatio }): void {
    this.editor.model.change((writer) => {
      const block = writer.createElement("twoColumns", { ratio });
      const left = writer.createElement("twoColumnsLeft");
      const right = writer.createElement("twoColumnsRight");

      writer.appendElement("paragraph", left);
      writer.appendElement("paragraph", right);
      writer.append(left, block);
      writer.append(right, block);

      this.editor.model.insertObject(block);
    });
  }

  override refresh(): void {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition()!,
      "twoColumns",
    );
    this.isEnabled = allowedIn !== null;
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class TwoColumnsPlugin extends Plugin {
  static get requires() {
    return [Widget] as const;
  }
  static get pluginName() {
    return "TwoColumnsPlugin" as const;
  }

  init(): void {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertTwoColumns",
      new InsertTwoColumnsCommand(this.editor),
    );
    this._defineToolbar();
  }

  private _defineSchema(): void {
    const { schema } = this.editor.model;

    schema.register("twoColumns", {
      inheritAllFrom: "$blockObject",
      allowAttributes: ["ratio"],
    });

    schema.register("twoColumnsLeft", {
      isLimit: true,
      allowIn: "twoColumns",
      allowContentOf: "$root",
    });

    schema.register("twoColumnsRight", {
      isLimit: true,
      allowIn: "twoColumns",
      allowContentOf: "$root",
    });

    // No permitir columnas anidadas
    schema.addChildCheck((context, childDefinition) => {
      if (
        (context.endsWith("twoColumnsLeft") ||
          context.endsWith("twoColumnsRight")) &&
        childDefinition.name === "twoColumns"
      )
        return false;
    });
  }

  private _defineConverters(): void {
    const { conversion } = this.editor;

    // ── twoColumns ────────────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      view: { name: "div", attributes: { "data-two-columns": true } },
      model: (viewEl, { writer }) => {
        const ratio = (viewEl.getAttribute("data-two-columns") ??
          "6-6") as ColumnRatio;
        return writer.createElement("twoColumns", { ratio });
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "twoColumns",
      view: (modelEl, { writer }) => {
        const ratio = (modelEl.getAttribute("ratio") ?? "6-6") as ColumnRatio;
        return writer.createContainerElement("div", {
          class: "grid grid-cols-12 gap-6",
          "data-two-columns": ratio,
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "twoColumns",
      view: (modelEl, { writer }) => {
        const ratio = (modelEl.getAttribute("ratio") ?? "6-6") as ColumnRatio;
        const [l, r] = RATIO_SPANS[ratio];
        const section = writer.createContainerElement("div", {
          class: "ck-two-columns",
          style: [
            "display:grid",
            `grid-template-columns:${l}fr ${r}fr`,
            "gap:0em 1em",
            "padding:0em",
            "border:1.5px dashed #c9dae8",
            "border-radius:0px",
            "margin:0em 0",
            // "background:rgba(74,109,140,0.03)",
          ].join(";"),
          "data-two-columns": ratio,
        });
        return toWidget(section, writer, {
          label: `Dos columnas ${ratio}`,
          hasSelectionHandle: true,
        });
      },
    });

    // ── twoColumnsLeft ────────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      view: { name: "div", classes: "two-col-left" },
      model: (_viewEl, { writer }) => writer.createElement("twoColumnsLeft"),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "twoColumnsLeft",
      view: (modelEl, { writer }) => {
        const ratio =
          ((
            modelEl.parent as { getAttribute: (k: string) => unknown }
          ).getAttribute("ratio") as ColumnRatio) ?? "6-6";
        const [l] = RATIO_SPANS[ratio];
        return writer.createContainerElement("div", {
          class: `col-span-${l} two-col-left`,
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "twoColumnsLeft",
      view: (_modelEl, { writer }) => {
        const div = writer.createEditableElement("div", {
          style:
            "min-height:0em;padding:0em 0em; border-right:1px dashed #c9dae8;",
        });
        return toWidgetEditable(div, writer);
      },
    });

    // ── twoColumnsRight ───────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      view: { name: "div", classes: "two-col-right" },
      model: (_viewEl, { writer }) => writer.createElement("twoColumnsRight"),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "twoColumnsRight",
      view: (modelEl, { writer }) => {
        const ratio =
          ((
            modelEl.parent as { getAttribute: (k: string) => unknown }
          ).getAttribute("ratio") as ColumnRatio) ?? "6-6";
        const [, r] = RATIO_SPANS[ratio];
        return writer.createContainerElement("div", {
          class: `col-span-${r} two-col-right`,
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "twoColumnsRight",
      view: (_modelEl, { writer }) => {
        const div = writer.createEditableElement("div", {
          style: "min-height:0em;padding:0em 0em; border-left:1px dashed #c9dae8;",
        });
        return toWidgetEditable(div, writer);
      },
    });
  }

  private _defineToolbar(): void {
    const { editor } = this;

    editor.ui.componentFactory.add("insertTwoColumns", (locale) => {
      const dropdown = createDropdown(locale);
      const command = editor.commands.get("insertTwoColumns")!;

      dropdown.buttonView.set({
        icon: iconTwoCol,
        label: "Dos columnas",
        tooltip: "Insertar bloque de dos columnas",
        withText: false,
      });

      dropdown.buttonView.once("render", () => {
        const iconEl =
          dropdown.buttonView.element?.querySelector<HTMLElement>(".ck-icon");
        if (iconEl) {
          iconEl.style.width = "20px";
          iconEl.style.height = "20px";
        }
      });

      dropdown.bind("isEnabled").to(command, "isEnabled");

      const items = new Collection<ListDropdownItemDefinition>();
      for (const ratio of RATIOS_ORDEN) {
        items.add({
          type: "button" as const,
          model: new UIModel({
            withText: true,
            label: RATIO_LABELS[ratio],
            commandParam: ratio,
          }),
        });
      }

      addListToDropdown(dropdown, items);

      dropdown.on("execute", (evt) => {
        const ratio = (evt.source as { commandParam?: ColumnRatio })
          .commandParam;
        if (!ratio) return;
        editor.execute("insertTwoColumns", { ratio });
        editor.editing.view.focus();
      });

      return dropdown;
    });
  }
}
