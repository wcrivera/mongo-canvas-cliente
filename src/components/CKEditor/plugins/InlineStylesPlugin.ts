import { Plugin } from "ckeditor5";

/**
 * InlineStylesPlugin (Tailwind)
 *
 * dataDowncast de fontSize / fontColor / fontBackgroundColor / imágenes
 * emitiendo CLASES Tailwind en vez de estilos inline.
 *
 * - bold/italic/underline/strikethrough: SE ELIMINARON los overrides.
 *   CKEditor emite <strong>/<i>/<u>/<s> y `prose` los estiliza.
 * - El ancho dinámico de imagen sí va inline (valor arbitrario, juice lo
 *   pasa tal cual al desplegar a Canvas).
 *
 * NOTA: nombre conservado para no romper imports. Renombrar a
 * TailwindStylesPlugin como follow-up.
 */
export class InlineStylesPlugin extends Plugin {
  static get pluginName(): string {
    return "InlineStylesPlugin";
  }

  init(): void {
    const { conversion } = this.editor;

    // ── fontSize → clase Tailwind (fallback inline para valores numéricos) ──
    conversion.for("dataDowncast").attributeToElement({
      model: "fontSize",
      converterPriority: "high",
      view: (value, { writer }) => {
        const cls = FONT_SIZE_CLASS[value as string];
        return cls
          ? writer.createAttributeElement("span", { class: cls })
          : writer.createAttributeElement("span", {
              style: `font-size:${value}`,
            });
      },
    });

    // ── fontColor → clase Tailwind (fallback inline si no está en paleta) ──
    conversion.for("dataDowncast").attributeToElement({
      model: "fontColor",
      converterPriority: "high",
      view: (value, { writer }) => {
        const cls = colorClass(value as string, TEXT_COLOR_CLASS);
        return cls
          ? writer.createAttributeElement("span", { class: cls })
          : writer.createAttributeElement("span", { style: `color:${value}` });
      },
    });

    // ── fontBackgroundColor → clase Tailwind (fallback inline) ──────────────
    conversion.for("dataDowncast").attributeToElement({
      model: "fontBackgroundColor",
      converterPriority: "high",
      view: (value, { writer }) => {
        const cls = colorClass(value as string, BG_COLOR_CLASS);
        return cls
          ? writer.createAttributeElement("span", { class: cls })
          : writer.createAttributeElement("span", {
              style: `background-color:${value}`,
            });
      },
    });

    // ── upcast: figure con width inline → imageBlock con tamaño (igual) ─────
    conversion.for("upcast").elementToElement({
      view: { name: "figure", styles: { width: true } },
      model: (viewElement, { writer }) => {
        let src = "";
        let alt = "";
        for (const child of viewElement.getChildren()) {
          const el = child as {
            name?: string;
            getAttribute?: (k: string) => string | null;
          };
          if (el.name === "img") {
            src = el.getAttribute?.("src") ?? "";
            alt = el.getAttribute?.("alt") ?? "";
            break;
          }
        }
        const width = viewElement.getStyle("width") ?? undefined;
        const isPx = width?.endsWith("px");
        return writer.createElement("imageBlock", {
          src,
          alt,
          ...(width ? (isPx ? { width } : { resizedWidth: width }) : {}),
        });
      },
      converterPriority: "high",
    });

    // ── imageBlock → <figure class="..."><img class="..."> ──────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "imageBlock",
      converterPriority: "high",
      view: (modelElement, { writer }) => {
        const src = String(modelElement.getAttribute("src") ?? "");
        const alt = String(modelElement.getAttribute("alt") ?? "");
        const width = (modelElement.getAttribute("resizedWidth") ??
          modelElement.getAttribute("width")) as string | undefined;

        const figure = writer.createContainerElement("figure", {
          class: "block mx-auto text-center my-4 max-w-full",
          // ancho dinámico = inline (valor arbitrario)
          ...(width ? { style: `width:${width}` } : {}),
        });

        const img = writer.createEmptyElement("img", {
          src,
          alt,
          class: "block mx-auto max-w-full h-auto",
        });

        writer.insert(writer.createPositionAt(figure, 0), img);
        return figure;
      },
    });

    // ── imageInline → <img class="..."> ─────────────────────────────────────
    conversion.for("dataDowncast").elementToElement({
      model: "imageInline",
      converterPriority: "high",
      view: (modelElement, { writer }) => {
        const src = String(modelElement.getAttribute("src") ?? "");
        const alt = String(modelElement.getAttribute("alt") ?? "");
        return writer.createEmptyElement("img", {
          src,
          alt,
          class: "inline align-middle max-w-full h-auto",
        });
      },
    });
  }
}

// fontSize nombrado → clase Tailwind
const FONT_SIZE_CLASS: Record<string, string> = {
  tiny: "text-xs",
  small: "text-sm",
  big: "text-xl",
  huge: "text-2xl",
};

// paleta hex → clase Tailwind (calza con paleta Canvas)
const TEXT_COLOR_CLASS: Record<string, string> = {
  "#0d9488": "text-teal-600",
  "#0f172a": "text-slate-900",
  "#64748b": "text-slate-500",
  "#16a34a": "text-green-600",
  "#dc2626": "text-red-600",
};

const BG_COLOR_CLASS: Record<string, string> = {
  "#fef9c3": "bg-yellow-100",
  "#dcfce7": "bg-green-100",
  "#fee2e2": "bg-red-100",
  "#f1f5f9": "bg-slate-100",
};

// Normaliza el valor de color y busca su clase. Acepta #hex, rgb(...) no.
function colorClass(
  value: string,
  map: Record<string, string>,
): string | undefined {
  if (!value) return undefined;
  const hex = value.trim().toLowerCase();
  return map[hex];
}