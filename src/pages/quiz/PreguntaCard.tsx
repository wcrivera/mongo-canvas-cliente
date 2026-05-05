// src/pages/quiz/PreguntaCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography, IconButton,
  Tooltip, CircularProgress, Chip,
  Button, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";

import { useAppDispatch } from "../../store/hooks";
import {
  editarPregunta,
  eliminarPregunta,
  cambiarPositionPregunta,
} from "../../store/slices/quiz";
import type { IPregunta } from "../../store/slices/quiz/quizSlice";

import PreguntaEditor, {
  type IOpcionEditor,
  type IParEditor,
  type IRespuestaNumEditor,
  type TipoPreguntaEditor,
} from "../../components/quiz/PreguntaEditor";
import PreguntaViewer, {
  type TipoPreguntaViewer,
} from "../../components/quiz/PreguntaViewer";

// ── Labels y colores por tipo ────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  multiple_choice:         "Opción múltiple",
  multiple_answers:        "Múltiple respuesta",
  true_false:              "Verdadero/Falso",
  short_answer:            "Respuesta corta",
  essay:                   "Desarrollo",
  matching:                "Coincidencia",
  numerical:               "Numérica",
  calculated:              "Calculada",
  fill_in_multiple_blanks: "Completar (LTI)",
  text_only_question:      "Solo texto",
};

const TIPO_COLOR: Record<string, string> = {
  multiple_choice:         "#2d5be3",
  multiple_answers:        "#7c3aed",
  true_false:              "#0891b2",
  short_answer:            "#64748b",
  essay:                   "#64748b",
  matching:                "#0d9488",
  numerical:               "#ea580c",
  calculated:              "#dc2626",
  fill_in_multiple_blanks: "#4A6D8C",
  text_only_question:      "#94a3b8",
};

// ── Modal eliminar ────────────────────────────────────────────────────────────

const ModalEliminar = ({
  pregunta,
  onClose,
}: {
  pregunta: IPregunta;
  onClose:  () => void;
}) => {
  const dispatch   = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarPregunta({ pregunta_id: pregunta._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#1e293b" }}>
        ¿Eliminar pregunta?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button onClick={handleEliminar} variant="contained" disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: "#dc2626", borderRadius: 2, px: 3, fontWeight: 600,
            boxShadow: "none", "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" } }}>
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Card principal ────────────────────────────────────────────────────────────

interface Props {
  pregunta:  IPregunta;
  esPrimero: boolean;
  esUltimo:  boolean;
}

const PreguntaCard = ({ pregunta, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [editando,      setEditando]      = useState(false);
  const [guardando,     setGuardando]     = useState(false);
  const [moviendo,      setMoviendo]      = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  // ── Estado del editor ─────────────────────────────────────────────────────
  const [enunciado,    setEnunciado]    = useState(pregunta.enunciado);
  const [puntos,       setPuntos]       = useState(pregunta.puntos);
  const [tipoPimu,     setTipoPimu]     = useState<string>(pregunta.tipo_pimu ?? "numero");
  const [respuestaLti, setRespuestaLti] = useState<string>(pregunta.respuesta_lti ?? "");

  const [opciones, setOpciones] = useState<IOpcionEditor[]>(
    pregunta.opciones.map((op) => ({
      texto:       op.texto,
      es_correcta: op.es_correcta,
      blank_id:    op.blank_id ?? null,
    })),
  );
  const [pares, setPares] = useState<IParEditor[]>(
    (pregunta.pares ?? []).map((p) => ({
      izquierda: p.izquierda,
      derecha:   p.derecha,
    })),
  );
  const [respNum, setRespNum] = useState<IRespuestaNumEditor>({
    tipo:      pregunta.respuesta_numerica?.tipo      ?? "exact",
    exacto:    pregunta.respuesta_numerica?.exacto    ?? 0,
    margen:    pregunta.respuesta_numerica?.margen    ?? 0,
    minimo:    pregunta.respuesta_numerica?.minimo    ?? 0,
    maximo:    pregunta.respuesta_numerica?.maximo    ?? 10,
    precision: pregunta.respuesta_numerica?.precision ?? 2,
  });

  // ── Abrir edición — resetear al estado actual del servidor ────────────────
  const handleAbrirEdicion = () => {
    setEnunciado(pregunta.enunciado);
    setPuntos(pregunta.puntos);
    setTipoPimu(pregunta.tipo_pimu ?? "numero");
    setRespuestaLti(pregunta.respuesta_lti ?? "");
    setOpciones(pregunta.opciones.map((op) => ({
      texto:       op.texto,
      es_correcta: op.es_correcta,
      blank_id:    op.blank_id ?? null,
    })));
    setPares((pregunta.pares ?? []).map((p) => ({
      izquierda: p.izquierda,
      derecha:   p.derecha,
    })));
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

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true);

    const payload: Parameters<typeof editarPregunta>[0] = {
      pregunta_id: pregunta._id,
      enunciado,
      puntos,
    };

    switch (pregunta.tipo) {
      case "multiple_choice":
      case "multiple_answers":
      case "true_false":
        payload.opciones = opciones;
        break;
      case "matching":
        payload.pares = pares;
        break;
      case "numerical":
        payload.respuesta_numerica = respNum;
        break;
      case "fill_in_multiple_blanks":
        payload.tipo_pimu     = tipoPimu;
        payload.respuesta_lti = respuestaLti;
        payload.opciones = [
          { texto: respuestaLti, es_correcta: true, blank_id: "respuesta" },
        ];
        break;
    }

    await dispatch(editarPregunta(payload));
    setGuardando(false);
    setEditando(false);
  };

  // ── Mover ─────────────────────────────────────────────────────────────────
  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionPregunta({ pregunta_id: pregunta._id, direction }));
    setMoviendo(false);
  };

  return (
    <>
      <Card elevation={0} className="animate-fadeIn"
        sx={{ borderRadius: 3, border: "1px solid #d9e4ee",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" } }}>
        <CardContent sx={{ p: 0 }}>

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)" }}>

            {/* Número */}
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#4A6D8C", color: "white",
              fontSize: 12, fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {pregunta.position}
            </div>

            {/* Tipo + puntos */}
            <div className="flex items-center gap-2 flex-1">
              <Chip
                label={TIPO_LABEL[pregunta.tipo] ?? pregunta.tipo}
                size="small"
                sx={{
                  fontSize: "0.65rem", height: 20,
                  bgcolor: `${TIPO_COLOR[pregunta.tipo] ?? "#64748b"}20`,
                  color:    TIPO_COLOR[pregunta.tipo]  ?? "#64748b",
                  fontWeight: 600,
                }}
              />
              <Typography variant="caption" sx={{ color: "#8daecb" }}>
                {pregunta.puntos} pt{pregunta.puntos !== 1 ? "s" : ""}
              </Typography>
              {/* Badge LTI si aplica */}
              {pregunta.tipo === "fill_in_multiple_blanks" && pregunta.tipo_pimu && (
                <Chip
                  label={`LTI · ${pregunta.tipo_pimu}`}
                  size="small"
                  sx={{ fontSize: "0.6rem", height: 18, bgcolor: "#e0f0ff", color: "#1d4ed8" }}
                />
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-0.5">
              {editando ? (
                <>
                  <Tooltip title="Guardar cambios">
                    <span>
                      <IconButton size="small" onClick={handleGuardar} disabled={guardando}
                        sx={{ color: "#1a9e5c", "&:hover": { bgcolor: "#d1fae5" } }}>
                        {guardando
                          ? <CircularProgress size={14} sx={{ color: "#1a9e5c" }} />
                          : <CheckIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Cancelar">
                    <IconButton size="small" onClick={() => setEditando(false)}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Mover arriba"><span>
                    <IconButton size="small" disabled={esPrimero || moviendo}
                      onClick={() => handleMover("up")}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" },
                        "&:disabled": { color: "#d9e4ee" } }}>
                      {moviendo
                        ? <CircularProgress size={14} sx={{ color: "#8daecb" }} />
                        : <KeyboardArrowUpIcon fontSize="small" />}
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Mover abajo"><span>
                    <IconButton size="small" disabled={esUltimo || moviendo}
                      onClick={() => handleMover("down")}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" },
                        "&:disabled": { color: "#d9e4ee" } }}>
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
                    <IconButton size="small" onClick={() => setModalEliminar(true)}
                      disabled={moviendo}
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
                tipoPimu={tipoPimu}
                onTipoPimuChange={setTipoPimu}
                respuestaLti={respuestaLti}
                onRespuestaLtiChange={setRespuestaLti}
              />
            ) : (
              <PreguntaViewer
                tipo={pregunta.tipo as TipoPreguntaViewer}
                enunciado={pregunta.enunciado}
                opciones={pregunta.opciones}
                pares={pregunta.pares}
                respuesta_numerica={pregunta.respuesta_numerica}
                tipo_pimu={pregunta.tipo_pimu}
                respuesta_lti={pregunta.respuesta_lti}
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