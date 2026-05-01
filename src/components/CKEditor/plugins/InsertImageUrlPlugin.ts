import {
  Plugin,
  Command,
  createDropdown,
  addListToDropdown,
  Collection,
  UIModel,
  type ListDropdownItemDefinition,
} from "ckeditor5";

export interface InsertImageUrlPluginConfig {
  onInsertUrl:     () => void;
  onInsertGaleria: () => void;
}

// ── SVG íconos inline (mismos que usa CKEditor internamente) ──────────────────

const iconImage = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M6.91 10.54c.26-.23.64-.21.88.03l3.36 3.14 2.23-2.06a.64.64 0 0 1 .87 0l2.52 2.97V4.5H3.2v10.12l3.71-4.08zm10.27-7.51c.6 0 1.09.47 1.09 1.05v11.84c0 .59-.49 1.06-1.09 1.06H2.79c-.6 0-1.09-.47-1.09-1.06V4.08c0-.58.49-1.05 1.09-1.05h14.39zM5.5 7.29a1.65 1.65 0 1 1 3.3 0 1.65 1.65 0 0 1-3.3 0z"/></svg>';

const iconImageUpload = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M6.91 10.54c.26-.23.64-.21.88.03l3.36 3.14 2.23-2.06a.64.64 0 0 1 .87 0l2.52 2.97V4.5H3.2v10.12l3.71-4.08zm10.27-7.51c.6 0 1.09.47 1.09 1.05v11.84c0 .59-.49 1.06-1.09 1.06H2.79c-.6 0-1.09-.47-1.09-1.06V4.08c0-.58.49-1.05 1.09-1.05h14.39zM5.5 7.29a1.65 1.65 0 1 1 3.3 0 1.65 1.65 0 0 1-3.3 0z"/><path d="M13 1a5 5 0 1 1 0 10A5 5 0 0 1 13 1zm.5 5V3.5h-1V6H11l2 2.5L15 6h-1.5z"/></svg>';

const iconImageUrl = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M6.91 10.54c.26-.23.64-.21.88.03l3.36 3.14 2.23-2.06a.64.64 0 0 1 .87 0l2.52 2.97V4.5H3.2v10.12l3.71-4.08zm10.27-7.51c.6 0 1.09.47 1.09 1.05v11.84c0 .59-.49 1.06-1.09 1.06H2.79c-.6 0-1.09-.47-1.09-1.06V4.08c0-.58.49-1.05 1.09-1.05h14.39zM5.5 7.29a1.65 1.65 0 1 1 3.3 0 1.65 1.65 0 0 1-3.3 0z"/><path d="M10 1h2.5A3.5 3.5 0 1 1 12.5 8H10V6.5h2.5a2 2 0 1 0 0-4H10V1zm-2.5 0H5A3.5 3.5 0 1 0 5 8h2.5V6.5H5a2 2 0 1 1 0-4h2.5V1zM4.5 4v1.5h11V4H4.5z"/></svg>';

const iconGaleria = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2 3.75A.75.75 0 0 1 2.75 3h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75zm0 4A.75.75 0 0 1 2.75 7h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 7.75zm0 4A.75.75 0 0 1 2.75 11h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 2 11.75z"/></svg>';

// ── Comando ───────────────────────────────────────────────────────────────────

class InsertImageFromUrlCommand extends Command {
  override execute({ url, alt = "" }: { url: string; alt?: string }): void {
    this.editor.model.change((writer) => {
      const imageElement = writer.createElement("imageBlock", { src: url, alt });
      this.editor.model.insertObject(imageElement, null, null, { setSelection: "after" });
    });
  }
  override refresh(): void {
    this.isEnabled = true;
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class InsertImageUrlPlugin extends Plugin {
  static get pluginName(): string {
    return "InsertImageUrlPlugin";
  }

  init(): void {
    const { editor } = this;

    editor.commands.add("insertImageFromUrl", new InsertImageFromUrlCommand(editor));

    editor.ui.componentFactory.add("insertImageMenu", (locale) => {
      const dropdown = createDropdown(locale);

      dropdown.buttonView.set({
        icon:    iconImage,
        tooltip: "Insertar imagen",
        label:   "Insertar imagen",
      });

      const items = new Collection<ListDropdownItemDefinition>();

      items.add({
        type: "button" as const,
        model: new UIModel({
          withText:    true,
          label:       "Subir desde computador",
          icon:        iconImageUpload,
          commandName: "uploadImage",
        }),
      });

      items.add({
        type: "button" as const,
        model: new UIModel({
          withText:    true,
          label:       "Insertar por URL",
          icon:        iconImageUrl,
          commandName: "insertImageUrl",
        }),
      });

      items.add({
        type: "button" as const,
        model: new UIModel({
          withText:    true,
          label:       "Mis imágenes (manthano.cl)",
          icon:        iconGaleria,
          commandName: "insertImageGaleria",
        }),
      });

      addListToDropdown(dropdown, items);

      dropdown.on("execute", (evt) => {
        const { commandName } = evt.source as { commandName?: string };
        const config = editor.config.get("insertImageUrl") as InsertImageUrlPluginConfig | undefined;

        if (commandName === "uploadImage") {
          const input = document.createElement("input");
          input.type    = "file";
          input.accept  = "image/*";
          input.onchange = () => {
            const file = input.files?.[0];
            if (file) editor.execute("uploadImage", { file });
          };
          input.click();
        } else if (commandName === "insertImageUrl") {
          config?.onInsertUrl();
        } else if (commandName === "insertImageGaleria") {
          config?.onInsertGaleria();
        }
      });

      return dropdown;
    });
  }
}