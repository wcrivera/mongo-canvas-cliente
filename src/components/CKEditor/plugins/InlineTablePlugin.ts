import { Plugin } from "ckeditor5";

/**
 * InlineTablePlugin
 *
 * Sobreescribe los conversores dataDowncast del plugin Table de CKEditor
 * para emitir estilos inline en lugar del wrapper <figure class="table">
 * y clases CSS.
 *
 * Maneja correctamente:
 *  - colspan y rowspan
 *  - celdas header (th) vs normales (td)
 *  - thead/tbody automático según headingRows
 */
export class InlineTablePlugin extends Plugin {
  static get pluginName(): string {
    return "InlineTablePlugin";
  }

  init(): void {
    const { conversion } = this.editor;

    // ── table → <table style="..."> (sin <figure> wrapper) ────────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "table",
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("table", {
          style: [
            "border-collapse:collapse",
            "width:100%",
            "margin:0.75em 0",
            "font-size:inherit",
          ].join(";"),
        }),
    });

    // ── tableRow → <tr> ────────────────────────────────────────────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "tableRow",
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("tr"),
    });

    // ── tableCell → <td> o <th> con estilos inline ─────────────────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      converterPriority: "high",
      view: (modelElement, { writer }) => {
        type TableLike = {
          getAttribute(key: string): unknown;
          [Symbol.iterator](): Iterator<unknown>;
        };

        const table = modelElement.parent?.parent as TableLike | undefined;
        const headingRows =
          (table?.getAttribute("headingRows") as number | undefined) ?? 0;
        const headingColumns =
          (table?.getAttribute("headingColumns") as number | undefined) ?? 0;

        const row = modelElement.parent;
        const rowIndex = table
          ? [...table].indexOf(row as unknown)
          : -1;
        const colIndex = row
          ? [...(row as unknown as Iterable<unknown>)].indexOf(modelElement)
          : -1;

        const isHeader =
          (headingRows > 0 && rowIndex < headingRows) ||
          (headingColumns > 0 && colIndex < headingColumns);

        const tagName = isHeader ? "th" : "td";

        const baseStyle = [
          "border:1px solid #cbd5e1",
          "padding:6px 10px",
          "vertical-align:top",
          "line-height:1.5",
        ];

        if (isHeader) {
          baseStyle.push(
            "font-weight:600",
            "background:#f1f5f9",
            "text-align:left"
          );
        }

        // Construir atributos — colspan y rowspan se agregan si existen
        const attrs: Record<string, string> = {
          style: baseStyle.join(";"),
        };

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