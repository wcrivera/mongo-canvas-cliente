/**
 * MultiColumnListPlugin.ts
 *
 * Plugin CKEditor 5 para insertar listas distribuidas en múltiples columnas.
 * Útil para enumeraciones en diapositivas (ej: 4 columnas de ítems).
 *
 * Estructura del modelo:
 *   <multiColList cols="3">
 *     <multiColListItem> ← isLimit, allowContentOf "$block" (texto + LaTeX)
 *     <multiColListItem>
 *     ...
 *   </multiColList>
 *
 * Estructura del HTML guardado:
 *   <ul class="grid grid-cols-3 gap-4 list-none" data-col-list="3">
 *     <li class="flex items-start gap-2">
 *       <span class="text-blue-500 font-bold mt-0.5">•</span>
 *       <span>contenido</span>
 *     </li>
 *   </ul>
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
  ButtonView,
  type ListDropdownItemDefinition,
} from "ckeditor5";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ColCount = 2 | 3 | 4;

export const COL_LABELS: Record<ColCount, string> = {
  2: "2 columnas",
  3: "3 columnas",
  4: "4 columnas",
};

const COL_COUNTS: ColCount[] = [2, 3, 4];

// ── SVG ícono ─────────────────────────────────────────────────────────────────

const iconColList = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <rect x="2"  y="3" width="4" height="14" rx="1" fill="currentColor" opacity="0.9"/>
  <rect x="8"  y="3" width="4" height="14" rx="1" fill="currentColor" opacity="0.6"/>
  <rect x="14" y="3" width="4" height="14" rx="1" fill="currentColor" opacity="0.35"/>
</svg>`;

// ── Icono para agregar ítem ────────────────────────────────────────────────────

const iconAddItem = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// ── Comandos ──────────────────────────────────────────────────────────────────

class InsertMultiColListCommand extends Command {
  override execute({ cols }: { cols: ColCount }): void {
    this.editor.model.change((writer) => {
      const list = writer.createElement("multiColList", { cols });

      // Insertar 3 ítems vacíos por defecto
      for (let i = 0; i < 3; i++) {
        const item = writer.createElement("multiColListItem");
        writer.appendText("", item);
        writer.append(item, list);
      }

      this.editor.model.insertObject(list);

      // Cursor en el primer ítem
      const firstItem = list.getChild(0);
      if (firstItem) {
        writer.setSelection(writer.createPositionAt(firstItem, 0));
      }
    });
  }

  override refresh(): void {
    const model     = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition()!,
      "multiColList",
    );
    this.isEnabled = allowedIn !== null;
  }
}

class AddMultiColListItemCommand extends Command {
  override execute(): void {
    const { model } = this.editor;
    const pos = model.document.selection.getFirstPosition();
    const listNode = (pos?.findAncestor("multiColListItem"))?.parent
                  ?? pos?.findAncestor("multiColList");

    if (!listNode || listNode.name !== "multiColList") return;

    model.change((writer) => {
      const item = writer.createElement("multiColListItem");
      writer.appendText("", item);
      writer.append(item, listNode);
      writer.setSelection(writer.createPositionAt(item, 0));
    });
  }

  override refresh(): void {
    const pos = this.editor.model.document.selection.getFirstPosition();
    this.isEnabled = !!(
      pos?.findAncestor("multiColList") ||
      pos?.findAncestor("multiColListItem")
    );
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class MultiColumnListPlugin extends Plugin {
  static get requires() { return [Widget] as const; }
  static get pluginName() { return "MultiColumnListPlugin" as const; }

  init(): void {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add("insertMultiColList",    new InsertMultiColListCommand(this.editor));
    this.editor.commands.add("addMultiColListItem",   new AddMultiColListItemCommand(this.editor));

    this._defineToolbar();
    this._handleEnterKey();
  }

  // ── Schema ─────────────────────────────────────────────────────────────────

  private _defineSchema(): void {
    const { schema } = this.editor.model;

    schema.register("multiColList", {
      inheritAllFrom:  "$blockObject",
      allowAttributes: ["cols"],
    });

    schema.register("multiColListItem", {
      isLimit:        true,
      allowIn:        "multiColList",
      allowContentOf: "$block",  // texto + inline (LaTeX, bold, etc.)
    });
  }

  // ── Converters ─────────────────────────────────────────────────────────────

  private _defineConverters(): void {
    const { conversion } = this.editor;

    // ── multiColList ──────────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      view: { name: "ul", attributes: { "data-col-list": true } },
      model: (viewEl, { writer }) => {
        const cols = Number(viewEl.getAttribute("data-col-list") ?? 3) as ColCount;
        return writer.createElement("multiColList", { cols });
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "multiColList",
      view: (modelEl, { writer }) => {
        const cols = (modelEl.getAttribute("cols") ?? 3) as ColCount;
        return writer.createContainerElement("ul", {
          class:         `grid grid-cols-${cols} gap-4 list-none p-0 m-0`,
          "data-col-list": String(cols),
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "multiColList",
      view: (modelEl, { writer }) => {
        const cols = (modelEl.getAttribute("cols") ?? 3) as ColCount;
        const section = writer.createContainerElement("div", {
          class: "ck-multi-col-list",
          style: [
            `display:grid`,
            `grid-template-columns:repeat(${cols}, 1fr)`,
            "gap:1em",
            "padding:0.5em",
            "border:1.5px dashed #c9dae8",
            "border-radius:8px",
            "margin:0.5em 0",
            "background:rgba(74,109,140,0.03)",
          ].join(";"),
          "data-col-list": String(cols),
        });
        return toWidget(section, writer, {
          label: `Lista ${cols} columnas`,
          hasSelectionHandle: true,
        });
      },
    });

    // ── multiColListItem ──────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      view: { name: "li", classes: "col-list-item" },
      model: (_viewEl, { writer }) => writer.createElement("multiColListItem"),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "multiColListItem",
      view: (_modelEl, { writer }) =>
        writer.createContainerElement("li", {
          class: "col-list-item flex items-start gap-2",
          style: "list-style:none;",
        }),
    });

    conversion.for("editingDowncast").elementToElement({
      model: "multiColListItem",
      view: (_modelEl, { writer }) => {
        const div = writer.createEditableElement("div", {
          style: [
            "min-height:1.8em",
            "padding:4px 8px",
            "border-radius:4px",
            "border:1px solid #e2e8f0",
            "background:white",
            "font-size:0.9em",
          ].join(";"),
        });
        return toWidgetEditable(div, writer);
      },
    });
  }

  // ── Enter en ítem → agregar nuevo ítem ────────────────────────────────────

  private _handleEnterKey(): void {
    const { editor } = this;

    editor.editing.view.document.on("keydown", (_evt, data) => {
      if (data.domEvent.key !== "Enter") return;

      const pos = editor.model.document.selection.getFirstPosition();
      if (!pos?.findAncestor("multiColListItem")) return;

      data.domEvent.preventDefault();
      editor.execute("addMultiColListItem");
    }, { priority: "high" });
  }

  // ── Toolbar ────────────────────────────────────────────────────────────────

  private _defineToolbar(): void {
    const { editor } = this;

    // Dropdown para insertar nueva lista
    editor.ui.componentFactory.add("insertMultiColList", (locale) => {
      const dropdown = createDropdown(locale);
      const command  = editor.commands.get("insertMultiColList")!;

      dropdown.buttonView.set({
        icon:     iconColList,
        label:    "Lista multicolumna",
        tooltip:  "Insertar lista en columnas",
        withText: false,
      });

      dropdown.buttonView.once("render", () => {
        const iconEl = dropdown.buttonView.element?.querySelector<HTMLElement>(".ck-icon");
        if (iconEl) { iconEl.style.width = "20px"; iconEl.style.height = "20px"; }
      });

      dropdown.bind("isEnabled").to(command, "isEnabled");

      const items = new Collection<ListDropdownItemDefinition>();
      for (const cols of COL_COUNTS) {
        items.add({
          type: "button" as const,
          model: new UIModel({
            withText:     true,
            label:        COL_LABELS[cols],
            commandParam: cols,
          }),
        });
      }

      addListToDropdown(dropdown, items);

      dropdown.on("execute", (evt) => {
        const cols = (evt.source as { commandParam?: ColCount }).commandParam;
        if (!cols) return;
        editor.execute("insertMultiColList", { cols });
        editor.editing.view.focus();
      });

      return dropdown;
    });

    // Botón para agregar ítem a la lista activa
    editor.ui.componentFactory.add("addMultiColListItem", (locale) => {
      const button  = new ButtonView(locale);
      const command = editor.commands.get("addMultiColListItem")!;

      button.set({
        icon:    iconAddItem,
        label:   "Agregar ítem",
        tooltip: "Agregar ítem a la lista",
      });

      button.bind("isEnabled").to(command, "isEnabled");
      button.on("execute", () => {
        editor.execute("addMultiColListItem");
        editor.editing.view.focus();
      });

      return button;
    });
  }
}