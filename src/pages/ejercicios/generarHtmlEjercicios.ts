import type { IEjercicio }  from "../../store/slices/ejercicio";
import type { IMongoCurso } from "../../store/slices/mongoCurso";
import type { ICapitulo }   from "../../store/slices/capitulo";
import { toCanvasHTML } from "../../components/Editor";

interface GenerarHtmlEjerciciosParams {
  curso:           IMongoCurso;
  capitulo:        ICapitulo;
  ejercicios:      IEjercicio[];
  canvas_curso_id: number;
}

export const generarHtmlEjercicios = ({
  curso,
  capitulo,
  ejercicios,
  canvas_curso_id,
}: GenerarHtmlEjerciciosParams): string => {

  const ejerciciosOrdenados = [...ejercicios].sort(
    (a, b) => a.position - b.position
  );

  const itemsHtml = ejerciciosOrdenados.map((ej) => {
    // URL del quiz en Canvas
    const dep = ej.canvas_deployments.find(
      d => d.canvas_curso_id === canvas_curso_id
    );
    const quizUrl = dep?.canvas_quiz_id
      ? `/courses/${canvas_curso_id}/quizzes/${dep.canvas_quiz_id}`
      : '#';

    return `
      <div style="
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 16px;
        font-family: sans-serif;
      ">
        <!-- Header ejercicio -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
        ">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background-color: #f0f4f8;
              border: 1px solid #e0e0e0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              font-size: 22px;
            ">&#9998;</div>
            <div>
              <div style="
                font-size: 11px;
                font-weight: 500;
                color: #a0a0a0;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
              ">Ejercicio ${ej.position}</div>
              <div style="
                font-size: 15px;
                font-weight: 500;
                color: #1f2c38;
              ">${ej.nombre}</div>
            </div>
          </div>

          <!-- Botón responder -->
          <a href="${quizUrl}" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            border-radius: 8px;
            background-color: #2d5be3;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            font-family: sans-serif;
            flex-shrink: 0;
          ">Responder</a>
        </div>

        <!-- Enunciado -->
        <div style="
          border-top: 1px solid #f0f0f0;
          padding: 16px 20px;
          font-size: 14px;
          line-height: 1.8;
          color: #3d3d3d;
        ">
          ${toCanvasHTML(ej.enunciado)}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div style="
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
      font-family: sans-serif;
      background-color: #f0f4f8;
      min-height: 100vh;
    ">

      <!-- Header azul con tabs -->
      <div style="
        background-color: #4A6D8C;
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 24px;
      ">
        <div style="
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          margin-bottom: 6px;
        ">${curso.codigo} &middot; ${curso.nombre}</div>

        <div style="
          font-size: 18px;
          font-weight: 500;
          color: white;
          margin-bottom: 14px;
        ">Cap&#237;tulo ${capitulo.position}. ${capitulo.nombre}</div>

        <!-- Tabs -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/courses/${canvas_curso_id}/pages/capitulo-${capitulo.position}-clases" style="
            text-decoration: none;
            padding: 6px 16px;
            border-radius: 20px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 13px;
            color: rgba(255,255,255,0.7);
          ">Clases</a>

          <a href="/courses/${canvas_curso_id}/pages/capitulo-${capitulo.position}-ayudantias" style="
            text-decoration: none;
            padding: 6px 16px;
            border-radius: 20px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 13px;
            color: rgba(255,255,255,0.7);
          ">Ayudant&#237;as</a>

          <div style="
            padding: 6px 16px;
            border-radius: 20px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 13px;
            color: white;
            font-weight: 500;
          ">Ejercicios</div>
        </div>
      </div>

      <!-- Lista de ejercicios -->
      ${itemsHtml}

    </div>
  `;
};