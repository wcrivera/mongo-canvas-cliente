// src/pages/clases/RecursoItem.tsx
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import { useState }      from "react";
import { useNavigate }   from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { eliminarRecurso }                from "../../store/slices/recurso";
import type { IRecurso }                  from "../../store/slices/recurso";
import ModalUrlDiapositiva                from "./ModalUrlDiapositiva";
import ModalUrlVideo                      from "./ModalUrlVideo";

interface Props {
  recurso: IRecurso;
}

const CONFIG = {
  diapositiva: { color: "#f47c3c", label: "Diapositiva", icon: "▦" },
  video:       { color: "#e03030", label: "Video",       icon: "▶" },
  quiz:        { color: "#2d5be3", label: "Ejercicio",   icon: "✎" },
};

const RecursoItem = ({ recurso }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { quizzes }      = useAppSelector((s) => s.quizMongo);
  const { diapositivas } = useAppSelector((s) => s.diapositivaMongo);
  const { videos }       = useAppSelector((s) => s.videoMongo);

  const [eliminando,       setEliminando]       = useState(false);
  const [modalDiapositiva, setModalDiapositiva] = useState(false);
  const [modalVideo,       setModalVideo]       = useState(false);

  const cfg   = CONFIG[recurso.tipo];
  const quiz  = quizzes.find((q) => q.recurso_id === recurso._id);
  const diap  = diapositivas.find((d) => d.recurso_id === recurso._id);
  const video = videos.find((v) => v.recurso_id === recurso._id);

  const tieneSynced = (() => {
    if (recurso.tipo === "diapositiva") return diap?.canvas_deployments.some((d) => d.status === "synced") ?? false;
    if (recurso.tipo === "video")       return video?.canvas_deployments.some((d) => d.status === "synced") ?? false;
    if (recurso.tipo === "quiz")        return quiz?.canvas_deployments.some((d) => d.status === "synced") ?? false;
    return false;
  })();

  const tieneError = recurso.canvas_deployments.some((d) => d.status === "error");

  // ── Subtítulo contextual ──────────────────────────────────────────────────

  const subtitulo = (() => {
    if (recurso.tipo === "quiz") return "preguntas";
    if (recurso.tipo === "diapositiva") {
      if (!diap)                                          return "sin config";
      if (diap.slides && diap.slides.length > 0)         return `${diap.slides.length} slide${diap.slides.length !== 1 ? "s" : ""}`;
      if (diap.url && diap.url.trim() !== "")            return "URL externa";
      return "editor";
    }
    if (recurso.tipo === "video") {
      return video ? "configurado" : "sin URL";
    }
    return "";
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarRecurso({ recurso_id: recurso._id }));
    setEliminando(false);
  };

  const handleEditar = () => {
    if (recurso.tipo === "diapositiva") {
      if (diap?.url && diap.url.trim() !== "") {
        setModalDiapositiva(true);
      } else {
        navigate(
          `/cursos/${recurso.curso_id}/capitulos/${recurso.capitulo_id}/clases/${recurso.clase_id}/diapositiva/${recurso._id}`,
        );
      }
    } else if (recurso.tipo === "video") {
      setModalVideo(true);
    } else if (recurso.tipo === "quiz") {
      navigate(
        `/cursos/${recurso.curso_id}/capitulos/${recurso.capitulo_id}/clases/${recurso.clase_id}/quiz/${quiz?.recurso_id ?? recurso._id}`,
      );
    }
  };

  // ── Render — pill horizontal compacto ────────────────────────────────────

  return (
    <>
      <div
        className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
        style={{
          background:   `${cfg.color}10`,
          border:       `1px solid ${cfg.color}30`,
          cursor:       "pointer",
          transition:   "all 0.15s",
          position:     "relative",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = `${cfg.color}20`;
          (e.currentTarget as HTMLDivElement).style.borderColor = `${cfg.color}60`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = `${cfg.color}10`;
          (e.currentTarget as HTMLDivElement).style.borderColor = `${cfg.color}30`;
        }}
        onClick={handleEditar}
      >
        {/* Ícono */}
        <span style={{ fontSize: 13, color: cfg.color, fontWeight: 700, lineHeight: 1 }}>
          {cfg.icon}
        </span>

        {/* Label + subtítulo */}
        <div className="flex flex-col" style={{ lineHeight: 1.2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>
            {cfg.label}
          </span>
          {subtitulo && (
            <span style={{ fontSize: 9.5, color: "#8daecb" }}>
              {subtitulo}
            </span>
          )}
        </div>

        {/* Dot de sync */}
        <div style={{
          width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
          background: tieneError ? "#ef4444" : tieneSynced ? "#1a9e5c" : "#f59e0b",
        }} />

        {/* Acciones — visibles al hover, flotando a la derecha */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Editar">
            <IconButton size="small" onClick={handleEditar}
              sx={{ color: cfg.color, p: 0.25, "&:hover": { bgcolor: `${cfg.color}20` } }}>
              <EditOutlinedIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <span>
              <IconButton size="small" onClick={handleEliminar} disabled={eliminando}
                sx={{ color: "#8daecb", p: 0.25, "&:hover": { color: "#ef4444" } }}>
                {eliminando
                  ? <CircularProgress size={10} />
                  : <DeleteOutlineIcon sx={{ fontSize: 12 }} />
                }
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>

      {modalDiapositiva && (
        <ModalUrlDiapositiva
          recurso_id={recurso._id}
          diapositiva={diap}
          onClose={() => setModalDiapositiva(false)}
        />
      )}
      {modalVideo && (
        <ModalUrlVideo
          recurso_id={recurso._id}
          video={video}
          onClose={() => setModalVideo(false)}
        />
      )}
    </>
  );
};

export default RecursoItem;