import type { IClase }       from "../../store/slices/clase";
import type { ITema }        from "../../store/slices/tema";
import type { IDiapositiva } from "../../store/slices/diapositiva";
import type { IVideo }       from "../../store/slices/video";
import type { IQuiz }        from "../../store/slices/quiz";
import type { IMongoCurso }  from "../../store/slices/mongoCurso";
import type { ICapitulo }    from "../../store/slices/capitulo";

interface GenerarHtmlClasesParams {
  curso:          IMongoCurso;
  capitulo:       ICapitulo;
  clases:         IClase[];
  temas:          ITema[];
  diapositivas:   IDiapositiva[];
  videos:         IVideo[];
  quizzes:        IQuiz[];
  canvas_curso_id: number;
}

const CONFIG_RECURSO = {
  diapositiva: { color: "#f47c3c", icon: "&#9638;", label: "Diapositiva" },
  video:       { color: "#e03030", icon: "&#9654;", label: "Video" },
  quiz:        { color: "#2d5be3", icon: "&#9998;", label: "Quiz" },
};

export const generarHtmlClases = ({
  curso, capitulo, clases, temas,
  diapositivas, videos, quizzes, canvas_curso_id,
}: GenerarHtmlClasesParams): string => {

  const clasesOrdenadas = [...clases].sort((a, b) => a.position - b.position);

  const clasesHtml = clasesOrdenadas.map((clase) => {
    const temasClase = temas
      .filter((t) => t.clase_id === clase._id)
      .sort((a, b) => a.position - b.position);

    const temasHtml = temasClase.map((tema) => {
      // Recursos directamente por tema_id — sin modelo Recurso
      const diapo = diapositivas.find((d) => d.tema_id === tema._id && d.contexto === "clase");
      const video = videos.find((v) => v.tema_id === tema._id && v.contexto === "clase");
      const quiz  = quizzes.find((q) => q.tema_id === tema._id && q.contexto === "clase");

      const getDiapoUrl = () => {
        const dep = diapo?.canvas_deployments.find((d) => d.canvas_curso_id === canvas_curso_id);
        return dep?.canvas_page_url ? `/courses/${canvas_curso_id}/pages/${dep.canvas_page_url}` : "#";
      };
      const getVideoUrl = () => {
        const dep = video?.canvas_deployments.find((d) => d.canvas_curso_id === canvas_curso_id);
        return dep?.canvas_page_url ? `/courses/${canvas_curso_id}/pages/${dep.canvas_page_url}` : "#";
      };
      const getQuizUrl = () => {
        const dep = quiz?.canvas_deployments.find((d) => d.canvas_curso_id === canvas_curso_id);
        return dep?.canvas_quiz_id ? `/courses/${canvas_curso_id}/quizzes/${dep.canvas_quiz_id}` : "#";
      };

      const recursosHtml = [
        diapo ? { tipo: "diapositiva", url: getDiapoUrl() } : null,
        video ? { tipo: "video",       url: getVideoUrl() } : null,
        quiz  ? { tipo: "quiz",        url: getQuizUrl() }  : null,
      ]
        .filter(Boolean)
        .map((r) => {
          const cfg = CONFIG_RECURSO[r!.tipo as keyof typeof CONFIG_RECURSO];
          return `
          <div style="display:flex;align-items:center;gap:8px;">
            <a href="${r!.url}" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:6px;background-color:${cfg.color};color:white;font-size:13px;text-decoration:none;flex-shrink:0;">${cfg.icon}</a>
            <span style="font-size:13px;color:#4d4d4d;font-family:sans-serif;">${cfg.label}</span>
          </div>`;
        })
        .join("");

      return `
        <div style="border-top:1px solid #e0e0e0;padding:14px 20px;font-family:sans-serif;">
          <p style="margin:0 0 10px 0;font-size:13px;color:#555;font-weight:500;">${tema.nombre}</p>
          <div style="display:flex;gap:28px;align-items:center;flex-wrap:wrap;">${recursosHtml}</div>
        </div>`;
    }).join("");

    return `
      <div style="background-color:white;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;margin-bottom:16px;font-family:sans-serif;">
        <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
          <div style="width:48px;height:48px;border-radius:50%;background-color:white;border:1px solid #e0e0e0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;">&#127891;</div>
          <div>
            <div style="font-size:11px;font-weight:500;color:#a0a0a0;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Clase ${clase.position}</div>
            <div style="font-size:15px;font-weight:500;color:#1f2c38;">${clase.nombre}</div>
          </div>
        </div>
        ${temasHtml}
      </div>`;
  }).join("");

  return `
    <div style="font-family:sans-serif;position:relative;top:-70px;">
      <div style="background-color:#4A6D8C;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:6px;">${curso.codigo} &middot; ${curso.nombre}</div>
        <div style="font-size:18px;font-weight:500;color:white;margin-bottom:14px;">Cap&#237;tulo ${capitulo.position}. ${capitulo.nombre}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <div style="padding:6px 16px;border-radius:20px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);font-size:13px;color:white;font-weight:500;">Clases</div>
          <a href="/courses/${canvas_curso_id}/pages/capitulo-${capitulo.position}-ayudantias" style="text-decoration:none;padding:6px 16px;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,0.3);font-size:13px;color:rgba(255,255,255,0.7);">Ayudant&#237;as</a>
          <a href="/courses/${canvas_curso_id}/pages/capitulo-${capitulo.position}-ejercicios" style="text-decoration:none;padding:6px 16px;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,0.3);font-size:13px;color:rgba(255,255,255,0.7);">Ejercicios</a>
        </div>
      </div>
      ${clasesHtml}
    </div>`;
};