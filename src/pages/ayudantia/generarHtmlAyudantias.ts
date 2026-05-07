import type { IAyudantia }    from "../../store/slices/ayudantia";
import type { ISolucionTexto } from "../../store/slices/solucionTexto";
import type { IVideo }        from "../../store/slices/video";
import type { IQuiz }         from "../../store/slices/quiz";
import type { IMongoCurso }   from "../../store/slices/mongoCurso";
import type { ICapitulo }     from "../../store/slices/capitulo";
import { toCanvasHTML } from "../../components/CKEditor/canvasHTML";

interface GenerarHtmlAyudantiasParams {
  curso:           IMongoCurso;
  capitulo:        ICapitulo;
  ayudantias:      IAyudantia[];
  soluciones:      ISolucionTexto[];
  videos:          IVideo[];
  quizzes:         IQuiz[];
  canvas_curso_id: number;
}

export const generarHtmlAyudantias = ({
  curso,
  capitulo,
  ayudantias,
  soluciones,
  videos,
  quizzes,
  canvas_curso_id,
}: GenerarHtmlAyudantiasParams): string => {

  const ayudantiasOrdenadas = [...ayudantias].sort(
    (a, b) => a.position - b.position
  );

  const itemsHtml = ayudantiasOrdenadas.map((ay) => {
    // Recursos directamente por ayudantia_id (sin modelo Recurso)
    const solucion = soluciones.find(s => s.ayudantia_id === ay._id);
    const video    = videos.find(v => v.ayudantia_id === ay._id && v.contexto === "ayudantia");
    const quiz     = quizzes.find(q => q.ayudantia_id === ay._id && q.contexto === "ayudantia");

    // URLs de recursos
    const solucionDep = solucion?.canvas_deployments.find(
      d => d.canvas_curso_id === canvas_curso_id
    );
    const videoDep = video?.canvas_deployments.find(
      d => d.canvas_curso_id === canvas_curso_id
    );
    const quizDep = quiz?.canvas_deployments.find(
      d => d.canvas_curso_id === canvas_curso_id
    );

    const solucionUrl = solucionDep?.canvas_page_url
      ? `/courses/${canvas_curso_id}/pages/${solucionDep.canvas_page_url}`
      : '#';
    const videoUrl = videoDep?.canvas_page_url
      ? `/courses/${canvas_curso_id}/pages/${videoDep.canvas_page_url}`
      : '#';
    const quizUrl = quizDep?.canvas_quiz_id
      ? `/courses/${canvas_curso_id}/quizzes/${quizDep.canvas_quiz_id}`
      : '#';

    // Botones de recursos
    const botonesHtml = `
      <div style="
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 14px;
      ">
        ${solucion ? `
          <a href="${solucionUrl}" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 6px;
            background-color: #4A6D8C;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-family: sans-serif;
          ">&#128196; Soluci&#243;n</a>
        ` : ''}
        ${video ? `
          <a href="${videoUrl}" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 6px;
            background-color: #e03030;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-family: sans-serif;
          ">&#9654; Video</a>
        ` : ''}
        ${quiz ? `
          <a href="${quizUrl}" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 6px;
            background-color: #2d5be3;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-family: sans-serif;
          ">&#9998; Quiz</a>
        ` : ''}
      </div>
    `;

    return `
      <div style="
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 16px;
        font-family: sans-serif;
      ">
        <!-- Header ayudantía -->
        <div style="
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
        ">
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
          ">&#128101;</div>
          <div>
            <div style="
              font-size: 11px;
              font-weight: 500;
              color: #a0a0a0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 2px;
            ">Ayudant&#237;a ${ay.position}</div>
            <div style="
              font-size: 15px;
              font-weight: 500;
              color: #1f2c38;
            ">${ay.nombre}</div>
          </div>
        </div>

        <!-- Enunciado -->
        <div style="
          border-top: 1px solid #f0f0f0;
          padding: 16px 20px;
          font-size: 14px;
          line-height: 1.8;
          color: #3d3d3d;
        ">
          ${toCanvasHTML(ay.enunciado)}
          ${botonesHtml}
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

          <div style="
            padding: 6px 16px;
            border-radius: 20px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 13px;
            color: white;
            font-weight: 500;
          ">Ayudant&#237;as</div>

          <a href="/courses/${canvas_curso_id}/pages/capitulo-${capitulo.position}-ejercicios" style="
            text-decoration: none;
            padding: 6px 16px;
            border-radius: 20px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 13px;
            color: rgba(255,255,255,0.7);
          ">Ejercicios</a>
        </div>
      </div>

      <!-- Lista de ayudantías -->
      ${itemsHtml}

    </div>
  `;
};