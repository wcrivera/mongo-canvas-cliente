import { useState }        from "react";
import {
  Card, CardContent, Typography,
  IconButton, Tooltip, TextField,
  Button, CircularProgress,
  Switch, Divider, Chip,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import QuizIcon              from "@mui/icons-material/Quiz";
import RefreshIcon           from "@mui/icons-material/Refresh";

import { useAppDispatch }    from "../../store/hooks";
import {
  editarEjercicio,
  eliminarEjercicio,
  cambiarPositionEjercicio,
  reintentarEjercicio,
} from "../../store/slices/ejercicio";
import type { IEjercicio }   from "../../store/slices/ejercicio";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  ejercicio:  IEjercicio;
  esPrimero:  boolean;
  esUltimo:   boolean;
}

const TIPO_LABEL: Record<string, string> = {
  multiple_choice: 'Opción múltiple',
  true_false:      'Verdadero/Falso',
  short_answer:    'Respuesta corta',
  essay:           'Ensayo',
};

const EjercicioCard = ({ ejercicio, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [editando, setEditando]           = useState(false);
  const [guardando, setGuardando]         = useState(false);
  const [eliminando, setEliminando]       = useState(false);
  const [verDeploys, setVerDeploys]       = useState(false);
  const [previewEnunciado, setPreview]    = useState(false);
  const [form, setForm]                   = useState({
    nombre:    ejercicio.nombre,
    enunciado: ejercicio.enunciado,
    published: ejercicio.published,
  });

  const tieneErrores = ejercicio.canvas_deployments.some(
    d => d.status === 'error' || d.status === 'missing'
  );
  const tienePending = ejercicio.canvas_deployments.some(
    d => d.status === 'pending'
  );
  const syncCount  = ejercicio.canvas_deployments.filter(
    d => d.status === 'synced'
  ).length;
  const totalCount = ejercicio.canvas_deployments.length;

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarEjercicio({
      ejercicio_id: ejercicio._id,
      ...form,
    }));
    setGuardando(false);
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${ejercicio.nombre}"?`)) return;
    setEliminando(true);
    await dispatch(eliminarEjercicio({ ejercicio_id: ejercicio._id }));
    setEliminando(false);
  };

  const handleMoverArriba = () =>
    dispatch(cambiarPositionEjercicio({
      ejercicio_id: ejercicio._id, direction: 'up',
    }));

  const handleMoverAbajo = () =>
    dispatch(cambiarPositionEjercicio({
      ejercicio_id: ejercicio._id, direction: 'down',
    }));

  const handleReintentar = async (canvas_curso_id: number) => {
    await dispatch(reintentarEjercicio({
      ejercicio_id: ejercicio._id,
      canvas_curso_id,
    }));
  };

  return (
    <Card
      elevation={0}
      className="animate-fadeIn"
      sx={{
        borderRadius: 3,
        border: tieneErrores
          ? "1px solid #fca5a5"
          : tienePending
            ? "1px solid #fde68a"
            : "1px solid #d9e4ee",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
      }}
    >
      <CardContent sx={{ p: 0 }}>

        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div style={{
            width: 48, height: 48,
            borderRadius: "50%",
            background: "white",
            border: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 22,
          }}>
            ✏️
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Typography
                variant="caption"
                sx={{
                  color: "#a0a0a0",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Ejercicio {ejercicio.position}
              </Typography>
              <Chip
                label={TIPO_LABEL[ejercicio.tipo_pregunta]}
                size="small"
                sx={{
                  fontSize: "0.62rem",
                  height: 18,
                  bgcolor: "#f0f4f8",
                  color: "#4A6D8C",
                  fontWeight: 600,
                }}
              />
              {totalCount > 0 && (
                <Chip
                  label={
                    tieneErrores
                      ? "Error Canvas"
                      : tienePending
                        ? "Pendiente"
                        : `${syncCount}/${totalCount} sync`
                  }
                  size="small"
                  onClick={() => setVerDeploys(v => !v)}
                  sx={{
                    fontSize: "0.62rem",
                    height: 18,
                    cursor: "pointer",
                    fontWeight: 600,
                    bgcolor: tieneErrores
                      ? "#fee2e2"
                      : tienePending
                        ? "#fef9c3"
                        : "#d1fae5",
                    color: tieneErrores
                      ? "#991b1b"
                      : tienePending
                        ? "#854d0e"
                        : "#065f46",
                  }}
                />
              )}
            </div>
            <Typography
              variant="body2"
              sx={{ color: "#3d3d3d", fontWeight: 500, mt: 0.3 }}
              noWrap
            >
              {ejercicio.nombre}
            </Typography>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-0.5 shrink-0">
            {editando ? (
              <>
                <Tooltip title="Guardar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleGuardar}
                      disabled={guardando}
                      sx={{ color: "#4A6D8C" }}
                    >
                      {guardando
                        ? <CircularProgress size={14} />
                        : <CheckIcon fontSize="small" />
                      }
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditando(false);
                      setForm({
                        nombre:    ejercicio.nombre,
                        enunciado: ejercicio.enunciado,
                        published: ejercicio.published,
                      });
                    }}
                    sx={{ color: "#8daecb" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={ejercicio.published ? "Publicado" : "No publicado"}>
                  <Switch
                    size="small"
                    checked={ejercicio.published}
                    disabled
                    sx={{
                      "& .MuiSwitch-thumb": {
                        bgcolor: ejercicio.published ? "#4A6D8C" : "#ccc",
                      },
                    }}
                  />
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => setEditando(true)}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleEliminar}
                      disabled={eliminando}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
                    >
                      {eliminando
                        ? <CircularProgress size={14} />
                        : <DeleteOutlineIcon fontSize="small" />
                      }
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Subir">
                  <span>
                    <IconButton
                      size="small"
                      disabled={esPrimero}
                      onClick={handleMoverArriba}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                        "&:disabled": { color: "#d9e4ee" },
                      }}
                    >
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Bajar">
                  <span>
                    <IconButton
                      size="small"
                      disabled={esUltimo}
                      onClick={handleMoverAbajo}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                        "&:disabled": { color: "#d9e4ee" },
                      }}
                    >
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        <Divider sx={{ borderColor: "#f0f0f0" }} />

        {/* ── Enunciado / Edición ── */}
        <div className="px-5 py-4">
          {editando ? (
            <div className="flex flex-col gap-3">
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <div className="flex gap-2">
                {["Editar", "Preview"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPreview(tab === "Preview")}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 6,
                      border: "1px solid #d9e4ee",
                      background: (tab === "Preview") === previewEnunciado
                        ? "#4A6D8C" : "white",
                      color: (tab === "Preview") === previewEnunciado
                        ? "white" : "#4A6D8C",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {!previewEnunciado ? (
                <textarea
                  value={form.enunciado}
                  onChange={(e) => setForm(f => ({ ...f, enunciado: e.target.value }))}
                  placeholder="Enunciado con LaTeX..."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #d9e4ee",
                    fontSize: 13,
                    fontFamily: "monospace",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              ) : (
                <div style={{
                  minHeight: 80,
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid #d9e4ee",
                  fontSize: 14,
                  lineHeight: 1.8,
                  background: "#fafafa",
                }}>
                  <LatexRenderer>{form.enunciado}</LatexRenderer>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  size="small"
                  checked={form.published}
                  onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
                  sx={{ "& .MuiSwitch-thumb": { bgcolor: form.published ? "#4A6D8C" : "#ccc" } }}
                />
                <Typography variant="caption" sx={{ color: "#6793ba" }}>
                  {form.published ? "Publicado" : "No publicado"}
                </Typography>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setEditando(false)}
                  sx={{ color: "#6793ba", borderRadius: 2 }}
                >
                  Cancelar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleGuardar}
                  disabled={guardando}
                  startIcon={
                    guardando
                      ? <CircularProgress size={12} color="inherit" />
                      : <CheckIcon />
                  }
                  sx={{
                    bgcolor: "#4A6D8C",
                    borderRadius: 2,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
                  }}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#3d3d3d" }}>
              {ejercicio.enunciado
                ? <LatexRenderer>{ejercicio.enunciado}</LatexRenderer>
                : <span style={{ color: "#8daecb", fontStyle: "italic" }}>
                    Sin enunciado
                  </span>
              }
            </div>
          )}
        </div>

        {/* ── Opciones (solo múltiple opción y true/false) ── */}
        {!editando && (
          ejercicio.tipo_pregunta === 'multiple_choice' ||
          ejercicio.tipo_pregunta === 'true_false'
        ) && ejercicio.opciones.length > 0 && (
          <>
            <Divider sx={{ borderColor: "#f0f0f0" }} />
            <div className="px-5 py-3 flex flex-col gap-2">
              {ejercicio.opciones.map((op, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                    border: `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                  }}
                >
                  <div style={{
                    width: 12, height: 12,
                    borderRadius: "50%",
                    border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                    background: op.es_correcta ? "#1a9e5c" : "white",
                    flexShrink: 0,
                  }} />
                  <Typography
                    variant="caption"
                    sx={{ color: op.es_correcta ? "#065f46" : "#555", flex: 1 }}
                  >
                    <LatexRenderer>{op.texto}</LatexRenderer>
                  </Typography>
                  {op.es_correcta && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#1a9e5c", fontWeight: 600 }}
                    >
                      ✓
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Canvas deployments ── */}
        {verDeploys && (
          <div
            className="animate-slideDown"
            style={{ borderTop: "0.5px solid #d9e4ee" }}
          >
            <div className="px-5 py-3">
              <div className="flex items-center gap-1.5 mb-3">
                <QuizIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6793ba",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Estado en Canvas
                </Typography>
              </div>

              <div className="flex flex-col gap-2">
                {ejercicio.canvas_deployments.map((d) => (
                  <div key={d.canvas_curso_id} className="flex items-center gap-2">
                    <Chip
                      label={`${d.canvas_curso_id} · ${d.status}`}
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        height: 22,
                        bgcolor: d.status === 'synced'
                          ? "#d1fae5"
                          : d.status === 'error'
                            ? "#fee2e2"
                            : "#fef9c3",
                        color: d.status === 'synced'
                          ? "#065f46"
                          : d.status === 'error'
                            ? "#991b1b"
                            : "#854d0e",
                        fontWeight: 600,
                      }}
                    />
                    {(d.status === 'error' || d.status === 'pending') && (
                      <Tooltip title="Reintentar">
                        <IconButton
                          size="small"
                          onClick={() => handleReintentar(d.canvas_curso_id)}
                          sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" } }}
                        >
                          <RefreshIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default EjercicioCard;