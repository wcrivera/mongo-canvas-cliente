import type { ICapitulo }   from "../../../store/slices/capitulo";
import type { IMongoCurso } from "../../../store/slices/mongoCurso";
import type { IClase }      from "../../../store/slices/clase";
import type { ITema }       from "../../../store/slices/tema";

interface GenerarHtmlCapitulosParams {
  curso:           IMongoCurso;
  capitulos:       ICapitulo[];
  clases:          IClase[];
  temas:           ITema[];
  canvas_curso_id: number;
}

export const generarHtmlCapitulos = ({
  curso,
  capitulos,
  clases,
  temas,
  canvas_curso_id,
}: GenerarHtmlCapitulosParams): string => {

  const capitulosOrdenados = [...capitulos].sort(
    (a, b) => a.position - b.position
  );

  const itemsHtml = capitulosOrdenados.map((cap) => {
    const nClases = clases.filter((c) => c.capitulo_id === cap._id).length;
    const nTemas  = temas.filter((t) => t.capitulo_id === cap._id).length;

    // Mismo slug que genera Canvas desde título "Capitulo N Clases"
    const slug = `capitulo-${cap.position}-clases`;
    const url  = `/courses/${canvas_curso_id}/pages/${slug}`;

    return `
      <a href="${url}" style="
        display: flex;
        align-items: center;
        gap: 16px;
        background-color: #ffffff;
        border: 1px solid #d9e4ee;
        border-radius: 12px;
        padding: 18px 20px;
        margin-bottom: 12px;
        text-decoration: none;
        font-family: sans-serif;
      ">

        <!-- Número circular -->
        <div style="
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #4A6D8C;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 500;
          flex-shrink: 0;
          font-family: sans-serif;
        ">${cap.position}</div>

        <!-- Info -->
        <div style="flex: 1; min-width: 0; font-family: sans-serif;">
          <div style="
            font-size: 15px;
            font-weight: 500;
            color: #1f2c38;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${cap.nombre}</div>
          <div style="
            font-size: 12px;
            color: #6793ba;
            margin-top: 3px;
          ">${nClases} clase${nClases !== 1 ? "s" : ""} &middot; ${nTemas} tema${nTemas !== 1 ? "s" : ""}</div>
        </div>

        <!-- Flecha -->
        <div style="
          font-size: 20px;
          color: #8daecb;
          flex-shrink: 0;
          font-family: sans-serif;
        ">&#8250;</div>

      </a>
    `;
  }).join("");

  return `
    <div style="font-family: sans-serif;">

      <!-- Header -->
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #4A6D8C;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <span style="color: white; font-size: 18px;">&#128218;</span>
        </div>
        <div>
          <div style="
            font-size: 20px;
            font-weight: 600;
            color: #1f2c38;
            line-height: 1.2;
            font-family: sans-serif;
          ">${curso.nombre}</div>
          <div style="
            font-size: 12px;
            color: #6793ba;
            margin-top: 2px;
            font-family: sans-serif;
          ">${curso.codigo} &middot; ${capitulosOrdenados.length} cap&#237;tulo${capitulosOrdenados.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <!-- Lista de capítulos -->
      <div>${itemsHtml}</div>

    </div>
  `;
};