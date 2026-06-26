/**
 * MathBlockPlugin.ts
 * Patrón SimpleBox + 8 tipos de entorno + dropdown de selección.
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

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TipoEntorno =
  | "definicion"
  | "teorema"
  | "proposicion"
  | "corolario"
  | "lema"
  | "ejemplo"
  | "demostracion"
  | "observacion";

export const ENTORNO_LABELS: Record<TipoEntorno, string> = {
  definicion: "Definición",
  teorema: "Teorema",
  proposicion: "Proposición",
  corolario: "Corolario",
  lema: "Lema",
  ejemplo: "Ejemplo",
  demostracion: "Demostración",
  observacion: "Observación",
};

export const ENTORNO_COLORS: Record<
  TipoEntorno,
  { border: string; bg: string; label: string }
> = {
  definicion: {
    border: "#2563b4",
    bg: "transparent",
    label: "#1d4ed8",
  },
  teorema: { border: "#15803d", bg: "transparent", label: "#166534" },
  proposicion: {
    border: "#7c3aed",
    bg: "transparent",
    label: "#6d28d9",
  },
  corolario: {
    border: "#0284c7",
    bg: "transparent",
    label: "#0369a1",
  },
  lema: { border: "#0d9488", bg: "transparent", label: "#0f766e" },
  // ejemplo: { border: "none", bg: "none", label: "none" },
  ejemplo: { border: "#ea580c", bg: "transparent", label: "#c2410c" },
  demostracion: {
    border: "#94a3b8",
    bg: "transparent",
    label: "#475569",
  },
  observacion: {
    border: "#ca8a04",
    bg: "transparent",
    label: "#92400e",
  },
};

const TIPOS_ORDEN: TipoEntorno[] = [
  "definicion",
  "teorema",
  "proposicion",
  "corolario",
  "lema",
  "ejemplo",
  "demostracion",
  "observacion",
];

export interface MathBlockPluginConfig {
  onEditSubtitulo: (
    tipo: TipoEntorno,
    subtituloActual: string,
    onSave: (nuevoSubtitulo: string) => void,
  ) => void;
}

// ── SVG ícono ─────────────────────────────────────────────────────────────────

const iconMathBlock = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <rect x="2" y="3" width="3" height="14" rx="1.5" fill="currentColor"/>
  <rect x="6" y="5" width="12" height="2" rx="1" fill="currentColor" opacity="0.8"/>
  <rect x="6" y="9" width="10" height="2" rx="1" fill="currentColor" opacity="0.5"/>
  <rect x="6" y="13" width="8" height="2" rx="1" fill="currentColor" opacity="0.5"/>
</svg>`;

// ── Comando ───────────────────────────────────────────────────────────────────

class InsertMathEnvironmentCommand extends Command {
  override execute({ tipo }: { tipo: TipoEntorno }): void {
    this.editor.model.change((writer) => {
      this.editor.model.insertObject(createMathEnvironment(writer, tipo));
    });
  }

  override refresh(): void {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition()!,
      "mathEnvironment",
    );
    this.isEnabled = allowedIn !== null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMathEnvironment(writer: any, tipo: TipoEntorno): any {
  const env = writer.createElement("mathEnvironment", { tipo });
  const title = writer.createElement("mathEnvironmentTitle");
  const body = writer.createElement("mathEnvironmentBody");

  writer.append(title, env);
  writer.append(body, env);
  writer.appendElement("paragraph", body);

  return env;
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class MathBlockPlugin extends Plugin {
  static get requires() {
    return [Widget] as const;
  }

  static get pluginName() {
    return "MathBlockPlugin" as const;
  }

  init(): void {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(
      "insertMathEnvironment",
      new InsertMathEnvironmentCommand(this.editor),
    );

    this._defineToolbar();
  }

  // ── Schema ────────────────────────────────────────────────────────────────

  private _defineSchema(): void {
    const { schema } = this.editor.model;

    schema.register("mathEnvironment", {
      inheritAllFrom: "$blockObject",
      allowAttributes: ["tipo"],
    });

    schema.register("mathEnvironmentTitle", {
      isLimit: true,
      allowIn: "mathEnvironment",
      allowContentOf: "$block",
    });

    schema.register("mathEnvironmentBody", {
      isLimit: true,
      allowIn: "mathEnvironment",
      allowContentOf: "$root",
    });

    schema.addChildCheck((context, childDefinition) => {
      if (
        context.endsWith("mathEnvironmentBody") &&
        childDefinition.name === "mathEnvironment"
      ) {
        return false;
      }
    });
  }

  // ── Converters ────────────────────────────────────────────────────────────

  // ── Converters ────────────────────────────────────────────────────────────

  private _defineConverters(): void {
    const { conversion } = this.editor;

    // ── mathEnvironment ──────────────────────────────────────────────────────

    // Upcast LEGADO: contenido viejo guardado como <section> sigue cargando.
    conversion.for("upcast").elementToElement({
      model: (viewEl, { writer }) => {
        const tipo = (viewEl.getAttribute("data-tipo") ??
          "definicion") as TipoEntorno;
        return writer.createElement("mathEnvironment", { tipo });
      },
      view: { name: "section", classes: "math-environment" },
    });

    // Upcast NUEVO: contenido nuevo guardado como <div>.
    conversion.for("upcast").elementToElement({
      model: (viewEl, { writer }) => {
        const tipo = (viewEl.getAttribute("data-tipo") ??
          "definicion") as TipoEntorno;
        return writer.createElement("mathEnvironment", { tipo });
      },
      view: { name: "div", classes: "math-environment" },
    });

    // dataDowncast: <div> con estilo INLINE por tipo → se ve en Canvas.
    // Colores arbitrarios de dominio (rgba/hex fuera de la paleta Tailwind)
    // → van inline directo, no como clase. "none" (ejemplo) = caja sin borde/fondo.
    conversion.for("dataDowncast").elementToElement({
      model: "mathEnvironment",
      view: (modelEl, { writer }) => {
        const tipo = (modelEl.getAttribute("tipo") ??
          "definicion") as TipoEntorno;
        const colors = ENTORNO_COLORS[tipo];

        const styleParts: string[] = [
          "border-radius:6px",
          "padding-top: 0em",
          "padding-left: 1em",
          "margin-bottom: 2em",
        ];
        if (colors.border !== "none") {
          styleParts.unshift(`border-left:4px solid ${colors.border}`);
        }
        // if (colors.bg !== "none") {
        //   styleParts.push(`background:${colors.bg}`);
        // }

        return writer.createContainerElement("div", {
          class: "math-environment",
          "data-tipo": tipo,
          style: styleParts.join(";"),
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "mathEnvironment",
      view: (modelEl, { writer }) => {
        const tipo = (modelEl.getAttribute("tipo") ??
          "definicion") as TipoEntorno;
        const colors = ENTORNO_COLORS[tipo];

        const section = writer.createContainerElement("div", {
          class: "math-environment",
          "data-tipo": tipo,
          style: [
            `border-left: 4px solid ${colors.border}`,
            // `background: ${colors.bg}`,
            "border-radius: 6px",
            "padding-left: 1em",
            "margin-bottom: 2em",
          ].join(";"),
        });

        return toWidget(section, writer, { label: ENTORNO_LABELS[tipo] });
      },
    });

    // ── mathEnvironmentTitle ─────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      model: "mathEnvironmentTitle",
      view: { name: "h2", classes: "math-environment-title" },
    });

    // dataDowncast: <h2> con color INLINE por tipo → título visible en Canvas.
    // Se omite font-family 'Zapf-Chancery' (no existe en Canvas; caería a fallback).
    conversion.for("dataDowncast").elementToElement({
      model: "mathEnvironmentTitle",
      view: (modelEl, { writer }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tipo = ((modelEl as any).parent?.getAttribute("tipo") ??
          "definicion") as TipoEntorno;
        const colors = ENTORNO_COLORS[tipo];

        const styleParts: string[] = [
          "font-family:'Cormorant SC',serif",
          "font-weight:700",
          "font-size:1.3em",
          "letter-spacing:0.04em",
          "margin: 0",
        ];
        if (colors.label !== "none") {
          styleParts.unshift(`color:${colors.label}`);
        }

        return writer.createContainerElement("h2", {
          class: "math-environment-title",
          style: styleParts.join(";"),
        });
      },
    });

    // El editing downcast del título lee el tipo del padre para colorear
    conversion.for("editingDowncast").elementToElement({
      model: "mathEnvironmentTitle",
      view: (modelEl, { writer }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tipo = ((modelEl as any).parent?.getAttribute("tipo") ??
          "definicion") as TipoEntorno;
        const colors = ENTORNO_COLORS[tipo];

        const h2 = writer.createEditableElement("h2", {
          class: "math-environment-title",
          style: [
            `color: ${colors.label}`,
            "font-family: 'Cormorant SC', serif",
            "font-weight: 700",
            "font-size: 1.3em",
            "letter-spacing: 0.04em",
            "margin: 0",
            // "margin: 0 0 0.3em 0",
          ].join("; "),
        });
        return toWidgetEditable(h2, writer);
      },
    });

    // ── mathEnvironmentBody ──────────────────────────────────────────────────

    conversion.for("upcast").elementToElement({
      model: "mathEnvironmentBody",
      view: { name: "div", classes: "math-environment-body" },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "mathEnvironmentBody",
      view: { name: "div", classes: "math-environment-body" },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "mathEnvironmentBody",
      view: (_, { writer }) => {
        const div = writer.createEditableElement("div", {
          class: "math-environment-body",
          style: "min-height: 1.8em;",
        });
        return toWidgetEditable(div, writer);
      },
    });
  }

  // ── Toolbar: dropdown con los 8 tipos ─────────────────────────────────────

  private _defineToolbar(): void {
    const { editor } = this;

    editor.ui.componentFactory.add("insertMathEnvironment", (locale) => {
      const dropdown = createDropdown(locale);
      const command = editor.commands.get("insertMathEnvironment")!;

      dropdown.buttonView.set({
        icon: iconMathBlock,
        label: "Entorno",
        tooltip: "Insertar entorno matemático",
      });

      dropdown.bind("isEnabled").to(command, "isEnabled");

      const items = new Collection<ListDropdownItemDefinition>();

      for (const tipo of TIPOS_ORDEN) {
        items.add({
          type: "button" as const,
          model: new UIModel({
            withText: true,
            label: ENTORNO_LABELS[tipo],
            commandParam: tipo,
          }),
        });
      }

      addListToDropdown(dropdown, items);

      dropdown.on("execute", (evt) => {
        const tipo = (evt.source as { commandParam?: TipoEntorno })
          .commandParam;
        if (!tipo) return;
        editor.execute("insertMathEnvironment", { tipo });
        editor.editing.view.focus();
      });

      return dropdown;
    });
  }
}
