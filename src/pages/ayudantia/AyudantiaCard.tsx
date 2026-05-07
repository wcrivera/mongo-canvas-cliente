// src/pages/ayudantia/AyudantiaCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography, IconButton, Tooltip, TextField,
  Button, CircularProgress, Switch, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import DescriptionIcon       from "@mui/icons-material/Description";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import QuizIcon              from "@mui/icons-material/Quiz";
import WarningAmberIcon      from "@mui/icons-material/WarningAmber";
import SchoolIcon            from "@mui/icons-material/School";
import PublicIcon            from "@mui/icons-material/Public";
import { useNavigate }       from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  editarAyudantia,
  eliminarAyudantia,
  cambiarPositionAyudantia,
} from "../../store/slices/ayudantia";
import type { IAyudantia } from "../../store/slices/ayudantia";
import type { IQuiz } from "../../store/slices/quiz";
import MathTextEditor     from "../../components/CKEditor/MathTextEditor";
import ModalSolucionTexto from "./components/ModalSolucionTexto";
import ModalUrlVideo      from "../clases/ModalUrlVideo";
import ModalCrearQuiz     from "../clases/ModalCrearQuiz";
import TiptapRenderer     from "../../components/CKEditor/TiptapRenderer";

interface Props {
  ayudantia:   IAyudantia;
  curso_id:    string;
  capitulo_id: string;
  esPrimero:   boolean;
  esUltimo:    boolean;
}

// ─── Modal enunciado ──────────────────────────────────────────────────────────

const ModalEnunciado = ({ ayudantia, onClose }: { ayudantia: IAyudantia; onClose: () => void }) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector((s) => s.mongoCurso.cursoActivo?.codigo ?? "");
  const [enunciado, setEnunciado] = useState(ayudantia.enunciado);
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarAyudantia({ ayudantia_id: ayudantia._id, enunciado }));
    setGuardando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#4A6D8C", color: "white", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <EditOutlinedIcon /><span>Enunciado — {ayudantia.nombre}</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <MathTextEditor initialData={enunciado} onChange={setEnunciado} siglaCurso={siglaCurso} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="text" sx={{ color: "#6793ba", borderRadius: 2 }}>Cancelar</Button>
        <Button onClick={handleGuardar} variant="contained" disabled={guardando}
          startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Modal eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({ ayudantia, onClose }: { ayudantia: IAyudantia; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarAyudantia({ ayudantia_id: ayudantia._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#fef2f2", color: "#991b1b", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <WarningAmberIcon /><span>Eliminar ayudantía</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Eliminar <strong>{ayudantia.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Se eliminarán todos los recursos asociados. Esta acción no se puede deshacer.
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

// ─── Card principal ───────────────────────────────────────────────────────────

const AyudantiaCard = ({ ayudantia, curso_id, capitulo_id, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Recursos desde el store — buscados directamente por ayudantia_id
  const { soluciones } = useAppSelector((s) => s.solucionTextoMongo);
  const { videos }     = useAppSelector((s) => s.videoMongo);
  const { quizzes }    = useAppSelector((s) => s.quizMongo);

  const solucion = soluciones.find((s) => s.ayudantia_id === ayudantia._id);
  const video    = videos.find((v) => v.ayudantia_id === ayudantia._id && v.contexto === "ayudantia");
  const quiz     = quizzes.find((q) => q.ayudantia_id === ayudantia._id && q.contexto === "ayudantia") as IQuiz | undefined;

  // ── Estado local ──────────────────────────────────────────────────────────
  const [modalEliminar,  setModalEliminar]  = useState(false);
  const [modalEnunciado, setModalEnunciado] = useState(false);
  const [modalSolucion,  setModalSolucion]  = useState(false);
  const [modalVideo,     setModalVideo]     = useState(false);
  const [modalQuiz,      setModalQuiz]      = useState(false);

  const [editandoNombre,  setEditandoNombre]  = useState(false);
  const [nombre,          setNombre]          = useState(ayudantia.nombre);
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [togglingCanvas,  setTogglingCanvas]  = useState(false);
  const [togglingApi,     setTogglingApi]     = useState(false);
  const [moviendo,        setMoviendo]        = useState(false);

  // ── Handlers nombre ───────────────────────────────────────────────────────

  const handleAbrirNombre    = () => { setNombre(ayudantia.nombre); setEditandoNombre(true); };
  const handleCancelarNombre = () => { setNombre(ayudantia.nombre); setEditandoNombre(false); };

  const handleGuardarNombre = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === ayudantia.nombre) { setEditandoNombre(false); return; }
    setGuardandoNombre(true);
    await dispatch(editarAyudantia({ ayudantia_id: ayudantia._id, nombre: nombreTrim }));
    setGuardandoNombre(false);
    setEditandoNombre(false);
  };

  const handleKeyDownNombre = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleGuardarNombre();
    if (e.key === "Escape") handleCancelarNombre();
  };

  // ── Handlers published ────────────────────────────────────────────────────

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(editarAyudantia({ ayudantia_id: ayudantia._id, published_canvas: !ayudantia.published_canvas }));
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(editarAyudantia({ ayudantia_id: ayudantia._id, published_api: !ayudantia.published_api }));
    setTogglingApi(false);
  };

  // ── Handler posición ──────────────────────────────────────────────────────

  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionAyudantia({ ayudantia_id: ayudantia._id, direction }));
    setMoviendo(false);
  };

  // ── Handler quiz ──────────────────────────────────────────────────────────

  const handleQuizCreado = (quizData: IQuiz) => {
    setModalQuiz(false);
    navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia._id}/quiz/${quizData._id}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Card elevation={0} className="animate-fadeIn"
        sx={{ borderRadius: 3, border: "1px solid #d9e4ee", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" } }}>
        <CardContent sx={{ p: 0 }}>

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 38, height: 38, borderRadius: "50%", background: "#6793ba", color: "white", fontSize: 13, fontWeight: 600 }}>
              {ayudantia.position}
            </div>

            <div className="flex-1 min-w-0">
              {editandoNombre ? (
                <div className="flex items-center gap-1">
                  <TextField value={nombre} onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={handleKeyDownNombre} size="small" autoFocus fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem" } }} />
                  <Tooltip title="Guardar (Enter)"><span>
                    <IconButton size="small" onClick={handleGuardarNombre} disabled={guardandoNombre} sx={{ color: "#4A6D8C" }}>
                      {guardandoNombre ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Cancelar (Esc)">
                    <IconButton size="small" onClick={handleCancelarNombre} sx={{ color: "#8daecb" }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              ) : (
                <>
                  <Typography variant="caption" sx={{ color: "#a0a0a0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Ayudantía {ayudantia.position}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1f2c38", fontWeight: 600, mt: 0.3 }} noWrap>
                    {ayudantia.nombre}
                  </Typography>
                </>
              )}
            </div>

            {!editandoNombre && (
              <div className="flex items-center gap-0.5 shrink-0">

                {/* Toggle Canvas */}
                <Tooltip title={`Canvas: ${ayudantia.published_canvas ? "publicada" : "oculta"}`}>
                  <span className="flex items-center gap-0.5">
                    <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                    {togglingCanvas
                      ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                      : <Switch size="small" checked={ayudantia.published_canvas} onChange={handleToggleCanvas}
                          disabled={moviendo || togglingApi}
                          sx={{ "& .MuiSwitch-thumb": { bgcolor: ayudantia.published_canvas ? "#4A6D8C" : "#ccc" }, "& .MuiSwitch-track": { bgcolor: ayudantia.published_canvas ? "#6793ba !important" : "#d9e4ee !important" } }} />
                    }
                  </span>
                </Tooltip>

                {/* Toggle API */}
                <Tooltip title={`Plataforma: ${ayudantia.published_api ? "publicada" : "oculta"}`}>
                  <span className="flex items-center gap-0.5">
                    <PublicIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                    {togglingApi
                      ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                      : <Switch size="small" checked={ayudantia.published_api} onChange={handleToggleApi}
                          disabled={moviendo || togglingCanvas}
                          sx={{ "& .MuiSwitch-thumb": { bgcolor: ayudantia.published_api ? "#4A6D8C" : "#ccc" }, "& .MuiSwitch-track": { bgcolor: ayudantia.published_api ? "#6793ba !important" : "#d9e4ee !important" } }} />
                    }
                  </span>
                </Tooltip>

                <Tooltip title="Mover arriba"><span>
                  <IconButton size="small" disabled={esPrimero || moviendo} onClick={() => handleMover("up")}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" }, "&:disabled": { color: "#d9e4ee" } }}>
                    {moviendo ? <CircularProgress size={14} sx={{ color: "#8daecb" }} /> : <KeyboardArrowUpIcon fontSize="small" />}
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Mover abajo"><span>
                  <IconButton size="small" disabled={esUltimo || moviendo} onClick={() => handleMover("down")}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" }, "&:disabled": { color: "#d9e4ee" } }}>
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Editar nombre">
                  <IconButton size="small" onClick={handleAbrirNombre} disabled={moviendo}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar ayudantía">
                  <IconButton size="small" onClick={() => setModalEliminar(true)} disabled={moviendo}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>

          <Divider sx={{ borderColor: "#f0f0f0" }} />

          {/* ── Enunciado preview ── */}
          <div className="px-5 py-4">
            <div className="text-sm text-gray-700 leading-relaxed mb-2">
              <TiptapRenderer>{ayudantia.enunciado}</TiptapRenderer>
            </div>
            <button onClick={() => setModalEnunciado(true)}
              className="text-xs text-[#8daecb] hover:text-[#4A6D8C] transition-colors flex items-center gap-1">
              <EditOutlinedIcon sx={{ fontSize: 12 }} />
              {ayudantia.enunciado ? "Editar enunciado" : "Agregar enunciado"}
            </button>
          </div>

          <Divider sx={{ borderColor: "#f0f0f0" }} />

          {/* ── Recursos ── */}
          <div className="px-5 py-3 flex items-center gap-4 flex-wrap">

            {/* Solución */}
            <div className="flex items-center gap-2">
              <div style={{ width: 30, height: 30, borderRadius: 6, background: solucion ? "#4A6D8C" : "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DescriptionIcon sx={{ fontSize: 16, color: solucion ? "white" : "#8daecb" }} />
              </div>
              <Button size="small" onClick={() => setModalSolucion(true)}
                sx={{ fontSize: "0.7rem", color: solucion ? "#4A6D8C" : "#8daecb", p: "2px 6px", "&:hover": { bgcolor: "#f0f4f8" } }}>
                {solucion ? "Editar solución" : "+ Solución"}
              </Button>
            </div>

            {/* Video */}
            <div className="flex items-center gap-2">
              <div style={{ width: 30, height: 30, borderRadius: 6, background: video ? "#e67e22" : "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlayCircleOutlineIcon sx={{ fontSize: 16, color: video ? "white" : "#8daecb" }} />
              </div>
              <Button size="small" onClick={() => setModalVideo(true)}
                sx={{ fontSize: "0.7rem", color: video ? "#e67e22" : "#8daecb", p: "2px 6px", "&:hover": { bgcolor: "#f0f4f8" } }}>
                {video ? "Editar video" : "+ Video"}
              </Button>
            </div>

            {/* Quiz */}
            <div className="flex items-center gap-2">
              <div style={{ width: 30, height: 30, borderRadius: 6, background: quiz ? "#2d5be3" : "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QuizIcon sx={{ fontSize: 16, color: quiz ? "white" : "#8daecb" }} />
              </div>
              <Button size="small"
                onClick={() => quiz
                  ? navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia._id}/quiz/${quiz._id}`)
                  : setModalQuiz(true)
                }
                sx={{ fontSize: "0.7rem", color: quiz ? "#2d5be3" : "#8daecb", p: "2px 6px", "&:hover": { bgcolor: "#f0f4f8" } }}>
                {quiz ? "Editar preguntas" : "+ Quiz"}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ── Modales ── */}
      {modalEnunciado && <ModalEnunciado ayudantia={ayudantia} onClose={() => setModalEnunciado(false)} />}
      {modalEliminar  && <ModalEliminar  ayudantia={ayudantia} onClose={() => setModalEliminar(false)} />}
      {modalSolucion  && (
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
          onClose={() => setModalQuiz(false)}
          onCreado={handleQuizCreado}
        />
      )}
    </>
  );
};

export default AyudantiaCard;