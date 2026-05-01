// src/pages/clases/TemaRow.tsx
import { useState } from "react";
import {
  Typography, IconButton, Tooltip,
  TextField, Button, CircularProgress,
  Switch, Chip,
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
import { useNavigate }       from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  editarTema,
  eliminarTema,
  cambiarPositionTema,
} from "../../store/slices/tema";
import { crearRecurso }              from "../../store/slices/recurso";
import type { ITema }                from "../../store/slices/tema";
import type { TipoRecurso, IRecurso } from "../../store/slices/recurso";
import type { IQuiz }                from "../../store/slices/quiz";
import RecursoItem            from "./RecursoItem";
import ModalElegirDiapositiva from "./ModalElegirDiapositiva";
import ModalUrlDiapositiva    from "./ModalUrlDiapositiva";
import ModalUrlVideo          from "./ModalUrlVideo";
import ModalCrearQuiz         from "./ModalCrearQuiz";
import LatexRenderer          from "../../components/LaTeX/LatexRenderer";

interface Props {
  tema:      ITema;
  esPrimero: boolean;
  esUltimo:  boolean;
}

// ─── Modal eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({
  tema,
  onClose,
}: {
  tema:    ITema;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
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
      <DialogTitle sx={{
        bgcolor: "#fef2f2", color: "#991b1b",
        display: "flex", alignItems: "center", gap: 1.5, py: 2,
      }}>
        <WarningAmberIcon />
        <span>Eliminar tema</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Eliminar el tema <strong>{tema.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Se eliminarán todos los recursos asociados (diapositivas, videos, quizzes).
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleEliminar}
          variant="contained"
          disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: "#dc2626", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" } }}
        >
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── TemaRow principal ────────────────────────────────────────────────────────

const TemaRow = ({ tema, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { recursos } = useAppSelector((s) => s.recursoMongo);

  const recursosTema = recursos
    .filter((r) => r.tema_id === tema._id)
    .sort((a, b) => a.position - b.position);

  // ── Estado local ───────────────────────────────────────────────────────────
  const [editando,      setEditando]      = useState(false);
  const [nombre,        setNombre]        = useState(tema.nombre);
  const [guardando,     setGuardando]     = useState(false);
  const [toggling,      setToggling]      = useState(false);
  const [moviendo,      setMoviendo]      = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [creando,       setCreando]       = useState(false);

  // Estado Canvas
  const totalCount   = tema.canvas_deployments.length;
  const syncCount    = tema.canvas_deployments.filter((d) => d.status === "synced").length;
  const tieneErrores = tema.canvas_deployments.some((d) => d.status === "error" || d.status === "missing");
  const tienePending = tema.canvas_deployments.some((d) => d.status === "pending");

  // Modales de recursos
  const [modalElegir, setModalElegir] = useState<{ abierto: boolean; recurso_id: string }>({ abierto: false, recurso_id: "" });
  const [modalUrl,    setModalUrl]    = useState<{ abierto: boolean; recurso_id: string }>({ abierto: false, recurso_id: "" });
  const [modalVideo,  setModalVideo]  = useState<{ abierto: boolean; recurso_id: string }>({ abierto: false, recurso_id: "" });
  const [modalQuiz,   setModalQuiz]   = useState<{ abierto: boolean; recurso_id: string }>({ abierto: false, recurso_id: "" });

  // ── Handlers nombre ────────────────────────────────────────────────────────

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

  // ── Handlers published ─────────────────────────────────────────────────────

  const handleTogglePublished = async () => {
    setToggling(true);
    await dispatch(editarTema({ tema_id: tema._id, published: !tema.published }));
    setToggling(false);
  };

  // ── Handlers posición ──────────────────────────────────────────────────────

  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionTema({ tema_id: tema._id, direction }));
    setMoviendo(false);
  };

  // ── Handlers recursos ──────────────────────────────────────────────────────

  const handleCrearRecurso = async (tipo: TipoRecurso) => {
    setCreando(true);
    const resultado = await dispatch(
      crearRecurso({
        contexto: "clase",
        tema_id:  tema._id,
        tipo,
        titulo:   `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} · ${tema.nombre}`,
      }),
    ) as unknown as { ok: boolean; data?: IRecurso };
    setCreando(false);

    if (!resultado.ok || !resultado.data) return;
    const recurso_id = resultado.data._id;

    if (tipo === "diapositiva") {
      setModalElegir({ abierto: true, recurso_id });
    } else if (tipo === "video") {
      setModalVideo({ abierto: true, recurso_id });
    } else if (tipo === "quiz") {
      setModalQuiz({ abierto: true, recurso_id });
    }
  };

  // Al elegir "URL externa" desde el modal de elección
  const handleElegirUrl = () => {
    const recurso_id = modalElegir.recurso_id;
    setModalElegir({ abierto: false, recurso_id: "" });
    setModalUrl({ abierto: true, recurso_id });
  };

  // Al elegir "Crear con editor" — navegar al editor de diapositivas
  const handleElegirEditor = () => {
    const recurso_id = modalElegir.recurso_id;
    setModalElegir({ abierto: false, recurso_id: "" });
    const recurso = recursos.find((r) => r._id === recurso_id);
    if (!recurso) return;
    navigate(
      `/cursos/${recurso.curso_id}/capitulos/${recurso.capitulo_id}/clases/${recurso.clase_id}/diapositiva/${recurso_id}`,
    );
  };

  const handleQuizCreado = (quiz: IQuiz) => {
    setModalQuiz({ abierto: false, recurso_id: "" });
    const recurso = recursosTema.find((r) => r._id === quiz.recurso_id?.toString());
    if (recurso) {
      const params = recurso?.clase_id
        ? `/cursos/${recurso.curso_id}/capitulos/${recurso.capitulo_id}/clases/${recurso.clase_id}/quiz/${recurso._id}`
        : "";
      if (params) navigate(params);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="rounded-xl border border-[#e8eef4] bg-[#f8fafc] animate-fadeIn"
        style={{ marginLeft: 8 }}
      >
        {/* ── Header del tema ── */}
        <div className="flex items-center gap-2 px-3 py-2">

          {/* Posición */}
          <span style={{ fontSize: 11, color: "#8daecb", fontWeight: 600, minWidth: 16 }}>
            {tema.position}
          </span>

          {/* Nombre o edición inline */}
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
                  <Chip
                    label={`Canvas ${syncCount}/${totalCount}`}
                    size="small"
                    sx={{
                      height: 15, fontSize: "0.58rem",
                      bgcolor: tieneErrores ? "#fee2e2" : tienePending ? "#fef9c3" : "#d1fae5",
                      color:   tieneErrores ? "#991b1b" : tienePending ? "#854d0e" : "#065f46",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Controles — ocultos durante edición ── */}
          {!editando && (
            <div className="flex items-center shrink-0" style={{ gap: 1 }}>

              {/* Switch published */}
              <Tooltip title={tema.published ? "Publicado — click para ocultar" : "Oculto — click para publicar"}>
                <span>
                  {toggling
                    ? <CircularProgress size={14} sx={{ color: "#4A6D8C", mx: 0.5 }} />
                    : (
                      <Switch
                        size="small"
                        checked={tema.published}
                        onChange={handleTogglePublished}
                        disabled={moviendo}
                        sx={{
                          transform: "scale(0.75)",
                          "& .MuiSwitch-thumb": { bgcolor: tema.published ? "#4A6D8C" : "#ccc" },
                          "& .MuiSwitch-track": { bgcolor: tema.published ? "#6793ba !important" : "#d9e4ee !important" },
                        }}
                      />
                    )
                  }
                </span>
              </Tooltip>

              {/* Flecha arriba */}
              <Tooltip title="Mover arriba"><span>
                <IconButton size="small" disabled={esPrimero || moviendo} onClick={() => handleMover("up")}
                  sx={{ color: "#8daecb", p: 0.25, "&:hover": { color: "#4A6D8C" }, "&:disabled": { color: "#d9e4ee" } }}>
                  {moviendo
                    ? <CircularProgress size={12} sx={{ color: "#8daecb" }} />
                    : <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </span></Tooltip>

              {/* Flecha abajo */}
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
        {recursosTema.length > 0 && (
          <div className="px-3 pb-2 flex flex-row flex-wrap gap-2">
            {recursosTema.map((recurso) => (
              <RecursoItem key={recurso._id} recurso={recurso} />
            ))}
          </div>
        )}

        {/* ── Agregar recurso ── */}
        <div className="px-3 pb-2 flex items-center gap-1 flex-wrap">
          {(["diapositiva", "video", "quiz"] as TipoRecurso[]).map((tipo) => {
            const yaExiste = recursosTema.some((r) => r.tipo === tipo);
            if (yaExiste) return null;
            return (
              <Button
                key={tipo}
                size="small"
                startIcon={creando ? <CircularProgress size={10} /> : <AddIcon />}
                disabled={creando || moviendo}
                onClick={() => handleCrearRecurso(tipo)}
                sx={{
                  color: "#8daecb", fontSize: "0.65rem", fontWeight: 500,
                  py: 0.25, px: 1,
                  "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                }}
              >
                {tipo}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── Modales ── */}
      {modalEliminar && (
        <ModalEliminar tema={tema} onClose={() => setModalEliminar(false)} />
      )}
      {modalElegir.abierto && (
        <ModalElegirDiapositiva
          onElegirUrl={handleElegirUrl}
          onElegirEditor={handleElegirEditor}
          onClose={() => setModalElegir({ abierto: false, recurso_id: "" })}
        />
      )}
      {modalUrl.abierto && (
        <ModalUrlDiapositiva
          recurso_id={modalUrl.recurso_id}
          onClose={() => setModalUrl({ abierto: false, recurso_id: "" })}
        />
      )}
      {modalVideo.abierto && (
        <ModalUrlVideo
          recurso_id={modalVideo.recurso_id}
          onClose={() => setModalVideo({ abierto: false, recurso_id: "" })}
        />
      )}
      {modalQuiz.abierto && (
        <ModalCrearQuiz
          recurso_id={modalQuiz.recurso_id}
          onClose={() => setModalQuiz({ abierto: false, recurso_id: "" })}
          onCreado={handleQuizCreado}
        />
      )}
    </>
  );
};

export default TemaRow;