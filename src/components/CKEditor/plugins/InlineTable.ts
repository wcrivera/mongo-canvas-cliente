// src/components/CKEditor/plugins/InlineTable.ts
import { Plugin } from "ckeditor5";
import type { ViewDowncastWriter } from "ckeditor5";

const TABLE_STYLE =
  "border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;margin:12px 0;";
const TH_STYLE =
  "border:1px solid #94a3b8;padding:8px 12px;vertical-align:top;" +
  "background:#f0f4f8;font-weight:600;color:#1f2c38;text-align:left;";
const TD_STYLE =
  "border:1px solid #d1d5db;padding:8px 12px;vertical-align:top;color:#374151;";

export class InlineTable extends Plugin {
  static get pluginName() { return "InlineTable"; }

  init() {
    const { conversion } = this.editor;

    conversion.for("dataDowncast").elementToElement({
      model: "table",
      view:  (_modelElement, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement("table", { style: TABLE_STYLE }),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "tableRow",
      view:  (_modelElement, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement("tr", {}),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        // Primera fila → th, resto → td
        const isHeader =
          modelElement.parent && "index" in modelElement.parent && modelElement.parent.index === 0 &&
          modelElement.parent?.parent?.name === "table";
        const tag   = isHeader ? "th" : "td";
        const style = isHeader ? TH_STYLE : TD_STYLE;
        return writer.createEditableElement(tag, { style });
      },
    });

    conversion.for("upcast").elementToElement({ view: "table",  model: "table" });
    conversion.for("upcast").elementToElement({ view: "tr",     model: "tableRow" });
    conversion.for("upcast").elementToElement({ view: "td",     model: "tableCell" });
    conversion.for("upcast").elementToElement({ view: "th",     model: "tableCell" });
  }
}