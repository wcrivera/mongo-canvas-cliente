// src/pages/ayudantia/components/AyudantiaCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  TextField,
  CircularProgress,
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

import DescriptionIcon from "@mui/icons-material/Description";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import EditNoteIcon from "@mui/icons-material/EditNote";

import GroupsIcon from "@mui/icons-material/Groups";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { editarAyudantia } from "../../../store/slices/ayudantia";
import { eliminarSolucionTexto } from "../../../store/slices/solucionTexto";
import { eliminarVideo } from "../../../store/slices/video";
import { eliminarQuiz } from "../../../store/slices/quiz";
import type { IAyudantia } from "../../../store/slices/ayudantia";
import type { IQuiz } from "../../../store/slices/quiz";
import ModalSolucionTexto from "./ModalSolucionTexto";
import ModalUrlVideo from "../../clases/components/ModalUrlVideo";
import ModalCrearQuiz from "../../clases/components/ModalCrearQuiz";
import TiptapRenderer from "../../../components/CKEditor/TiptapRenderer";
import RecursoSlot from "./RecursoSlot";
import ModalEliminarAyudantia from "./ModalEliminarAyudantia";
import { ModalEnunciado } from "./ModalEnunciado";

// ── Estilos icon-buttons ──────────────────────────────────────────────────────
const iconBtnSx = {
  width: 26,
  height: 26,
  borderRadius: "6px",
  border: "0.5px solid #E2E8F0",
  bgcolor: "#F8FAFC",
  color: "#94A3B8",
  "&:hover": { bgcolor: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" },
};
const iconBtnActiveSx = {
  ...iconBtnSx,
  color: "#2563EB",
  bgcolor: "#EFF6FF",
  borderColor: "#BFDBFE",
  "&:hover": { bgcolor: "#DBEAFE", color: "#1D4ED8", borderColor: "#93C5FD" },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  ayudantia: IAyudantia;
  curso_id: string;
  capitulo_id: string;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  index: number;
}

// ── AyudantiaCard principal ───────────────────────────────────────────────────
const AyudantiaCard = ({
  ayudantia,
  curso_id,
  capitulo_id,
  isDragging = false,
  dragHandleProps = {},
  index,
}: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Recursos desde el store
  const { soluciones } = useAppSelector((s) => s.solucionTextoMongo);
  const { videos } = useAppSelector((s) => s.videoMongo);
  const quizzesSafe = useAppSelector((s) =>
    Array.isArray(s.quizMongo.quizzes) ? s.quizMongo.quizzes : [],
  );

  const solucion = soluciones.find((s) => s.ayudantia_id === ayudantia._id);
  const video = videos.find(
    (v) => v.ayudantia_id === ayudantia._id && v.contexto === "ayudantia",
  );
  const quiz = quizzesSafe.find(
    (q) => q.ayudantia_id === ayudantia._id && q.contexto === "ayudantia",
  ) as IQuiz | undefined;

  // ── Estado ────────────────────────────────────────────────────────────────
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalEnunciado, setModalEnunciado] = useState(false);
  const [modalSolucion, setModalSolucion] = useState(false);
  const [modalVideo, setModalVideo] = useState(false);
  const [modalQuiz, setModalQuiz] = useState(false);

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombre, setNombre] = useState(ayudantia.nombre);
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [togglingCanvas, setTogglingCanvas] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // ── Handlers nombre ───────────────────────────────────────────────────────
  const handleGuardarNombre = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === ayudantia.nombre) {
      setEditandoNombre(false);
      return;
    }
    setGuardandoNombre(true);
    await dispatch(
      editarAyudantia({ ayudantia_id: ayudantia._id, nombre: nombreTrim }),
    );
    setGuardandoNombre(false);
    setEditandoNombre(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGuardarNombre();
    if (e.key === "Escape") {
      setNombre(ayudantia.nombre);
      setEditandoNombre(false);
    }
  };

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(
      editarAyudantia({
        ayudantia_id: ayudantia._id,
        published_canvas: !ayudantia.published_canvas,
      }),
    );
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(
      editarAyudantia({
        ayudantia_id: ayudantia._id,
        published_api: !ayudantia.published_api,
      }),
    );
    setTogglingApi(false);
  };

  const handleQuizCreado = (quizData: IQuiz) => {
    setModalQuiz(false);
    navigate(
      `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia._id}/quiz/${quizData._id}`,
    );
  };

  const syncCount = ayudantia.canvas_deployments.filter(
    (d) => d.status === "synced",
  ).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        elevation={1}
        sx={{
          borderRadius: "12px",
          border: "0.5px solid #E2E8F0",
          bgcolor: "white",
          overflow: "hidden",
          transition: "box-shadow 0.15s",
          "&:hover": {
            boxShadow: isDragging
              ? "0 8px 24px rgba(0,0,0,0.12)"
              : "0 4px 16px rgba(0,0,0,0.07)",
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 14px",
            }}
          >
            {/* Drag handle */}
            <div
              {...dragHandleProps}
              style={{
                color: "#CBD5E1",
                cursor: "grab",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                touchAction: "none",
              }}
              aria-label="Arrastrar para reordenar"
            >
              <DragIndicatorIcon sx={{ fontSize: 24 }} />
            </div>

            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              <GroupsIcon sx={{ fontSize: 20, color: "white" }} />
            </div>

            {/* Nombre / editor */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editandoNombre ? (
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
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                  <Tooltip title="Guardar">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleGuardarNombre}
                        disabled={guardandoNombre}
                        sx={{ color: "#2563EB" }}
                      >
                        {guardandoNombre ? (
                          <CircularProgress
                            size={14}
                            sx={{ color: "#2563EB" }}
                          />
                        ) : (
                          <CheckIcon sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Cancelar">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setNombre(ayudantia.nombre);
                        setEditandoNombre(false);
                      }}
                      sx={{ color: "#94A3B8" }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </div>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "gray",
                      fontSize: "14px",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mb: 0.6,
                    }}
                  >
                    Ayudantía
                  </Typography>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 200,
                        color: "#0F172A",
                        fontSize: "13px",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.3,
                      }}
                    >
                      Ejercicio {index + 1}
                    </Typography>
                    {syncCount > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          background: "#DCFCE7",
                          color: "#166534",
                          borderRadius: 4,
                          padding: "1px 6px",
                        }}
                      >
                        Canvas ✓
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Acciones */}
            {!editandoNombre && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Tooltip
                  title={`Canvas: ${ayudantia.published_canvas ? "publicado" : "oculto"}`}
                >
                  <span>
                    {togglingCanvas ? (
                      <CircularProgress
                        size={14}
                        sx={{ color: "#2563EB", mx: 0.5 }}
                      />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={handleToggleCanvas}
                        sx={
                          ayudantia.published_canvas
                            ? iconBtnActiveSx
                            : iconBtnSx
                        }
                      >
                        <SchoolIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </span>
                </Tooltip>
                <Tooltip
                  title={`Plataforma: ${ayudantia.published_api ? "publicado" : "oculto"}`}
                >
                  <span>
                    {togglingApi ? (
                      <CircularProgress
                        size={14}
                        sx={{ color: "#2563EB", mx: 0.5 }}
                      />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={handleToggleApi}
                        sx={
                          ayudantia.published_api ? iconBtnActiveSx : iconBtnSx
                        }
                      >
                        {ayudantia.published_api ? (
                          <PublicIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <PublicOffIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    )}
                  </span>
                </Tooltip>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  sx={iconBtnSx}
                >
                  <MoreHorizIcon sx={{ fontSize: 15 }} />
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
                        minWidth: 150,
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
                      setEditandoNombre(true);
                    }}
                    sx={{ gap: 1.5, py: 1, "&:hover": { bgcolor: "#F8FAFC" } }}
                  >
                    <ListItemIcon>
                      <EditOutlinedIcon
                        sx={{ fontSize: 15, color: "#2563EB" }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: "#334155" }}>
                      Editar nombre
                    </Typography>
                  </MenuItem>
                  <Divider sx={{ borderColor: "#F1F5F9", my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      setModalEliminar(true);
                    }}
                    sx={{ gap: 1.5, py: 1, "&:hover": { bgcolor: "#FFF5F5" } }}
                  >
                    <ListItemIcon>
                      <DeleteOutlineIcon
                        sx={{ fontSize: 15, color: "#EF4444" }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: "#EF4444" }}>
                      Eliminar
                    </Typography>
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>

          {/* ── Enunciado preview ── */}
          <div
            style={{
              borderTop: "0.5px solid #F1F5F9",
              padding: "10px 14px",
              background: "#FAFAFA",
            }}
          >
            {ayudantia.enunciado ? (
              <div
                style={{
                  fontSize: 13,
                  color: "#475569",
                  lineHeight: 1.6,
                  marginBottom: 6,
                  maxHeight: 60,
                  overflow: "hidden",
                }}
              >
                <TiptapRenderer>{ayudantia.enunciado}</TiptapRenderer>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#CBD5E1", marginBottom: 6 }}>
                Sin enunciado
              </p>
            )}
            <button
              onClick={() => setModalEnunciado(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#94A3B8",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#2563EB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
              }}
            >
              <EditNoteIcon sx={{ fontSize: 14 }} />
              {ayudantia.enunciado ? "Editar enunciado" : "Agregar enunciado"}
            </button>
          </div>
        </CardContent>

        {/* ── Recursos ── */}
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            padding: "8px 14px",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <RecursoSlot
            exists={!!solucion}
            label="Solución"
            icon={<DescriptionIcon sx={{ fontSize: 13 }} />}
            iconColor="#0D9488"
            onVer={() => setModalSolucion(true)}
            onEditar={() => setModalSolucion(true)}
            onEliminar={() =>
              solucion &&
              dispatch(eliminarSolucionTexto({ solucion_id: solucion._id }))
            }
            onCrear={() => setModalSolucion(true)}
          />
          <RecursoSlot
            exists={!!video}
            label="Video"
            icon={<PlayCircleIcon sx={{ fontSize: 13 }} />}
            iconColor="#EF4444"
            onVer={() => setModalVideo(true)}
            onEditar={() => setModalVideo(true)}
            onEliminar={() =>
              video && dispatch(eliminarVideo({ video_id: video._id }))
            }
            onCrear={() => setModalVideo(true)}
          />
          <RecursoSlot
            exists={!!quiz}
            label="Quiz"
            icon={<QuizIcon sx={{ fontSize: 13 }} />}
            iconColor="#2563EB"
            onVer={() =>
              quiz &&
              navigate(
                `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia._id}/quiz/${quiz._id}`,
              )
            }
            onEditar={() => setModalQuiz(true)}
            onEliminar={() =>
              quiz && dispatch(eliminarQuiz({ quiz_id: quiz._id }))
            }
            onCrear={() => setModalQuiz(true)}
          />
        </div>
      </Card>

      {/* ── Modales ── */}
      {modalEliminar && (
        <ModalEliminarAyudantia
          ayudantia={ayudantia}
          onClose={() => setModalEliminar(false)}
        />
      )}
      {modalEnunciado && (
        <ModalEnunciado
          ayudantia={ayudantia}
          onClose={() => setModalEnunciado(false)}
        />
      )}

      {modalSolucion && (
        <ModalSolucionTexto
          ayudantia_id={ayudantia._id}
          solucion={solucion}
          onClose={() => setModalSolucion(false)}
        />
      )}

      {modalVideo && (
        <ModalUrlVideo
          contexto="ayudantia"
          ayudantia_id={ayudantia._id}
          capitulo_id={capitulo_id}
          curso_id={curso_id}
          titulo={`Video · ${ayudantia.nombre}`}
          video={video}
          onClose={() => setModalVideo(false)}
        />
      )}

      {modalQuiz && (
        <ModalCrearQuiz
          contexto="ayudantia"
          ayudantia_id={ayudantia._id}
          capitulo_id={capitulo_id}
          curso_id={curso_id}
          quiz={quiz}
          onClose={() => setModalQuiz(false)}
          onCreado={handleQuizCreado}
        />
      )}
    </>
  );
};

export default AyudantiaCard;
