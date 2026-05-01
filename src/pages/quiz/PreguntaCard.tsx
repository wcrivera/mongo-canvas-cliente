// src/pages/quiz/PreguntaCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography,
  IconButton, Tooltip, CircularProgress, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import WarningAmberIcon      from "@mui/icons-material/WarningAmber";
import { useAppDispatch }    from "../../store/hooks";
import {
  eliminarPregunta,
  cambiarPositionPregunta,
  editarPregunta,
} from "../../store/slices/quiz";
import type { IPregunta } from "../../store/slices/quiz";
import { PreguntaViewer, PreguntaEditor } from "../../components/quiz";
import type {
  IOpcionEditor,
  IParEditor,
  IRespuestaNumEditor,
  TipoPreguntaEditor,
} from "../../components/quiz";

interface Props {
  pregunta:  IPregunta;
  esPrimero: boolean;
  esUltimo:  boolean;
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
  pregunta,
  onClose,
}: {
  pregunta: IPregunta;
  onClose:  () => void;
}) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarPregunta({ pregunta_id: pregunta._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#fef2f2", color: "#991b1b", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <WarningAmberIcon />
        <span>Eliminar pregunta</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151" }}>
          ¿Eliminar esta pregunta? Esta acción no se puede deshacer.
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

const PreguntaCard = ({ pregunta, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [editando,      setEditando]      = useState(false);
  const [guardando,     setGuardando]     = useState(false);
  const [moviendo,      setMoviendo]      = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  // Estado del editor
  const [enunciado, setEnunciado] = useState(pregunta.enunciado);
  const [puntos,    setPuntos]    = useState(pregunta.puntos);
  const [opciones,  setOpciones]  = useState<IOpcionEditor[]>(
    pregunta.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
  );
  const [pares, setPares] = useState<IParEditor[]>(
    (pregunta.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })),
  );
  const [respNum, setRespNum] = useState<IRespuestaNumEditor>({
    tipo:      pregunta.respuesta_numerica?.tipo      ?? "exact",
    exacto:    pregunta.respuesta_numerica?.exacto    ?? 0,
    margen:    pregunta.respuesta_numerica?.margen    ?? 0,
    minimo:    pregunta.respuesta_numerica?.minimo    ?? 0,
    maximo:    pregunta.respuesta_numerica?.maximo    ?? 10,
    precision: pregunta.respuesta_numerica?.precision ?? 2,
  });

  const handleAbrirEdicion = () => {
    setEnunciado(pregunta.enunciado);
    setPuntos(pregunta.puntos);
    setOpciones(pregunta.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })));
    setPares((pregunta.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })));
    setRespNum({
      tipo:      pregunta.respuesta_numerica?.tipo      ?? "exact",
      exacto:    pregunta.respuesta_numerica?.exacto    ?? 0,
      margen:    pregunta.respuesta_numerica?.margen    ?? 0,
      minimo:    pregunta.respuesta_numerica?.minimo    ?? 0,
      maximo:    pregunta.respuesta_numerica?.maximo    ?? 10,
      precision: pregunta.respuesta_numerica?.precision ?? 2,
    });
    setEditando(true);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    const payload: Parameters<typeof editarPregunta>[0] = {
      pregunta_id: pregunta._id,
      enunciado,
      puntos,
    };
    if (["multiple_choice", "multiple_answers", "true_false"].includes(pregunta.tipo)) {
      payload.opciones = opciones;
    }
    if (pregunta.tipo === "matching")  payload.pares              = pares;
    if (pregunta.tipo === "numerical") payload.respuesta_numerica = respNum;

    await dispatch(editarPregunta(payload));
    setGuardando(false);
    setEditando(false);
  };

  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionPregunta({ pregunta_id: pregunta._id, direction }));
    setMoviendo(false);
  };

  return (
    <>
      <Card elevation={0} className="animate-fadeIn"
        sx={{ borderRadius: 3, border: "1px solid #d9e4ee", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" } }}>
        <CardContent sx={{ p: 0 }}>

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#4A6D8C", color: "white",
              fontSize: 12, fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {pregunta.position}
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Chip
                label={TIPO_LABEL[pregunta.tipo] ?? pregunta.tipo}
                size="small"
                sx={{
                  fontSize: "0.65rem", height: 20,
                  bgcolor: `${TIPO_COLOR[pregunta.tipo]}20`,
                  color: TIPO_COLOR[pregunta.tipo], fontWeight: 600,
                }}
              />
              <Typography variant="caption" sx={{ color: "#8daecb" }}>
                {pregunta.puntos} pt{pregunta.puntos !== 1 ? "s" : ""}
              </Typography>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-0.5">
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
                tipo={pregunta.tipo as TipoPreguntaEditor}
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
                tipo={pregunta.tipo as TipoPreguntaEditor}
                enunciado={pregunta.enunciado}
                opciones={pregunta.opciones}
                pares={pregunta.pares}
                respuesta_numerica={pregunta.respuesta_numerica}
              />
            )}
          </div>

        </CardContent>
      </Card>

      {modalEliminar && (
        <ModalEliminar pregunta={pregunta} onClose={() => setModalEliminar(false)} />
      )}
    </>
  );
};

export default PreguntaCard;