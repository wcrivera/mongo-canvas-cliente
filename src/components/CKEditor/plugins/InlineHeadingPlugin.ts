import { Plugin } from "ckeditor5";

/**
 * InlineHeadingPlugin (Tailwind)
 *
 * Emite clases Tailwind en editingDowncast (para que el heading se vea
 * distinto al párrafo DENTRO del editor, ya que el preflight de Tailwind
 * resetea h1–h4) y en dataDowncast (HTML guardado limpio con clases).
 *
 * Requiere que las clases estén safelisteadas (@source inline).
 */
export class InlineHeadingPlugin extends Plugin {
  static get pluginName(): string {
    return "InlineHeadingPlugin";
  }

  init(): void {
    const { conversion } = this.editor;

    for (const { model, tag, cls } of HEADINGS) {
      for (const channel of ["editingDowncast", "dataDowncast"] as const) {
        conversion.for(channel).elementToElement({
          model: { name: model, attributes: [] },
          converterPriority: "high",
          view: (_m, { writer }) =>
            writer.createContainerElement(tag, { class: cls }),
        });
      }
    }
  }
}

const HEADINGS = [
  { model: "heading1", tag: "h1", cls: "text-3xl font-bold leading-tight my-3" },
  { model: "heading2", tag: "h2", cls: "text-2xl font-bold leading-snug my-2" },
  { model: "heading3", tag: "h3", cls: "text-xl font-semibold leading-normal my-2" },
  { model: "heading4", tag: "h4", cls: "text-lg font-semibold leading-normal my-2" },
] as const;