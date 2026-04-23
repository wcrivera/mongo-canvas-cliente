// src/pages/clases/RecursoItem.tsx
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
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
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();

  const { quizzes }       = useAppSelector((s) => s.quizMongo);
  const { diapositivas }  = useAppSelector((s) => s.diapositivaMongo);
  const { videos }        = useAppSelector((s) => s.videoMongo);

  const [eliminando, setEliminando] = useState(false);
  const [modalDiapositiva, setModalDiapositiva] = useState(false);
  const [modalVideo, setModalVideo]             = useState(false);

  const cfg   = CONFIG[recurso.tipo];
  const quiz  = quizzes.find((q) => q.recurso_id === recurso._id);
  const diap  = diapositivas.find((d) => d.recurso_id === recurso._id);
  const video = videos.find((v) => v.recurso_id === recurso._id);

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar ${cfg.label}?`)) return;
    setEliminando(true);
    await dispatch(eliminarRecurso({ recurso_id: recurso._id }));
    setEliminando(false);
  };

  const handleEditar = () => {
    if (recurso.tipo === 'diapositiva') {
      setModalDiapositiva(true);
    } else if (recurso.tipo === 'video') {
      setModalVideo(true);
    } else if (recurso.tipo === 'quiz') {
      navigate(
        `/cursos/${recurso.curso_id}/capitulos/${recurso.capitulo_id}/clases/${recurso.clase_id}/quiz/${recurso._id}`
      );
    }
  };

  // Estado sync del recurso
  const tieneSynced = recurso.canvas_deployments.some(
    (d) => d.status === 'synced'
  );
  const tieneError = recurso.canvas_deployments.some(
    (d) => d.status === 'error'
  );

  return (
    <>
      <div className="flex items-center gap-2 group">

        {/* Ícono + label */}
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 30, height: 30,
              borderRadius: 6,
              backgroundColor: cfg.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 13,
              flexShrink: 0,
              position: "relative",
            }}
          >
            {cfg.icon}

            {/* Indicador de estado */}
            <div
              style={{
                position: "absolute",
                top: -3, right: -3,
                width: 8, height: 8,
                borderRadius: "50%",
                background: tieneError
                  ? "#ef4444"
                  : tieneSynced
                    ? "#1a9e5c"
                    : "#f59e0b",
                border: "1.5px solid white",
              }}
            />
          </div>

          <div className="flex flex-col">
            <span style={{ fontSize: 13, color: "#4d4d4d" }}>
              {cfg.label}
            </span>

            {/* Meta por tipo */}
            {recurso.tipo === 'quiz' && quiz && (
              <span
                style={{
                  fontSize: 10,
                  color: "#2d5be3",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={handleEditar}
              >
                Editar preguntas
              </span>
            )}
            {recurso.tipo === 'diapositiva' && !diap && (
              <span style={{ fontSize: 10, color: "#f47c3c" }}>
                Sin URL
              </span>
            )}
            {recurso.tipo === 'video' && !video && (
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
              sx={{
                color: "#8daecb",
                p: 0.3,
                "&:hover": { color: "#4A6D8C" },
              }}
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
                sx={{
                  color: "#8daecb",
                  p: 0.3,
                  "&:hover": { color: "#ef4444" },
                }}
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