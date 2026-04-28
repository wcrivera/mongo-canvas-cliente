// src/helpers/desplegarPagina.ts
import { fetchConToken } from "./fetch";

/**
 * Despliega una página HTML en todos los cursos Canvas activos.
 * Reutilizable en Capitulos, Clases, Ayudantías y Ejercicios.
 *
 * @param canvasActivos  Array de cursos Canvas con canvas_id
 * @param generarBody    Función que recibe canvas_id y retorna el HTML
 * @param slug           Slug de la página en Canvas
 * @param titulo         Título de la página en Canvas
 */
export const desplegarPagina = async ({
  canvasActivos,
  generarBody,
  slug,
  titulo,
}: {
  canvasActivos: { canvas_id: number }[];
  generarBody:   (canvas_id: number) => string;
  slug:          string;
  titulo:        string;
}): Promise<void> => {
  await Promise.allSettled(
    canvasActivos.map(({ canvas_id }) =>
      fetchConToken(
        `api/capitulos/deploy-pagina/${canvas_id}`,
        { titulo, slug, body: generarBody(canvas_id) },
        "POST",
      ),
    ),
  );
};