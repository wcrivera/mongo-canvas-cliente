import { Plugin } from "ckeditor5";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ImageUploadPluginConfig {
  /** Sigla del curso — define la carpeta en el servidor: /img/{sigla}/ */
  siglaCurso: string;
  /** URL base del backend, ej: "http://localhost:4000" */
  backendUrl: string;
  /** Token JWT para autenticación */
  token: string;
}

// ── Upload Adapter ────────────────────────────────────────────────────────────

class ManthanoUploadAdapter {
  private loader: { file: Promise<File | null> };
  private config: ImageUploadPluginConfig;

  constructor(
    loader: { file: Promise<File | null> },
    config: ImageUploadPluginConfig
  ) {
    this.loader = loader;
    this.config = config;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    if (!file) throw new Error("No se pudo obtener el archivo");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sigla_curso", this.config.siglaCurso);

    const response = await fetch(
      `${this.config.backendUrl}/api/admin/upload/imagen`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { msg?: string }).msg || "Error al subir la imagen");
    }

    const body = await response.json() as { ok: boolean; url?: string; msg?: string };
    if (!body.ok || !body.url) {
      throw new Error(body.msg || "El servidor no retornó una URL válida");
    }

    return { default: body.url };
  }

  abort(): void {
    // fetch no tiene cancelación sin AbortController — seguro no hacer nada
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export class ImageUploadPlugin extends Plugin {
  static get pluginName(): string {
    return "ImageUploadPlugin";
  }

  init(): void {
    const { editor } = this;

    const config = editor.config.get("imageUpload") as
      | ImageUploadPluginConfig
      | undefined;

    if (!config?.siglaCurso || !config?.backendUrl || !config?.token) {
      console.warn(
        "ImageUploadPlugin: falta configuración (siglaCurso, backendUrl, token)"
      );
      return;
    }

    // La forma correcta de registrar un UploadAdapter en CKEditor 5
    // es asignar createUploadAdapter en el FileRepository
    const fileRepository = editor.plugins.get("FileRepository") as unknown as {
      createUploadAdapter: ((loader: unknown) => ManthanoUploadAdapter) | null;
    };

    fileRepository.createUploadAdapter = (loader: unknown) =>
      new ManthanoUploadAdapter(
        loader as { file: Promise<File | null> },
        config
      );
  }
}