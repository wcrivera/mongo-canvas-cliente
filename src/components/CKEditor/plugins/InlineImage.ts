// src/components/CKEditor/plugins/InlineImage.ts
import { Plugin } from "ckeditor5";
import type { ViewDowncastWriter, ModelWriter, ViewElement } from "ckeditor5";

const IMG_STYLE    = "max-width:100%;height:auto;border-radius:4px;display:block;margin:8px auto;";
const FIGURE_STYLE = "margin:12px 0;text-align:center;";
const CAPTION_STYLE = "font-size:12px;color:#6b7280;margin-top:4px;font-style:italic;";

export class InlineImage extends Plugin {
  static get pluginName() { return "InlineImage"; }

  init() {
    const { model, conversion } = this.editor;

    model.schema.extend("imageBlock",  { allowAttributes: ["src", "alt", "width"] });
    model.schema.extend("imageInline", { allowAttributes: ["src", "alt", "width"] });

    // Bloque — genera <figure><img style="..."></figure>
    conversion.for("dataDowncast").elementToElement({
      model: "imageBlock",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const src    = String(modelElement.getAttribute("src") ?? "");
        const alt    = String(modelElement.getAttribute("alt") ?? "");
        const width  = modelElement.getAttribute("width");
        const imgSty = IMG_STYLE + (width ? `width:${width};` : "");
        const img    = writer.createEmptyElement("img", { src, alt, style: imgSty });
        const figure = writer.createContainerElement("figure", { style: FIGURE_STYLE });
        writer.insert(writer.createPositionAt(figure, 0), img);
        return figure;
      },
    });

    // Inline — genera <img style="...">
    conversion.for("dataDowncast").elementToElement({
      model: "imageInline",
      view:  (modelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const src   = String(modelElement.getAttribute("src") ?? "");
        const alt   = String(modelElement.getAttribute("alt") ?? "");
        const width = modelElement.getAttribute("width");
        return writer.createEmptyElement("img", {
          src, alt,
          style: `max-width:${width ?? "100%"};height:auto;vertical-align:middle;border-radius:3px;`,
        });
      },
    });

    // Caption
    conversion.for("dataDowncast").elementToElement({
      model: "caption",
      view:  (_el, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement("figcaption", { style: CAPTION_STYLE }),
    });

    // Upcast
    conversion.for("upcast").elementToElement({
      view:  "figure",
      model: (viewElement: ViewElement, { writer }: { writer: ModelWriter }) => {
        const img = [...viewElement.getChildren()].find(
          (c) => (c as ViewElement).name === "img",
        ) as ViewElement | undefined;
        return writer.createElement("imageBlock", {
          src: img?.getAttribute("src") ?? "",
          alt: img?.getAttribute("alt") ?? "",
        });
      },
    });

    conversion.for("upcast").elementToElement({ view: "figcaption", model: "caption" });
  }
}