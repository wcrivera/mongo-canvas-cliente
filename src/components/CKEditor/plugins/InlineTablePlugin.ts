import { Plugin } from "ckeditor5";

/**
 * InlineTablePlugin (Tailwind)
 *
 * dataDowncast del Table sin el wrapper <figure class="table">, emitiendo
 * clases Tailwind. Conserva la lógica de colspan/rowspan y detección th/td.
 */
export class InlineTablePlugin extends Plugin {
  static get pluginName(): string {
    return "InlineTablePlugin";
  }

  init(): void {
    const { conversion } = this.editor;

    conversion.for("dataDowncast").elementToElement({
      model: "table",
      converterPriority: "high",
      view: (_m, { writer }) =>
        writer.createContainerElement("table", {
          class: "border-collapse w-full my-3",
        }),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "tableRow",
      converterPriority: "high",
      view: (_m, { writer }) => writer.createContainerElement("tr"),
    });

    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      converterPriority: "high",
      view: (modelElement, { writer }) => {
        const tableRaw = modelElement.parent?.parent;
        const row = modelElement.parent;
        const table = tableRaw?.is("element") ? tableRaw : undefined;

        const tableIterable =
          table != null &&
          typeof (table as unknown as { [Symbol.iterator]?: unknown })[
            Symbol.iterator
          ] === "function";
        const rowIterable =
          row != null &&
          typeof (row as unknown as { [Symbol.iterator]?: unknown })[
            Symbol.iterator
          ] === "function";

        const headingRows =
          (table?.getAttribute("headingRows") as number | undefined) ?? 0;
        const headingColumns =
          (table?.getAttribute("headingColumns") as number | undefined) ?? 0;

        const rowIndex = tableIterable
          ? [...(table as unknown as Iterable<unknown>)].indexOf(
              row as unknown,
            )
          : -1;
        const colIndex = rowIterable
          ? [...(row as unknown as Iterable<unknown>)].indexOf(modelElement)
          : -1;

        const isHeader =
          (headingRows > 0 && rowIndex >= 0 && rowIndex < headingRows) ||
          (headingColumns > 0 && colIndex >= 0 && colIndex < headingColumns);

        const tagName = isHeader ? "th" : "td";

        const cls = isHeader
          ? "border border-slate-300 px-2.5 py-1.5 align-top leading-normal font-semibold bg-slate-100 text-left"
          : "border border-slate-300 px-2.5 py-1.5 align-top leading-normal";

        const attrs: Record<string, string> = { class: cls };

        const colspan = modelElement.getAttribute("colspan") as
          | number
          | undefined;
        const rowspan = modelElement.getAttribute("rowspan") as
          | number
          | undefined;
        if (colspan && colspan > 1) attrs["colspan"] = String(colspan);
        if (rowspan && rowspan > 1) attrs["rowspan"] = String(rowspan);

        return writer.createContainerElement(tagName, attrs);
      },
    });
  }
}