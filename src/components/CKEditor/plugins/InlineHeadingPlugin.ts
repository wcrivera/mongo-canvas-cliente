import { Plugin } from "ckeditor5";

/**
 * InlineHeadingPlugin
 *
 * Sobreescribe los conversores de heading para que:
 *  - editingDowncast: los headings se vean con el tamaño correcto DENTRO del editor
 *  - dataDowncast: el HTML emitido use estilos inline en lugar de clases CKEditor
 *
 * Sin este plugin, H1/H2/H3 se ven idénticos al párrafo en el editor
 * porque CKEditor depende de su propio CSS que no tenemos.
 */
export class InlineHeadingPlugin extends Plugin {
  static get pluginName(): string {
    return "InlineHeadingPlugin";
  }

  init(): void {
    const { conversion } = this.editor;

    // ── H1 ────────────────────────────────────────────────────────────────────

    conversion.for("editingDowncast").elementToElement({
      model: { name: "heading1", attributes: [] },
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("h1", {
          style: [
            "font-size:2em",
            "font-weight:700",
            "line-height:1.2",
            "margin:0.5em 0",
            "color:inherit",
          ].join(";"),
        }),
    });

    conversion.for("dataDowncast").elementToElement({
      model: { name: "heading1", attributes: [] },
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("h1", {
          style: [
            "font-size:2em",
            "font-weight:700",
            "line-height:1.2",
            "margin:0.67em 0",
          ].join(";"),
        }),
    });

    // ── H2 ────────────────────────────────────────────────────────────────────

    conversion.for("editingDowncast").elementToElement({
      model: { name: "heading2", attributes: [] },
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("h2", {
          style: [
            "font-size:1.5em",
            "font-weight:700",
            "line-height:1.3",
            "margin:0.5em 0",
            "color:inherit",
          ].join(";"),
        }),
    });

    conversion.for("dataDowncast").elementToElement({
      model: { name: "heading2", attributes: [] },
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("h2", {
          style: [
            "font-size:1.5em",
            "font-weight:700",
            "line-height:1.3",
            "margin:0.75em 0",
          ].join(";"),
        }),
    });

    // ── H3 ────────────────────────────────────────────────────────────────────

    conversion.for("editingDowncast").elementToElement({
      model: { name: "heading3", attributes: [] },
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("h3", {
          style: [
            "font-size:1.17em",
            "font-weight:600",
            "line-height:1.4",
            "margin:0.5em 0",
            "color:inherit",
          ].join(";"),
        }),
    });

    conversion.for("dataDowncast").elementToElement({
      model: { name: "heading3", attributes: [] },
      converterPriority: "high",
      view: (_modelElement, { writer }) =>
        writer.createContainerElement("h3", {
          style: [
            "font-size:1.17em",
            "font-weight:600",
            "line-height:1.4",
            "margin:0.83em 0",
          ].join(";"),
        }),
    });
  }
}