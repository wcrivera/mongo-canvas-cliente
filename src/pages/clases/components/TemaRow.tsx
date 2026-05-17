// src/pages/clases/components/TemaRow.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import QuizIcon from "@mui/icons-material/Quiz";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { editarTema } from "../../../store/slices/tema";
import { eliminarDiapositiva } from "../../../store/slices/diapositiva";
import { eliminarVideo } from "../../../store/slices/video";
import { eliminarQuiz } from "../../../store/slices/quiz";
import type { ITema } from "../../../store/slices/tema";
import type { IQuiz } from "../../../store/slices/quiz";
import ModalElegirDiapositiva from "./ModalElegirDiapositiva";
import ModalUrlDiapositiva from "./ModalUrlDiapositiva";
import ModalUrlVideo from "./ModalUrlVideo";
import ModalCrearQuiz from "./ModalCrearQuiz";
import RecursoSlot from "../../capitulo/components/RecursoSlot";
import ModalEliminarTema from "./ModalEliminarTema";

// ── Estilos ───────────────────────────────────────────────────────────────────
const iconBtnSmSx = {
  width: 24,
  height: 24,
  borderRadius: "6px",
  border: "0.5px solid #E2E8F0",
  bgcolor: "#F8FAFC",
  color: "#94A3B8",
  "&:hover": { bgcolor: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" },
};
const iconBtnSmActiveSx = {
  ...iconBtnSmSx,
  color: "#2563EB",
  bgcolor: "#EFF6FF",
  borderColor: "#BFDBFE",
  "&:hover": { bgcolor: "#DBEAFE", color: "#1D4ED8", borderColor: "#93C5FD" },
};

interface Props {
  tema: ITema;
  capitulo_id: string;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  indexClase: number;
  indexTema: number;
}

const TemaRow = ({
  tema,
  capitulo_id,
  indexClase,
  indexTema,
  isDragging = false,
  dragHandleProps = {},
}: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { diapositivas } = useAppSelector((s) => s.diapositivaMongo);
  const { videos } = useAppSelector((s) => s.videoMongo);
  const quizzesSafe = useAppSelector((s) =>
    Array.isArray(s.quizMongo.quizzes) ? s.quizMongo.quizzes : [],
  );

  const diapoTema = diapositivas.find(
    (d) =>
      d.tema_id?.toString() === tema._id.toString() && d.contexto === "clase",
  );
  const videoTema = videos.find(
    (v) =>
      v.tema_id?.toString() === tema._id.toString() && v.contexto === "clase",
  );
  const quizTema = quizzesSafe.find(
    (q) =>
      q.tema_id?.toString() === tema._id.toString() && q.contexto === "clase",
  ) as IQuiz | undefined;

  // ── Estado local ──────────────────────────────────────────────────────────
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(tema.nombre);
  const [guardando, setGuardando] = useState(false);
  const [togglingCanvas, setTogglingCanvas] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [modalEliminar, setModalEliminar] = useState(false);

  // Modales de recursos
  const [modalElegir, setModalElegir] = useState(false);
  const [modalUrl, setModalUrl] = useState(false);
  const [modalVideo, setModalVideo] = useState(false);
  const [modalQuiz, setModalQuiz] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGuardarNombre = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === tema.nombre) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    await dispatch(editarTema({ tema_id: tema._id, nombre: nombreTrim }));
    setGuardando(false);
    setEditando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGuardarNombre();
    if (e.key === "Escape") {
      setNombre(tema.nombre);
      setEditando(false);
    }
  };

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(
      editarTema({
        tema_id: tema._id,
        published_canvas: !tema.published_canvas,
      }),
    );
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(
      editarTema({ tema_id: tema._id, published_api: !tema.published_api }),
    );
    setTogglingApi(false);
  };

  // Elegir diapositiva: primero mostrar modal de elección (URL o editor)
  const handleElegirUrl = () => {
    setModalElegir(false);
    setModalUrl(true);
  };
  const handleElegirEditor = () => {
    setModalElegir(false);
    // Si ya existe diapositiva con editor, navegar a ella
    if (diapoTema?._id) {
      navigate(
        `/cursos/${tema.curso_id}/capitulos/${capitulo_id}/clases/${tema.clase_id}/diapositiva/${diapoTema._id}`,
      );
    }
  };

  // Navegación a diapositiva existente (Ver / Editar → misma ruta, EditorDiapositiva maneja el modo)
  const irADiapositiva = () => {
    if (!diapoTema) return;
    if (diapoTema.slides && diapoTema.slides.length > 0) {
      // Modo editor
      navigate(
        `/cursos/${tema.curso_id}/capitulos/${capitulo_id}/clases/${tema.clase_id}/diapositiva/${diapoTema._id}`,
      );
    } else {
      // Modo URL → abrir modal de edición de URL
      setModalUrl(true);
    }
  };

  // Navegación a quiz existente
  const irAQuiz = () => {
    if (!quizTema) return;
    navigate(
      `/cursos/${tema.curso_id}/capitulos/${capitulo_id}/clases/${tema.clase_id}/quiz/${quizTema._id}`,
    );
  };

  // Callback cuando se crea un quiz nuevo — navegar a él
  const handleQuizCreado = (quiz: IQuiz) => {
    setModalQuiz(false);
    navigate(
      `/cursos/${tema.curso_id}/capitulos/${capitulo_id}/clases/${tema.clase_id}/quiz/${quiz._id}`,
    );
  };

  return (
    <>
      <div
        style={{
          borderTop: "1px solid #E2E8F0",
          opacity: isDragging ? 0.5 : 1,
          background: isDragging ? "#EFF6FF" : "transparent",
          transition: "background 0.15s",
        }}
      >
        {/* Fila del tema */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 15px 8px 20px",
          }}
        >
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            style={{
              color: "#D1D5DB",
              cursor: "grab",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              touchAction: "none",
            }}
            aria-label="Arrastrar para reordenar"
          >
            <DragIndicatorIcon sx={{ fontSize: 20 }} />
          </div>

          {/* Nombre / editor */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editando ? (
              <div className="flex items-center gap-1">
                <TextField
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={handleKeyDown}
                  size="small"
                  autoFocus
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      fontSize: "0.8rem",
                    },
                  }}
                />
                <Tooltip title="Guardar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleGuardarNombre}
                      disabled={guardando}
                      sx={{ color: "#2563EB" }}
                    >
                      {guardando ? (
                        <CircularProgress size={12} sx={{ color: "#2563EB" }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setNombre(tema.nombre);
                      setEditando(false);
                    }}
                    sx={{ color: "#94A3B8" }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </div>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 200,
                  color: "#334155",
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{ fontWeight: 400, color: "gray" }}
                >{`${indexClase + 1}.${indexTema + 1}.`}</span>{" "}
                {tema.nombre}
              </Typography>
            )}
          </div>

          {/* Acciones del tema */}
          {!editando && (
            <div
              style={{
                display: "flex",
                gap: 3,
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Tooltip
                title={`Canvas: ${tema.published_canvas ? "publicado" : "oculto"}`}
              >
                <span>
                  {togglingCanvas ? (
                    <CircularProgress size={12} sx={{ color: "#2563EB" }} />
                  ) : (
                    <IconButton
                      size="small"
                      onClick={handleToggleCanvas}
                      sx={
                        tema.published_canvas ? iconBtnSmActiveSx : iconBtnSmSx
                      }
                    >
                      <SchoolIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  )}
                </span>
              </Tooltip>
              <Tooltip
                title={`Plataforma: ${tema.published_api ? "publicado" : "oculto"}`}
              >
                <span>
                  {togglingApi ? (
                    <CircularProgress size={12} sx={{ color: "#2563EB" }} />
                  ) : (
                    <IconButton
                      size="small"
                      onClick={handleToggleApi}
                      sx={tema.published_api ? iconBtnSmActiveSx : iconBtnSmSx}
                    >
                      {tema.published_api ? (
                        <PublicIcon sx={{ fontSize: 12 }} />
                      ) : (
                        <PublicOffIcon sx={{ fontSize: 12 }} />
                      )}
                    </IconButton>
                  )}
                </span>
              </Tooltip>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={iconBtnSmSx}
              >
                <MoreHorizIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 0.5,
                      minWidth: 140,
                      borderRadius: "8px",
                      border: "0.5px solid #E2E8F0",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    setEditando(true);
                  }}
                  sx={{ gap: 1.5, py: 0.8, "&:hover": { bgcolor: "#F8FAFC" } }}
                >
                  <ListItemIcon>
                    <EditOutlinedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
                  </ListItemIcon>
                  <Typography
                    variant="body2"
                    sx={{ color: "#334155", fontSize: 13 }}
                  >
                    Editar nombre
                  </Typography>
                </MenuItem>
                <Divider sx={{ borderColor: "#F1F5F9", my: 0.5 }} />
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    setModalEliminar(true);
                  }}
                  sx={{ gap: 1.5, py: 0.8, "&:hover": { bgcolor: "#FFF5F5" } }}
                >
                  <ListItemIcon>
                    <DeleteOutlineIcon
                      sx={{ fontSize: 14, color: "#EF4444" }}
                    />
                  </ListItemIcon>
                  <Typography
                    variant="body2"
                    sx={{ color: "#EF4444", fontSize: 13 }}
                  >
                    Eliminar
                  </Typography>
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>

        {/* Fila de recursos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 14px 8px 48px",
            flexWrap: "wrap",
          }}
        >
          <RecursoSlot
            exists={!!diapoTema}
            label="Diapositiva"
            icon={<SlideshowIcon sx={{ fontSize: 13 }} />}
            iconColor="#F59E0B"
            onVer={irADiapositiva}
            onEditar={irADiapositiva}
            onEliminar={() =>
              diapoTema &&
              dispatch(eliminarDiapositiva({ diapositiva_id: diapoTema._id }))
            }
            onCrear={() => setModalElegir(true)}
          />
          <RecursoSlot
            exists={!!videoTema}
            label="Video"
            icon={<PlayCircleIcon sx={{ fontSize: 13 }} />}
            iconColor="#EF4444"
            onVer={() => setModalVideo(true)}
            onEditar={() => setModalVideo(true)}
            onEliminar={() =>
              videoTema && dispatch(eliminarVideo({ video_id: videoTema._id }))
            }
            onCrear={() => setModalVideo(true)}
          />
          <RecursoSlot
            exists={!!quizTema}
            label="Quiz"
            icon={<QuizIcon sx={{ fontSize: 13 }} />}
            iconColor="#2563EB"
            onVer={irAQuiz}
            onEditar={() => setModalQuiz(true)}
            onEliminar={() =>
              quizTema && dispatch(eliminarQuiz({ quiz_id: quizTema._id }))
            }
            onCrear={() => setModalQuiz(true)}
          />
        </div>
      </div>

      {/* ── Modales ── */}
      {modalEliminar && (
        <ModalEliminarTema
          tema={tema}
          onClose={() => setModalEliminar(false)}
        />
      )}

      {modalElegir && (
        <ModalElegirDiapositiva
          onElegirUrl={handleElegirUrl}
          onElegirEditor={handleElegirEditor}
          onClose={() => setModalElegir(false)}
        />
      )}

      {modalUrl && (
        <ModalUrlDiapositiva
          contexto="clase"
          tema_id={tema._id}
          capitulo_id={capitulo_id}
          curso_id={tema.curso_id}
          titulo={`Diapositiva · ${tema.nombre}`}
          diapositiva={diapoTema}
          onClose={() => setModalUrl(false)}
        />
      )}

      {modalVideo && (
        <ModalUrlVideo
          contexto="clase"
          tema_id={tema._id}
          capitulo_id={capitulo_id}
          curso_id={tema.curso_id}
          titulo={`Video · ${tema.nombre}`}
          video={videoTema}
          onClose={() => setModalVideo(false)}
        />
      )}

      {modalQuiz && (
        <ModalCrearQuiz
          contexto="clase"
          tema_id={tema._id}
          capitulo_id={capitulo_id}
          curso_id={tema.curso_id}
          quiz={quizTema}
          onClose={() => setModalQuiz(false)}
          onCreado={handleQuizCreado}
        />
      )}
    </>
  );
};

export default TemaRow;
