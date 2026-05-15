/**
 * FragmentPlugin.ts
 *
 * Plugin CKEditor 5 para fragmentos de Reveal.js.
 *
 * Genera HTML correcto según docs oficiales:
 *   <div class="fragment fade-up">
 *     <p>Línea 1</p>
 *     <p>Línea 2</p>
 *   </div>
 *
 * El div.fragment es el contenedor editable — múltiples párrafos adentro
 * no se convierten en fragmentos separados.
 *
 * Patrón: idéntico a TwoColumnsPlugin (widget con body editable).
 */

import {
  Plugin,
  Command,
  Widget,
  toWidget,
  toWidgetEditable,
  createDropdown,
  addListToDropdown,
  Collection,
  UIModel,
  type ListDropdownItemDefinition,
} from "ckeditor5";

// ── Efectos disponibles ───────────────────────────────────────────────────────

export type FragmentEffect =
  | "fade-in"
  | "fade-out"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in-then-out"
  | "fade-in-then-semi-out"
  | "grow"
  | "shrink"
  | "highlight-red"
  | "highlight-green"
  | "highlight-blue"
  | "highlight-current-red"
  | "highlight-current-green"
  | "highlight-current-blue";

export const FRAGMENT_EFFECT_LABELS: Record<FragmentEffect, string> = {
  "fade-in":                 "Fade in (aparecer)",
  "fade-out":                "Fade out (desaparecer)",
  "fade-up":                 "Fade up (subir)",
  "fade-down":               "Fade down (bajar)",
  "fade-left":               "Fade left (izquierda)",
  "fade-right":              "Fade right (derecha)",
  "fade-in-then-out":        "Aparecer y desaparecer",
  "fade-in-then-semi-out":   "Aparecer y semi-ocultar",
  "grow":                    "Grow (crecer)",
  "shrink":                  "Shrink (encoger)",
  "highlight-red":           "Resaltar rojo",
  "highlight-green":         "Resaltar verde",
  "highlight-blue":          "Resaltar azul",
  "highlight-current-red":   "Resaltar actual rojo",
  "highlight-current-green": "Resaltar actual verde",
  "highlight-current-blue":  "Resaltar actual azul",
};

const EFFECTS_ORDEN = Object.keys(FRAGMENT_EFFECT_LABELS) as FragmentEffect[];

// ── Ícono ─────────────────────────────────────────────────────────────────────

const iconFragment = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <rect x="2" y="3" width="16" height="14" rx="2"
    fill="none" stroke="currentColor" stroke-width="1.5"
    stroke-dasharray="3 2"/>
  <text x="10" y="13.5" font-family="sans-serif" font-size="6" font-weight="bold"
    fill="currentColor" text-anchor="middle">frag</text>
</svg>`;

// ── Comando ───────────────────────────────────────────────────────────────────

class InsertFragmentCommand extends Command {
  override execute({ effect }: { effect: FragmentEffect }): void {
    this.editor.model.change((writer) => {
      const fragment  = writer.createElement("revealFragment", { effect });
      const body      = writer.createElement("revealFragmentBody");
      const paragraph = writer.createElement("paragraph");
      writer.append(paragraph, body);
      writer.append(body, fragment);
      this.editor.model.insertObject(fragment);
      writer.setSelection(paragraph, 0);
    });
  }

  override refresh(): void {
    this.isEnabled = true;
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class FragmentPlugin extends Plugin {
  static get requires() {
    return [Widget] as const;
  }

  static get pluginName() {
    return "FragmentPlugin" as const;
  }

  init(): void {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add("insertFragment", new InsertFragmentCommand(this.editor));
    this._defineToolbar();
  }

  private _defineSchema(): void {
    const { schema } = this.editor.model;

    schema.register("revealFragment", {
      inheritAllFrom: "$blockObject",
      allowAttributes: ["effect"],
    });

    schema.register("revealFragmentBody", {
      isLimit:        true,
      allowIn:        "revealFragment",
      allowContentOf: "$root",
    });
  }

  private _defineConverters(): void {
    const { conversion } = this.editor;

    // ── revealFragment ────────────────────────────────────────────────────────

    // Upcast: <div class="fragment fade-up"> → modelo
    conversion.for("upcast").elementToElement({
      view: (viewEl) => {
        if (viewEl.name !== "div") return null;
        const cls = viewEl.getAttribute("class") ?? "";
        return cls.includes("fragment") ? { name: "div" } : null;
      },
      model: (viewEl, { writer }) => {
        const cls    = viewEl.getAttribute("class") ?? "";
        const effect = cls
          .split(" ")
          .filter((c: string) => c !== "fragment" && c.trim())
          .join(" ") || "fade-in";
        return writer.createElement("revealFragment", { effect });
      },
      converterPriority: "high",
    });

    // Downcast data: modelo → <div class="fragment fade-up">
    conversion.for("dataDowncast").elementToElement({
      model: "revealFragment",
      view:  (modelEl, { writer }) => {
        const effect = modelEl.getAttribute("effect") as string ?? "fade-in";
        const cls    = effect === "fade-in" ? "fragment" : `fragment ${effect}`;
        return writer.createContainerElement("div", { class: cls });
      },
    });

    // Downcast editing: widget con borde azul punteado
    conversion.for("editingDowncast").elementToElement({
      model: "revealFragment",
      view:  (modelEl, { writer }) => {
        const effect = modelEl.getAttribute("effect") as string ?? "fade-in";
        const label  = FRAGMENT_EFFECT_LABELS[effect as FragmentEffect] ?? effect;
        const div    = writer.createContainerElement("div", {
          class: "ck-reveal-fragment",
          style: [
            "border: 2px dashed #3b82f6",
            "border-radius: 6px",
            "padding: 20px 8px 6px 8px",
            "margin: 6px 0",
            "position: relative",
          ].join("; "),
          "data-fragment-label": label,
        });
        return toWidget(div, writer, {
          label:              `Fragmento: ${label}`,
          hasSelectionHandle: true,
        });
      },
    });

    // ── revealFragmentBody ────────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      model: "revealFragmentBody",
      view:  { name: "div", classes: "ck-fragment-body" },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "revealFragmentBody",
      // El body es transparente en el HTML final —
      // su contenido queda directamente dentro del div.fragment
      view:  (_, { writer }) =>
        writer.createContainerElement("div", { style: "display:contents" }),
    });

    conversion.for("editingDowncast").elementToElement({
      model: "revealFragmentBody",
      view:  (_, { writer }) => {
        const div = writer.createEditableElement("div", {
          style: "min-height: 1.5em;",
        });
        return toWidgetEditable(div, writer);
      },
    });
  }

  private _defineToolbar(): void {
    const { editor } = this;

    editor.ui.componentFactory.add("insertFragment", (locale) => {
      const dropdown = createDropdown(locale);
      const command  = editor.commands.get("insertFragment")!;

      dropdown.buttonView.set({
        icon:     iconFragment,
        label:    "Fragmento Reveal",
        tooltip:  "Insertar bloque de fragmento Reveal.js",
        withText: false,
      });

      dropdown.buttonView.once("render", () => {
        const iconEl = dropdown.buttonView.element?.querySelector<HTMLElement>(".ck-icon");
        if (iconEl) {
          iconEl.style.width  = "20px";
          iconEl.style.height = "20px";
        }
      });

      dropdown.bind("isEnabled").to(command, "isEnabled");

      const items = new Collection<ListDropdownItemDefinition>();
      for (const effect of EFFECTS_ORDEN) {
        items.add({
          type: "button" as const,
          model: new UIModel({
            withText:     true,
            label:        FRAGMENT_EFFECT_LABELS[effect],
            commandParam: effect,
          }),
        });
      }

      addListToDropdown(dropdown, items);

      dropdown.on("execute", (evt) => {
        const effect = (evt.source as { commandParam?: FragmentEffect }).commandParam;
        if (!effect) return;
        editor.execute("insertFragment", { effect });
        editor.editing.view.focus();
      });

      return dropdown;
    });
  }
}