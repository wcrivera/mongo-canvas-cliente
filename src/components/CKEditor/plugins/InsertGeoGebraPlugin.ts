import { Plugin, Command, ButtonView } from "ckeditor5";
import { iconGeoGebra } from "../icons/geogebra.icon";

export interface InsertGeoGebraPluginConfig {
  onInsert: () => void;
}

export interface GeoGebraParams {
  id: string;
  width: number;
  height: number;
  align?: "left" | "center" | "right"; // + alineación
}

// ── Construcción de la URL/iframe de GeoGebra ────────────────────────────────
// Mismo formato que el embed oficial; flags fijos con los valores que ya usas.

function buildGeoGebraUrl(id: string, width: number, height: number): string {
  return (
    `https://www.geogebra.org/material/iframe/id/${id}` +
    `/width/${width}/height/${height}` +
    `/border/888888/rc/false/ai/false/sdz/false/smb/false/stb/false` +
    `/stbh/false/ld/false/sri/false/ctl/false/sfsb/false/szb/false?ggbLang=en`
  );
}

function buildGeoGebraIframe(
  id: string,
  width: number,
  height: number,
  align: "left" | "center" | "right" = "center",
): string {
  const src = buildGeoGebraUrl(id, width, height);
  // inline-block + text-align del <p> alinea igual en editor (span wrapper)
  // y en preview (el iframe es inline-block, responde al text-align del padre).
  return (
    `<p style="text-align:${align};">` +
    `<iframe src="${src}" ` +
    `style="border:0;display:inline-block;width:${width}px;height:${height}px;" ` +
    `scrolling="no" width="${width}" height="${height}"></iframe>` +
    `</p>`
  );
}

// ── Comando ───────────────────────────────────────────────────────────────────

class InsertGeoGebraCommand extends Command {
  override execute({ id, width, height, align }: GeoGebraParams): void {
    const html = buildGeoGebraIframe(id, width, height, align);
    const viewFragment = this.editor.data.processor.toView(html);
    const modelFragment = this.editor.data.toModel(viewFragment);
    this.editor.model.insertContent(modelFragment);
  }
  override refresh(): void {
    this.isEnabled = true;
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class InsertGeoGebraPlugin extends Plugin {
  static get pluginName(): string {
    return "InsertGeoGebraPlugin";
  }

  init(): void {
    const { editor } = this;

    editor.commands.add("insertGeoGebra", new InsertGeoGebraCommand(editor));

    editor.ui.componentFactory.add("insertGeoGebra", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        icon: iconGeoGebra,
        tooltip: "Insertar GeoGebra",
        label: "Insertar GeoGebra",
      });

      button.on("execute", () => {
        const config = editor.config.get("insertGeoGebra") as
          | InsertGeoGebraPluginConfig
          | undefined;
        config?.onInsert();
      });

      return button;
    });
  }
}
