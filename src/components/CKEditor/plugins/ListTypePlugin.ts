// src/components/CKEditor/plugins/ListTypePlugin.ts
//
// Plugin CKEditor 5 que agrega un dropdown en la toolbar para cambiar
// el atributo `type` de una lista ordenada (<ol type="I">, etc.).
//
// Funciona en conjunción con GeneralHtmlSupport (que ya permite el atributo
// type en ol) — este plugin solo agrega la UI para cambiarlo.
//
// Tipos soportados:
//   1 → decimal (default)
//   a → lower-alpha
//   A → upper-alpha
//   i → lower-roman
//   I → upper-roman

import {
  Plugin,
  Command,
  createDropdown,
  addListToDropdown,
  Collection,
  UIModel,
  type ListDropdownItemDefinition,
} from "ckeditor5";

// ── Opciones ──────────────────────────────────────────────────────────────────

type ListType = "1" | "a" | "A" | "i" | "I";

const LIST_TYPES: { type: ListType; label: string }[] = [
  { type: "1", label: "1, 2, 3  (decimal)" },
  { type: "a", label: "a, b, c  (minúscula)" },
  { type: "A", label: "A, B, C  (mayúscula)" },
  { type: "i", label: "i, ii, iii  (romano min.)" },
  { type: "I", label: "I, II, III  (romano may.)" },
];

// ── SVG ícono ─────────────────────────────────────────────────────────────────

const iconListType = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <text x="1" y="7"  font-size="5.5" font-family="Georgia,serif" fill="currentColor" font-weight="bold">I.</text>
  <text x="1" y="13" font-size="5.5" font-family="Georgia,serif" fill="currentColor" font-weight="bold">II.</text>
  <text x="1" y="19" font-size="5.5" font-family="Georgia,serif" fill="currentColor" font-weight="bold">III.</text>
  <rect x="11" y="4"  width="7" height="1.8" rx="0.9" fill="currentColor" opacity="0.55"/>
  <rect x="11" y="10" width="7" height="1.8" rx="0.9" fill="currentColor" opacity="0.55"/>
  <rect x="11" y="16" width="7" height="1.8" rx="0.9" fill="currentColor" opacity="0.55"/>
</svg>`;

// ── Comando ───────────────────────────────────────────────────────────────────

class SetListTypeCommand extends Command {
  override execute({ type }: { type: ListType }): void {
    const editor = this.editor;
    const selection = editor.model.document.selection;
    const blocks = Array.from(selection.getSelectedBlocks());
    if (blocks.length === 0) return;

    // Modificar el atributo `type` del <ol> en la editing view
    editor.editing.view.change((writer) => {
      for (const block of blocks) {
        const viewElement = editor.editing.mapper.toViewElement(block);
        if (!viewElement) continue;

        // Subir por la jerarquía hasta encontrar el <ol>
        let current = viewElement.parent;
        while (current && current.is("node")) {
          if (current.is("element", "ol")) {
            writer.setAttribute("type", type, current);
            break;
          }
          current = (current as typeof current & { parent: typeof current }).parent;
        }
      }
    });

    // Persistir en el modelo via htmlOlAttributes (usado por GHS en dataDowncast)
    editor.model.change((writer) => {
      for (const block of blocks) {
        if (!block.hasAttribute("listType")) continue;
        const listType = block.getAttribute("listType");
        if (listType !== "numbered" && listType !== "customNumbered") continue;

        writer.setAttribute(
          "htmlOlAttributes",
          { attributes: { type } },
          block,
        );
      }
    });
  }

  override refresh(): void {
    const selection = this.editor.model.document.selection;
    const blocks = Array.from(selection.getSelectedBlocks());
    this.isEnabled = blocks.some(
      (b) =>
        b.hasAttribute("listType") &&
        (b.getAttribute("listType") === "numbered" ||
          b.getAttribute("listType") === "customNumbered"),
    );
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class ListTypePlugin extends Plugin {
  static get pluginName() {
    return "ListTypePlugin" as const;
  }

  init(): void {
    const { editor } = this;

    editor.commands.add("setListType", new SetListTypeCommand(editor));

    editor.ui.componentFactory.add("listType", (locale) => {
      const command = editor.commands.get("setListType")!;
      const dropdown = createDropdown(locale);

      dropdown.buttonView.set({
        label:     "Tipo de numeración",
        icon:      iconListType,
        tooltip:   "Tipo de numeración de lista",
        withText:  false,
      });

      dropdown.buttonView.once("render", () => {
        const iconEl = dropdown.buttonView.element?.querySelector<HTMLElement>(".ck-icon");
        if (iconEl) {
          iconEl.style.width  = "22px";
          iconEl.style.height = "20px";
        }
      });

      dropdown.bind("isEnabled").to(command, "isEnabled");

      // Construir items — mismo patrón que TwoColumnsPlugin / FragmentPlugin
      const items = new Collection<ListDropdownItemDefinition>();
      for (const opt of LIST_TYPES) {
        items.add({
          type: "button" as const,
          model: new UIModel({
            withText:     true,
            label:        opt.label,
            commandParam: opt.type,
          }),
        });
      }

      addListToDropdown(dropdown, items);

      dropdown.on("execute", (evt) => {
        const type = (evt.source as { commandParam?: ListType }).commandParam;
        if (!type) return;
        editor.execute("setListType", { type });
        editor.editing.view.focus();
      });

      return dropdown;
    });
  }
}