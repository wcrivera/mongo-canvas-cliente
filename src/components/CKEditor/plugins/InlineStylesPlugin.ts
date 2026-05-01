import { Plugin } from "ckeditor5";

/**
 * InlineStylesPlugin
 *
 * Sobreescribe los conversores `dataDowncast` de los atributos de formato
 * para que el HTML emitido por editor.getData() use estilos inline en lugar
 * de clases CSS propias de CKEditor.
 *
 * Esto es necesario para que el contenido funcione en Canvas (LMS), que
 * aplica su propio CSS y no conoce las clases de CKEditor.
 *
 * Atributos cubiertos:
 *  - bold        → <strong style="font-weight:bold">
 *  - italic      → <em style="font-style:italic">
 *  - underline   → <u style="text-decoration:underline">
 *  - strikethrough → <s style="text-decoration:line-through">
 *  - fontSize    → <span style="font-size:{valor}">
 *  - fontColor   → <span style="color:{valor}">
 *  - fontBackgroundColor → <span style="background-color:{valor}">
 *  - imageBlock  → <figure style="...centrado..."><img style="...">
 *  - imageInline → <img style="vertical-align:middle;...">
 *
 * NO toca el editingDowncast, por lo que la experiencia visual en el editor
 * no cambia.
 */
export class InlineStylesPlugin extends Plugin {
  static get pluginName(): string {
    return "InlineStylesPlugin";
  }

  init(): void {
    const { conversion } = this.editor;

    // ── bold ──────────────────────────────────────────────────────────────────
    conversion.for("dataDowncast").attributeToElement({
      model: "bold",
      converterPriority: "high",
      view: (_value, { writer }) =>
        writer.createAttributeElement("strong", {
          style: "font-weight:bold",
        }),
    });

    // ── italic ────────────────────────────────────────────────────────────────
    conversion.for("dataDowncast").attributeToElement({
      model: "italic",
      converterPriority: "high",
      view: (_value, { writer }) =>
        writer.createAttributeElement("em", {
          style: "font-style:italic",
        }),
    });

    // ── underline ─────────────────────────────────────────────────────────────
    conversion.for("dataDowncast").attributeToElement({
      model: "underline",
      converterPriority: "high",
      view: (_value, { writer }) =>
        writer.createAttributeElement("u", {
          style: "text-decoration:underline",
        }),
    });

    // ── strikethrough ─────────────────────────────────────────────────────────
    conversion.for("dataDowncast").attributeToElement({
      model: "strikethrough",
      converterPriority: "high",
      view: (_value, { writer }) =>
        writer.createAttributeElement("s", {
          style: "text-decoration:line-through",
        }),
    });

    // ── fontSize ──────────────────────────────────────────────────────────────
    // CKEditor emite clases "text-tiny", "text-small", "text-big", "text-huge"
    // cuando fontSize usa nombres predefinidos.
    // Si se usan valores numéricos (ej: "12px", "1.2em"), los pasa directo.
    conversion.for("dataDowncast").attributeToElement({
      model: "fontSize",
      converterPriority: "high",
      view: (value, { writer }) => {
        const sizeValue = FONT_SIZE_MAP[value as string] ?? value;
        return writer.createAttributeElement("span", {
          style: `font-size:${sizeValue}`,
        });
      },
    });

    // ── fontColor ─────────────────────────────────────────────────────────────
    // CKEditor ya emite color inline, pero lo normalizamos por consistencia.
    conversion.for("dataDowncast").attributeToElement({
      model: "fontColor",
      converterPriority: "high",
      view: (value, { writer }) =>
        writer.createAttributeElement("span", {
          style: `color:${value}`,
        }),
    });

    // ── fontBackgroundColor ───────────────────────────────────────────────────
    conversion.for("dataDowncast").attributeToElement({
      model: "fontBackgroundColor",
      converterPriority: "high",
      view: (value, { writer }) =>
        writer.createAttributeElement("span", {
          style: `background-color:${value}`,
        }),
    });


    // ── upcast: figura con width inline → imageBlock con resizedWidth ──────────
    // Restaura el tamaño al cargar HTML guardado.
    conversion.for("upcast").elementToElement({
      view: {
        name:   "figure",
        styles: { width: true },
      },
      model: (viewElement, { writer }) => {
        // Leer src y alt del <img> hijo
        let src = "";
        let alt = "";
        for (const child of viewElement.getChildren()) {
          const el = child as { name?: string; getAttribute?: (k: string) => string | null };
          if (el.name === "img") {
            src = el.getAttribute?.("src") ?? "";
            alt = el.getAttribute?.("alt") ?? "";
            break;
          }
        }
        const width = viewElement.getStyle("width") ?? undefined;
        // Determinar si es px o % para usar el atributo correcto del modelo
        const isPx = width?.endsWith("px");
        return writer.createElement("imageBlock", {
          src,
          alt,
          ...(width
            ? isPx
              ? { width }
              : { resizedWidth: width }
            : {}),
        });
      },
      converterPriority: "high",
    });

    // ── imageBlock → <figure style="...centrado..."><img style="..."> ──────────
    // CKEditor emite <figure class="image"> por defecto.
    // Aquí lo sobreescribimos para que el HTML guardado tenga estilos inline
    // y la imagen se vea centrada en Canvas y cualquier LMS.
    conversion.for("dataDowncast").elementToElement({
      model: "imageBlock",
      converterPriority: "high",
      view: (modelElement, { writer }) => {
        const src   = String(modelElement.getAttribute("src")  ?? "");
        const alt   = String(modelElement.getAttribute("alt")  ?? "");
        // CKEditor usa "resizedWidth" con % y "width" con px
        const width = (
          modelElement.getAttribute("resizedWidth") ??
          modelElement.getAttribute("width")
        ) as string | undefined;

        const figureStyle = [
          "display:block",
          "margin:1em auto",
          "text-align:center",
          "max-width:100%",
          ...(width ? [`width:${width}`] : []),
        ].join(";");

        const imgStyle = [
          "max-width:100%",
          "height:auto",
          "display:block",
          "margin:0 auto",
        ].join(";");

        const figure = writer.createContainerElement("figure", {
          style: figureStyle,
        });

        const img = writer.createEmptyElement("img", {
          src,
          alt,
          style: imgStyle,
        });

        writer.insert(writer.createPositionAt(figure, 0), img);
        return figure;
      },
    });

    // ── imageInline → <img style="..."> (sin figure, va dentro del texto) ─────
    conversion.for("dataDowncast").elementToElement({
      model: "imageInline",
      converterPriority: "high",
      view: (modelElement, { writer }) => {
        const src = String(modelElement.getAttribute("src") ?? "");
        const alt = String(modelElement.getAttribute("alt") ?? "");
        return writer.createEmptyElement("img", {
          src,
          alt,
          style: [
            "max-width:100%",
            "height:auto",
            "vertical-align:middle",
          ].join(";"),
        });
      },
    });
  }
}

// Mapa de nombres predefinidos de fontSize → valor CSS
// Coincide con las clases que define CKEditor en su CSS:
//   .text-tiny   → 0.7em
//   .text-small  → 0.85em
//   .text-big    → 1.4em
//   .text-huge   → 1.8em
const FONT_SIZE_MAP: Record<string, string> = {
  tiny: "0.7em",
  small: "0.85em",
  big: "1.4em",
  huge: "1.8em",
};