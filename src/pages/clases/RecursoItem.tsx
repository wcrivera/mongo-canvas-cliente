// src/pages/clases/RecursoItem.tsx
import { IconButton, Tooltip, CircularProgress, Chip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import RefreshIcon       from "@mui/icons-material/Refresh";
import { useState }      from "react";
import { useNavigate }   from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { eliminarRecurso }               from "../../store/slices/recurso";
import { reintentarDiapositiva }         from "../../store/slices/diapositiva";
import type { IRecurso }                 from "../../store/slices/recurso";
import ModalUrlDiapositiva               from "./ModalUrlDiapositiva";
import ModalUrlVideo                     from "./ModalUrlVideo";

interface Props {
  recurso: IRecurso;
}

const CONFIG = {
  diapositiva: { color: "#f47c3c", label: "Diapositiva", icon: "▦" },
  video:       { color: "#e03030", label: "Video",       icon: "▶" },
  quiz:        { color: "#2d5be3", label: "Ejercicio",   icon: "✎" },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  synced:  { bg: "#d1fae5", text: "#065f46", label: "Sincronizado" },
  pending: { bg: "#fef9c3", text: "#854d0e", label: "Pendiente"    },
  dirty:   { bg: "#fef9c3", text: "#854d0e", label: "Desactualizado" },
  error:   { bg: "#fee2e2", text: "#991b1b", label: "Error"        },
  missing: { bg: "#fee2e2", text: "#991b1b", label: "Faltante"     },
};

const RecursoItem = ({ recurso }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { quizzes }      = useAppSelector((s) => s.quizMongo);
  const { diapositivas } = useAppSelector((s) => s.diapositivaMongo);
  const { videos }       = useAppSelector((s) => s.videoMongo);

  const [eliminando,       setEliminando]       = useState(false);
  const [verDeploys,       setVerDeploys]        = useState(false);
  const [reintentando,     setReintentando]      = useState<number | null>(null);
  const [modalDiapositiva, setModalDiapositiva]  = useState(false);
  const [modalVideo,       setModalVideo]        = useState(false);

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

  const tieneError = (() => {
    if (recurso.tipo === "diapositiva") return diap?.canvas_deployments.some((d) => d.status === "error") ?? false;
    return recurso.canvas_deployments.some((d) => d.status === "error");
  })();

  // Subtítulo contextual
  const subtitulo = (() => {
    if (recurso.tipo === "quiz") return "preguntas";
    if (recurso.tipo === "diapositiva") {
      if (!diap)                                  return "sin config";
      if (diap.slides && diap.slides.length > 0)  return `${diap.slides.length} slide${diap.slides.length !== 1 ? "s" : ""}`;
      if (diap.url && diap.url.trim() !== "")     return "URL externa";
      return "editor";
    }
    if (recurso.tipo === "video") return video ? "configurado" : "sin URL";
    return "";
  })();

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

  const handleReintentarDiap = async (canvas_curso_id: number) => {
    if (!diap) return;
    setReintentando(canvas_curso_id);
    await dispatch(reintentarDiapositiva({ diapositiva_id: diap._id, canvas_curso_id }));
    setReintentando(null);
  };

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
          (e.currentTarget as HTMLDivElement).style.background   = `${cfg.color}20`;
          (e.currentTarget as HTMLDivElement).style.borderColor  = `${cfg.color}60`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background   = `${cfg.color}10`;
          (e.currentTarget as HTMLDivElement).style.borderColor  = `${cfg.color}30`;
        }}
        onClick={handleEditar}
      >
        {/* Ícono */}
        <span style={{ fontSize: 13, color: cfg.color, fontWeight: 700, lineHeight: 1 }}>
          {cfg.icon}
        </span>

        {/* Label + subtítulo */}
        <div className="flex flex-col" style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>
            {cfg.label}
          </span>
          {subtitulo && (
            <span style={{ fontSize: 9.5, color: "#8daecb" }}>{subtitulo}</span>
          )}
        </div>

        {/* Dot de sync */}
        <div style={{
          width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
          background: tieneError ? "#ef4444" : tieneSynced ? "#1a9e5c" : "#f59e0b",
        }} />

        {/* Botón para ver deployments de diapositiva */}
        {recurso.tipo === "diapositiva" && diap && (
          <Tooltip title="Ver estado Canvas">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setVerDeploys((v) => !v); }}
              sx={{ color: "#8daecb", p: 0.25, ml: 0.5 }}
            >
              <span style={{ fontSize: 10 }}>▾</span>
            </IconButton>
          </Tooltip>
        )}

        {/* Acciones — visibles al hover */}
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
                {eliminando ? <CircularProgress size={10} /> : <DeleteOutlineIcon sx={{ fontSize: 12 }} />}
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Deployments expandidos — solo para diapositivas del editor */}
      {verDeploys && diap && diap.canvas_deployments.length > 0 && (
        <div style={{
          marginLeft: 8, padding: "8px 10px",
          background: "#f8fafc", borderRadius: 6,
          border: "1px solid #e2e8f0",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Estado Canvas — Diapositiva
          </Typography>
          {diap.canvas_deployments.map((d) => {
            const sc = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.pending;
            const puedeReintentar = d.status === "error" || d.status === "missing" || d.status === "pending";
            return (
              <div key={d.canvas_curso_id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Chip
                  label={`Canvas ${d.canvas_curso_id} · ${sc.label}`}
                  size="small"
                  sx={{ fontSize: "0.6rem", height: 20, bgcolor: sc.bg, color: sc.text, fontWeight: 600, borderRadius: 1 }}
                />
                {d.error_msg && (
                  <Typography variant="caption" sx={{ color: "#ef4444", fontSize: "0.6rem" }} noWrap>
                    {d.error_msg}
                  </Typography>
                )}
                {puedeReintentar && (
                  reintentando === d.canvas_curso_id
                    ? <CircularProgress size={12} sx={{ color: "#4A6D8C" }} />
                    : (
                      <Tooltip title="Reintentar publicación">
                        <IconButton size="small"
                          onClick={() => handleReintentarDiap(d.canvas_curso_id)}
                          sx={{ p: 0.3, color: "#8daecb", "&:hover": { color: "#4A6D8C" } }}>
                          <RefreshIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    )
                )}
              </div>
            );
          })}
        </div>
      )}

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