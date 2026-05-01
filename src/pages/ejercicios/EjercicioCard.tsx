// src/pages/ejercicios/EjercicioCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography,
  IconButton, Tooltip, CircularProgress,
  Switch, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import QuizIcon              from "@mui/icons-material/Quiz";
import RefreshIcon           from "@mui/icons-material/Refresh";
import WarningAmberIcon      from "@mui/icons-material/WarningAmber";
import { useAppDispatch }    from "../../store/hooks";
import {
  editarEjercicio,
  eliminarEjercicio,
  cambiarPositionEjercicio,
  reintentarEjercicio,
} from "../../store/slices/ejercicio";
import type { IEjercicio } from "../../store/slices/ejercicio";
import { PreguntaViewer, PreguntaEditor } from "../../components/quiz";
import type {
  IOpcionEditor,
  IParEditor,
  IRespuestaNumEditor,
  TipoPreguntaEditor,
} from "../../components/quiz";

interface Props {
  ejercicio:  IEjercicio;
  esPrimero:  boolean;
  esUltimo:   boolean;
}

const TIPO_LABEL: Record<string, string> = {
  multiple_choice:  "Opción múltiple",
  multiple_answers: "Respuestas múltiples",
  true_false:       "Verdadero/Falso",
  short_answer:     "Respuesta corta",
  essay:            "Ensayo",
  matching:         "Coincidencia",
  numerical:        "Respuesta numérica",
};

const TIPO_COLOR: Record<string, string> = {
  multiple_choice:  "#4A6D8C",
  multiple_answers: "#2d5be3",
  true_false:       "#1a9e5c",
  short_answer:     "#f47c3c",
  essay:            "#9c27b0",
  matching:         "#e67e22",
  numerical:        "#e74c3c",
};

// ─── Modal eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({
  ejercicio,
  onClose,
}: {
  ejercicio: IEjercicio;
  onClose:   () => void;
}) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarEjercicio({ ejercicio_id: ejercicio._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#fef2f2", color: "#991b1b", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <WarningAmberIcon />
        <span>Eliminar ejercicio</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1 }}>
          ¿Eliminar <strong>{ejercicio.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Esta acción no se puede deshacer. El ejercicio también se eliminará de Canvas.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
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

const EjercicioCard = ({ ejercicio, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [editando,      setEditando]      = useState(false);
  const [guardando,     setGuardando]     = useState(false);
  const [moviendo,      setMoviendo]      = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [verDeploys,    setVerDeploys]    = useState(false);

  // Estado del editor
  const [enunciado, setEnunciado] = useState(ejercicio.enunciado);
  const [puntos,    setPuntos]    = useState(ejercicio.puntos ?? 1);
  const [opciones,  setOpciones]  = useState<IOpcionEditor[]>(
    ejercicio.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
  );
  const [pares, setPares] = useState<IParEditor[]>(
    (ejercicio.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })),
  );
  const [respNum, setRespNum] = useState<IRespuestaNumEditor>({
    tipo:      ejercicio.respuesta_numerica?.tipo      ?? "exact",
    exacto:    ejercicio.respuesta_numerica?.exacto    ?? 0,
    margen:    ejercicio.respuesta_numerica?.margen    ?? 0,
    minimo:    ejercicio.respuesta_numerica?.minimo    ?? 0,
    maximo:    ejercicio.respuesta_numerica?.maximo    ?? 10,
    precision: ejercicio.respuesta_numerica?.precision ?? 2,
  });

  const tieneErrores = ejercicio.canvas_deployments.some((d) => d.status === "error" || d.status === "missing");
  const tienePending = ejercicio.canvas_deployments.some((d) => d.status === "pending");
  const syncCount    = ejercicio.canvas_deployments.filter((d) => d.status === "synced").length;
  const totalCount   = ejercicio.canvas_deployments.length;

  const handleAbrirEdicion = () => {
    setEnunciado(ejercicio.enunciado);
    setPuntos(ejercicio.puntos ?? 1);
    setOpciones(ejercicio.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })));
    setPares((ejercicio.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })));
    setRespNum({
      tipo:      ejercicio.respuesta_numerica?.tipo      ?? "exact",
      exacto:    ejercicio.respuesta_numerica?.exacto    ?? 0,
      margen:    ejercicio.respuesta_numerica?.margen    ?? 0,
      minimo:    ejercicio.respuesta_numerica?.minimo    ?? 0,
      maximo:    ejercicio.respuesta_numerica?.maximo    ?? 10,
      precision: ejercicio.respuesta_numerica?.precision ?? 2,
    });
    setEditando(true);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarEjercicio({
      ejercicio_id: ejercicio._id,
      enunciado,
      published: ejercicio.published,
      opciones,
      pares:              ejercicio.tipo_pregunta === "matching"  ? pares   : [],
      respuesta_numerica: ejercicio.tipo_pregunta === "numerical" ? respNum : undefined,
    }));
    setGuardando(false);
    setEditando(false);
  };

  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionEjercicio({ ejercicio_id: ejercicio._id, direction }));
    setMoviendo(false);
  };

  const handleReintentar = (canvas_curso_id: number) =>
    dispatch(reintentarEjercicio({ ejercicio_id: ejercicio._id, canvas_curso_id }));

  return (
    <>
      <Card elevation={0} className="animate-fadeIn"
        sx={{
          borderRadius: 3,
          border: tieneErrores ? "1px solid #fca5a5" : tienePending ? "1px solid #fde68a" : "1px solid #d9e4ee",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
        }}>
        <CardContent sx={{ p: 0 }}>

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)" }}>
            <div style={{ fontSize: 22, lineHeight: 1 }}>✏️</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Typography variant="caption" sx={{ color: "#a0a0a0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Ejercicio {ejercicio.position}
                </Typography>
                <Chip
                  label={TIPO_LABEL[ejercicio.tipo_pregunta] ?? ejercicio.tipo_pregunta}
                  size="small"
                  sx={{
                    fontSize: "0.62rem", height: 18,
                    bgcolor: `${TIPO_COLOR[ejercicio.tipo_pregunta] ?? "#4A6D8C"}18`,
                    color: TIPO_COLOR[ejercicio.tipo_pregunta] ?? "#4A6D8C", fontWeight: 600,
                  }}
                />
                {totalCount > 0 && (
                  <Chip
                    label={tieneErrores ? "Error Canvas" : tienePending ? "Pendiente" : `${syncCount}/${totalCount} sync`}
                    size="small"
                    onClick={() => setVerDeploys((v) => !v)}
                    sx={{
                      fontSize: "0.62rem", height: 18, cursor: "pointer", fontWeight: 600,
                      bgcolor: tieneErrores ? "#fee2e2" : tienePending ? "#fef9c3" : "#d1fae5",
                      color:   tieneErrores ? "#991b1b" : tienePending ? "#854d0e" : "#065f46",
                    }}
                  />
                )}
              </div>
              <Typography variant="body2" sx={{ color: "#3d3d3d", fontWeight: 500, mt: 0.3 }} noWrap>
                {ejercicio.nombre}
              </Typography>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-0.5 shrink-0">
              {editando ? (
                <>
                  <Tooltip title="Guardar"><span>
                    <IconButton size="small" onClick={handleGuardar} disabled={guardando} sx={{ color: "#4A6D8C" }}>
                      {guardando ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Cancelar">
                    <IconButton size="small" onClick={() => setEditando(false)} sx={{ color: "#8daecb" }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title={ejercicio.published ? "Publicado" : "Oculto"}>
                    <Switch
                      size="small"
                      checked={ejercicio.published}
                      disabled={moviendo}
                      onChange={() => dispatch(editarEjercicio({ ejercicio_id: ejercicio._id, published: !ejercicio.published }))}
                      sx={{ "& .MuiSwitch-thumb": { bgcolor: ejercicio.published ? "#4A6D8C" : "#ccc" }, "& .MuiSwitch-track": { bgcolor: ejercicio.published ? "#6793ba !important" : "#d9e4ee !important" } }}
                    />
                  </Tooltip>
                  <Tooltip title="Mover arriba"><span>
                    <IconButton size="small" disabled={esPrimero || moviendo} onClick={() => handleMover("up")}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" }, "&:disabled": { color: "#d9e4ee" } }}>
                      {moviendo ? <CircularProgress size={14} sx={{ color: "#8daecb" }} /> : <KeyboardArrowUpIcon fontSize="small" />}
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Mover abajo"><span>
                    <IconButton size="small" disabled={esUltimo || moviendo} onClick={() => handleMover("down")}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" }, "&:disabled": { color: "#d9e4ee" } }}>
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={handleAbrirEdicion} disabled={moviendo}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" } }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => setModalEliminar(true)} disabled={moviendo}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {/* ── Contenido ── */}
          <div className="px-5 py-4">
            {editando ? (
              <PreguntaEditor
                tipo={ejercicio.tipo_pregunta as TipoPreguntaEditor}
                enunciado={enunciado}
                onEnunciadoChange={setEnunciado}
                puntos={puntos}
                onPuntosChange={setPuntos}
                opciones={opciones}
                onOpcionesChange={setOpciones}
                pares={pares}
                onParesChange={setPares}
                respNum={respNum}
                onRespNumChange={setRespNum}
              />
            ) : (
              <PreguntaViewer
                tipo={ejercicio.tipo_pregunta as TipoPreguntaEditor}
                enunciado={ejercicio.enunciado}
                opciones={ejercicio.opciones}
                pares={ejercicio.pares}
                respuesta_numerica={ejercicio.respuesta_numerica}
              />
            )}
          </div>

          {/* ── Canvas deployments ── */}
          {verDeploys && totalCount > 0 && (
            <div className="animate-slideDown px-5 py-3" style={{ borderTop: "0.5px solid #d9e4ee" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <QuizIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                <Typography variant="caption" sx={{ color: "#6793ba", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                  Estado en Canvas
                </Typography>
              </div>
              <div className="flex flex-col gap-1.5">
                {ejercicio.canvas_deployments.map((d) => (
                  <div key={d.canvas_curso_id} className="flex items-center gap-2">
                    <Chip
                      label={`${d.canvas_curso_id} · ${d.status}`}
                      size="small"
                      sx={{
                        fontSize: "0.65rem", height: 22,
                        bgcolor: d.status === "synced" ? "#d1fae5" : d.status === "error" ? "#fee2e2" : "#fef9c3",
                        color:   d.status === "synced" ? "#065f46" : d.status === "error" ? "#991b1b" : "#854d0e",
                      }}
                    />
                    {(d.status === "error" || d.status === "missing") && (
                      <Tooltip title="Reintentar">
                        <IconButton size="small" onClick={() => handleReintentar(d.canvas_curso_id)} sx={{ color: "#8daecb" }}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {modalEliminar && (
        <ModalEliminar ejercicio={ejercicio} onClose={() => setModalEliminar(false)} />
      )}
    </>
  );
};

export default EjercicioCard;