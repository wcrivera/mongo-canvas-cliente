// src/components/CKEditor/plugins/InlineColumns.ts
import { Plugin, Command } from "ckeditor5";
import type { ViewDowncastWriter, ModelWriter } from "ckeditor5";

const WRAPPER_DATA_STYLE =
  "display:grid;grid-template-columns:1fr 1fr;gap:1.5em;margin:12px 0;";
const WRAPPER_EDIT_STYLE =
  "display:grid;grid-template-columns:1fr 1fr;gap:1.5em;margin:12px 0;" +
  "border:1.5px dashed #94a3b8;border-radius:6px;padding:8px;";
const COLUMN_STYLE = "padding:4px;min-height:40px;";

export class InsertColumnsCommand extends Command {
  execute() {
    this.editor.model.change((writer: ModelWriter) => {
      const col1 = writer.createElement("columnItem");
      const col2 = writer.createElement("columnItem");
      writer.insertElement("paragraph", col1);
      writer.insertElement("paragraph", col2);
      const wrapper = writer.createElement("twoColumns");
      writer.append(col1, wrapper);
      writer.append(col2, wrapper);
      const pos = this.editor.model.document.selection.getFirstPosition();
      if (pos) this.editor.model.insertObject(wrapper, pos, null, { setSelection: "after" });
    });
  }

  refresh() { this.isEnabled = true; }
}

export class InlineColumns extends Plugin {
  static get pluginName() { return "InlineColumns"; }

  init() {
    const { model, conversion } = this.editor;

    model.schema.register("twoColumns", { allowIn: "$root", isObject: true, isBlock: true });
    model.schema.register("columnItem", { allowIn: "twoColumns", allowContentOf: "$root", isBlock: true });

    conversion.for("dataDowncast").elementToElement({
      model: "twoColumns",
      view:  (_el, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement("div", { style: WRAPPER_DATA_STYLE }),
    });

    conversion.for("editingDowncast").elementToElement({
      model: "twoColumns",
      view:  (_el, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement("div", { style: WRAPPER_EDIT_STYLE, class: "ck-two-columns" }),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "columnItem",
      view:  (_el, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement("div", { style: COLUMN_STYLE }),
    });

    conversion.for("editingDowncast").elementToElement({
      model: "columnItem",
      view:  (_el, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createEditableElement("div", {
          style: COLUMN_STYLE + "border-right:1px dashed #e2e8f0;",
          class: "ck-column-item",
        }),
    });

    conversion.for("upcast").elementToElement({
      view: { name: "div", classes: "ck-two-columns" },
      model: "twoColumns",
    });

    conversion.for("upcast").elementToElement({
      view: { name: "div", classes: "ck-column-item" },
      model: "columnItem",
    });

    this.editor.commands.add("insertColumns", new InsertColumnsCommand(this.editor));
  }
}