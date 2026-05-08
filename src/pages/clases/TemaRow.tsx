// src/pages/clases/TemaRow.tsx
import { useState } from "react";
import {
  Typography, IconButton, Tooltip, TextField, Button,
  CircularProgress, Switch, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import AddIcon               from "@mui/icons-material/Add";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import WarningAmberIcon      from "@mui/icons-material/WarningAmber";
import SchoolIcon            from "@mui/icons-material/School";
import PublicIcon            from "@mui/icons-material/Public";
import SlideshowIcon         from "@mui/icons-material/Slideshow";
import VideoLibraryIcon      from "@mui/icons-material/VideoLibrary";
import QuizIcon              from "@mui/icons-material/Quiz";
import { useNavigate }       from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { editarTema, eliminarTema, cambiarPositionTema } from "../../store/slices/tema";
import type { ITema } from "../../store/slices/tema";
import type { IQuiz } from "../../store/slices/quiz";
import LatexRenderer          from "../../components/LaTeX/LatexRenderer";
import { crearDiapositiva }    from "../../store/slices/diapositiva";
import ModalElegirDiapositiva from "./components/ModalElegirDiapositiva";
import ModalUrlDiapositiva    from "./components/ModalUrlDiapositiva";
import ModalUrlVideo          from "./components/ModalUrlVideo";
import ModalCrearQuiz         from "./components/ModalCrearQuiz";

// ─── Modal eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({ tema, onClose }: { tema: ITema; onClose: () => void }) => {
  const dispatch    = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarTema({ tema_id: tema._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#fef2f2", color: "#991b1b", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <WarningAmberIcon /><span>Eliminar tema</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Eliminar el tema <strong>{tema.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Se eliminarán todas las diapositivas, videos y quizzes asociados. Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>Cancelar</Button>
        <Button onClick={handleEliminar} variant="contained" disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: "#dc2626", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" } }}>
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── TemaRow principal ────────────────────────────────────────────────────────

interface Props {
  tema:      ITema;
  esPrimero: boolean;
  esUltimo:  boolean;
}

const TemaRow = ({ tema, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Recursos del tema desde el store
  const { diapositivas } = useAppSelector((s) => s.diapositivaMongo);
  const { videos }       = useAppSelector((s) => s.videoMongo);
  const quizzesSafe      = useAppSelector((s) => Array.isArray(s.quizMongo.quizzes) ? s.quizMongo.quizzes : []);

  const diapoTema  = diapositivas.find((d) => d.tema_id === tema._id && d.contexto === "clase");
  const videoTema  = videos.find((v) => v.tema_id === tema._id && v.contexto === "clase");
  const quizTema   = quizzesSafe.find((q) => q.tema_id === tema._id && q.contexto === "clase") as IQuiz | undefined;

  // ── Estado local ──────────────────────────────────────────────────────────
  const [editando,        setEditando]        = useState(false);
  const [nombre,          setNombre]          = useState(tema.nombre);
  const [guardando,       setGuardando]       = useState(false);
  const [togglingCanvas,  setTogglingCanvas]  = useState(false);
  const [togglingApi,     setTogglingApi]     = useState(false);
  const [moviendo,        setMoviendo]        = useState(false);
  const [modalEliminar,   setModalEliminar]   = useState(false);

  // Modales de recursos
  const [modalElegir, setModalElegir] = useState(false);
  const [modalUrl,    setModalUrl]    = useState(false);
  const [modalVideo,  setModalVideo]  = useState(false);
  const [modalQuiz,   setModalQuiz]   = useState(false);

  // Estado Canvas
  const totalCount   = tema.canvas_deployments.length;
  const syncCount    = tema.canvas_deployments.filter((d) => d.status === "synced").length;
  const tieneErrores = tema.canvas_deployments.some((d) => d.status === "error" || d.status === "missing");
  const tienePending = tema.canvas_deployments.some((d) => d.status === "pending");

  // ── Handlers nombre ───────────────────────────────────────────────────────

  const handleAbrirEdicion = () => { setNombre(tema.nombre); setEditando(true); };
  const handleCancelar     = () => { setNombre(tema.nombre); setEditando(false); };

  const handleGuardar = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === tema.nombre) { setEditando(false); return; }
    setGuardando(true);
    await dispatch(editarTema({ tema_id: tema._id, nombre: nombreTrim }));
    setGuardando(false);
    setEditando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleGuardar();
    if (e.key === "Escape") handleCancelar();
  };

  // ── Handlers published ────────────────────────────────────────────────────

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(editarTema({ tema_id: tema._id, published_canvas: !tema.published_canvas }));
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(editarTema({ tema_id: tema._id, published_api: !tema.published_api }));
    setTogglingApi(false);
  };

  // ── Handlers posición ─────────────────────────────────────────────────────

  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionTema({ tema_id: tema._id, direction }));
    setMoviendo(false);
  };

  // ── Handlers recursos ─────────────────────────────────────────────────────

  const handleElegirUrl    = () => { setModalElegir(false); setModalUrl(true); };
  const handleElegirEditor = async () => {
    setModalElegir(false);
    if (diapoTema) {
      // Ya existe — navegar directo al editor
      navigate(`/cursos/${tema.curso_id}/capitulos/${tema.capitulo_id}/clases/${tema.clase_id}/diapositiva/${diapoTema._id}`);
    } else {
      // No existe — crear primero en Mongo con url vacía, luego navegar
      const resultado = await dispatch(crearDiapositiva({
        contexto:    "clase",
        tema_id:     tema._id,
        capitulo_id: tema.capitulo_id,
        curso_id:    tema.curso_id,
        titulo:      `Diapositiva · ${tema.nombre}`,
        url:         "",
      })) as unknown as { ok: boolean; data?: { _id: string } };

      if (resultado.ok && resultado.data) {
        navigate(`/cursos/${tema.curso_id}/capitulos/${tema.capitulo_id}/clases/${tema.clase_id}/diapositiva/${resultado.data._id}`);
      }
    }
  };

  const handleQuizCreado = (quiz: IQuiz) => {
    setModalQuiz(false);
    navigate(`/cursos/${tema.curso_id}/capitulos/${tema.capitulo_id}/clases/${tema.clase_id}/quiz/${quiz._id}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="animate-fadeIn"
        style={{
          background: tieneErrores ? "#fff5f5" : tienePending ? "#fffdf0" : "#fafcff",
          borderRadius: 8,
          border: tieneErrores ? "1px solid #fecaca" : tienePending ? "1px solid #fde68a" : "1px solid #e8f0f8",
          marginBottom: 4,
        }}
      >
        {/* ── Fila principal ── */}
        <div className="flex items-center gap-2 px-3 py-2">

          {/* Nombre */}
          <div className="flex-1 min-w-0">
            {editando ? (
              <div className="flex items-center gap-1">
                <TextField
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={handleKeyDown}
                  size="small"
                  autoFocus
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.8rem", bgcolor: "white" } }}
                />
                <Tooltip title="Guardar (Enter)"><span>
                  <IconButton size="small" onClick={handleGuardar} disabled={guardando} sx={{ color: "#4A6D8C" }}>
                    {guardando ? <CircularProgress size={12} /> : <CheckIcon sx={{ fontSize: 14 }} />}
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Cancelar (Esc)">
                  <IconButton size="small" onClick={handleCancelar} sx={{ color: "#8daecb" }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Typography variant="caption" sx={{ color: "#3c5770", fontWeight: 600 }}>
                  <LatexRenderer>{tema.nombre}</LatexRenderer>
                </Typography>
                {totalCount > 0 && (
                  <Chip label={`Canvas ${syncCount}/${totalCount}`} size="small" sx={{
                    height: 15, fontSize: "0.58rem",
                    bgcolor: tieneErrores ? "#fee2e2" : tienePending ? "#fef9c3" : "#d1fae5",
                    color:   tieneErrores ? "#991b1b" : tienePending ? "#854d0e" : "#065f46",
                  }} />
                )}
              </div>
            )}
          </div>

          {/* Controles */}
          {!editando && (
            <div className="flex items-center shrink-0" style={{ gap: 1 }}>

              {/* Toggle Canvas */}
              <Tooltip title={`Canvas: ${tema.published_canvas ? "publicado" : "oculto"}`}>
                <span className="flex items-center gap-0.5">
                  <SchoolIcon sx={{ fontSize: 12, color: "#8daecb" }} />
                  {togglingCanvas
                    ? <CircularProgress size={14} sx={{ color: "#4A6D8C", mx: 0.5 }} />
                    : (
                      <Switch size="small" checked={tema.published_canvas} onChange={handleToggleCanvas}
                        disabled={moviendo || togglingApi}
                        sx={{ transform: "scale(0.75)",
                          "& .MuiSwitch-thumb": { bgcolor: tema.published_canvas ? "#4A6D8C" : "#ccc" },
                          "& .MuiSwitch-track": { bgcolor: tema.published_canvas ? "#6793ba !important" : "#d9e4ee !important" },
                        }} />
                    )
                  }
                </span>
              </Tooltip>

              {/* Toggle API */}
              <Tooltip title={`Plataforma: ${tema.published_api ? "publicado" : "oculto"}`}>
                <span className="flex items-center gap-0.5">
                  <PublicIcon sx={{ fontSize: 12, color: "#8daecb" }} />
                  {togglingApi
                    ? <CircularProgress size={14} sx={{ color: "#4A6D8C", mx: 0.5 }} />
                    : (
                      <Switch size="small" checked={tema.published_api} onChange={handleToggleApi}
                        disabled={moviendo || togglingCanvas}
                        sx={{ transform: "scale(0.75)",
                          "& .MuiSwitch-thumb": { bgcolor: tema.published_api ? "#4A6D8C" : "#ccc" },
                          "& .MuiSwitch-track": { bgcolor: tema.published_api ? "#6793ba !important" : "#d9e4ee !important" },
                        }} />
                    )
                  }
                </span>
              </Tooltip>

              {/* Mover */}
              <Tooltip title="Mover arriba"><span>
                <IconButton size="small" disabled={esPrimero || moviendo} onClick={() => handleMover("up")}
                  sx={{ color: "#8daecb", p: 0.25, "&:hover": { color: "#4A6D8C" }, "&:disabled": { color: "#d9e4ee" } }}>
                  {moviendo ? <CircularProgress size={12} sx={{ color: "#8daecb" }} /> : <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Mover abajo"><span>
                <IconButton size="small" disabled={esUltimo || moviendo} onClick={() => handleMover("down")}
                  sx={{ color: "#8daecb", p: 0.25, "&:hover": { color: "#4A6D8C" }, "&:disabled": { color: "#d9e4ee" } }}>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span></Tooltip>

              {/* Editar nombre */}
              <Tooltip title="Editar nombre">
                <IconButton size="small" onClick={handleAbrirEdicion} disabled={moviendo}
                  sx={{ color: "#8daecb", p: 0.25, "&:hover": { color: "#4A6D8C" } }}>
                  <EditOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>

              {/* Eliminar */}
              <Tooltip title="Eliminar tema">
                <IconButton size="small" onClick={() => setModalEliminar(true)} disabled={moviendo}
                  sx={{ color: "#8daecb", p: 0.25, "&:hover": { color: "#ef4444" } }}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>

            </div>
          )}
        </div>

        {/* ── Recursos del tema ── */}
        <div className="px-3 pb-2 flex items-center gap-2 flex-wrap">

          {/* Diapositiva */}
          {diapoTema ? (
            <Tooltip title={diapoTema.url ? "Editar URL" : "Editar en editor"}>
              <Button size="small" startIcon={<SlideshowIcon />}
                onClick={() => {
                  if (diapoTema.url && !diapoTema.slides?.length) {
                    // Modo URL — abrir modal de edición de URL
                    setModalUrl(true);
                  } else {
                    // Modo editor — navegar al editor
                    navigate(`/cursos/${tema.curso_id}/capitulos/${tema.capitulo_id}/clases/${tema.clase_id}/diapositiva/${diapoTema._id}`);
                  }
                }}
                sx={{ color: "#f47c3c", fontSize: "0.65rem", py: 0.25, px: 1, "&:hover": { bgcolor: "#fff3ed" } }}>
                Diapositiva
              </Button>
            </Tooltip>
          ) : (
            <Button size="small" startIcon={<AddIcon />}
              onClick={() => setModalElegir(true)}
              sx={{ color: "#8daecb", fontSize: "0.65rem", py: 0.25, px: 1, "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
              Diapositiva
            </Button>
          )}

          {/* Video */}
          {videoTema ? (
            <Tooltip title="Editar URL del video">
              <Button size="small" startIcon={<VideoLibraryIcon />}
                onClick={() => setModalVideo(true)}
                sx={{ color: "#e03030", fontSize: "0.65rem", py: 0.25, px: 1, "&:hover": { bgcolor: "#fff0f0" } }}>
                Video
              </Button>
            </Tooltip>
          ) : (
            <Button size="small" startIcon={<AddIcon />}
              onClick={() => setModalVideo(true)}
              sx={{ color: "#8daecb", fontSize: "0.65rem", py: 0.25, px: 1, "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
              Video
            </Button>
          )}

          {/* Quiz */}
          {quizTema ? (
            <div className="flex items-center gap-1">
              <Tooltip title="Editar configuración del quiz">
                <Button size="small" startIcon={<QuizIcon />}
                  onClick={() => setModalQuiz(true)}
                  sx={{ color: "#2d5be3", fontSize: "0.65rem", py: 0.25, px: 1, "&:hover": { bgcolor: "#f0f3ff" } }}>
                  Quiz
                </Button>
              </Tooltip>
              <Tooltip title="Ver preguntas">
                <Button size="small"
                  onClick={() => navigate(`/cursos/${tema.curso_id}/capitulos/${tema.capitulo_id}/clases/${tema.clase_id}/quiz/${quizTema._id}`)}
                  sx={{ color: "#8daecb", fontSize: "0.65rem", py: 0.25, px: 0.5, minWidth: 0, "&:hover": { color: "#2d5be3", bgcolor: "#f0f3ff" } }}>
                  →
                </Button>
              </Tooltip>
            </div>
          ) : (
            <Button size="small" startIcon={<AddIcon />}
              onClick={() => setModalQuiz(true)}
              sx={{ color: "#8daecb", fontSize: "0.65rem", py: 0.25, px: 1, "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
              Quiz
            </Button>
          )}

        </div>
      </div>

      {/* ── Modales ── */}
      {modalEliminar && <ModalEliminar tema={tema} onClose={() => setModalEliminar(false)} />}

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
          capitulo_id={tema.capitulo_id}
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
          capitulo_id={tema.capitulo_id}
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
          capitulo_id={tema.capitulo_id}
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