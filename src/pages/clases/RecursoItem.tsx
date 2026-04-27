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

  // Determina el estado de sync del recurso
  const tieneSynced = (() => {
    if (recurso.tipo === "diapositiva") {
      return diap?.canvas_deployments.some((d) => d.status === "synced") ?? false;
    }
    if (recurso.tipo === "video") {
      return video?.canvas_deployments.some((d) => d.status === "synced") ?? false;
    }
    if (recurso.tipo === "quiz") {
      return quiz?.canvas_deployments.some((d) => d.status === "synced") ?? false;
    }
    return false;
  })();

  const tieneError = recurso.canvas_deployments.some((d) => d.status === "error");

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar ${cfg.label}?`)) return;
    setEliminando(true);
    await dispatch(eliminarRecurso({ recurso_id: recurso._id }));
    setEliminando(false);
  };

  const handleEditar = () => {
    if (recurso.tipo === "diapositiva") {
      // Si tiene URL externa explícita → modal URL
      // En cualquier otro caso (editor, vacía, sin diap) → ir al editor
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

  return (
    <>
      <div
        className="flex items-center justify-between group px-2 py-1.5 rounded-lg"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Info */}
        <div className="flex items-center gap-2">
          {/* Indicador color + dot de estado */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: `${cfg.color}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: cfg.color, fontWeight: 600,
            }}>
              {cfg.icon}
            </div>
            {/* Dot de sync */}
            <div style={{
              position: "absolute", bottom: -1, right: -1,
              width: 8, height: 8, borderRadius: "50%",
              background: tieneError ? "#ef4444" : tieneSynced ? "#1a9e5c" : "#f59e0b",
              border: "1.5px solid white",
            }} />
          </div>

          <div className="flex flex-col">
            <span style={{ fontSize: 13, color: "#4d4d4d" }}>
              {cfg.label}
            </span>

            {/* Subtítulo contextual */}
            {recurso.tipo === "quiz" && quiz && (
              <span
                style={{ fontSize: 10, color: "#2d5be3", cursor: "pointer", textDecoration: "underline" }}
                onClick={handleEditar}
              >
                Editar preguntas
              </span>
            )}
            {recurso.tipo === "diapositiva" && diap && diap.slides && diap.slides.length > 0 && (
              <span style={{ fontSize: 10, color: "#4A6D8C" }}>
                {diap.slides.length} slide{diap.slides.length !== 1 ? "s" : ""}
              </span>
            )}
            {recurso.tipo === "diapositiva" && diap && (!diap.slides || diap.slides.length === 0) && diap.url && diap.url.trim() !== "" && (
              <span style={{ fontSize: 10, color: "#94a3b8" }}>
                URL externa
              </span>
            )}
            {recurso.tipo === "diapositiva" && diap && (!diap.slides || diap.slides.length === 0) && (!diap.url || diap.url.trim() === "") && (
              <span style={{ fontSize: 10, color: "#4A6D8C" }}>
                Editor — sin slides aún
              </span>
            )}
            {recurso.tipo === "diapositiva" && !diap && (
              <span style={{ fontSize: 10, color: "#f47c3c" }}>
                Sin configurar
              </span>
            )}
            {recurso.tipo === "video" && !video && (
              <span style={{ fontSize: 10, color: "#e03030" }}>
                Sin URL
              </span>
            )}
          </div>
        </div>

        {/* Acciones — visibles al hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={handleEditar}
              sx={{ color: "#8daecb", p: 0.3, "&:hover": { color: "#4A6D8C" } }}
            >
              <EditOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <span>
              <IconButton
                size="small"
                onClick={handleEliminar}
                disabled={eliminando}
                sx={{ color: "#8daecb", p: 0.3, "&:hover": { color: "#ef4444" } }}
              >
                {eliminando
                  ? <CircularProgress size={12} />
                  : <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                }
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Modales edición */}
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