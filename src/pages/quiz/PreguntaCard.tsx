import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useAppDispatch } from "../../store/hooks";
import {
  eliminarPregunta,
  cambiarPositionPregunta,
} from "../../store/slices/quiz";
import type { IPregunta } from "../../store/slices/quiz";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  pregunta: IPregunta;
  esPrimero: boolean;
  esUltimo: boolean;
}

const TIPO_LABEL: Record<string, string> = {
  multiple_choice: "Opción múltiple",
  multiple_answers: "Respuestas múltiples",
  true_false: "Verdadero/Falso",
  short_answer: "Respuesta corta",
  essay: "Ensayo",
  matching: "Coincidencia",
  numerical: "Respuesta numérica",
};

const TIPO_COLOR: Record<string, string> = {
  multiple_choice: "#4A6D8C",
  multiple_answers: "#2d5be3",
  true_false: "#1a9e5c",
  short_answer: "#f47c3c",
  essay: "#9c27b0",
  matching: "#e67e22",
  numerical: "#e74c3c",
};

const PreguntaCard = ({ pregunta, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar esta pregunta?`)) return;
    setEliminando(true);
    await dispatch(eliminarPregunta({ pregunta_id: pregunta._id }));
    setEliminando(false);
  };

  const handleMoverArriba = () =>
    dispatch(
      cambiarPositionPregunta({ pregunta_id: pregunta._id, direction: "up" }),
    );

  const handleMoverAbajo = () =>
    dispatch(
      cambiarPositionPregunta({ pregunta_id: pregunta._id, direction: "down" }),
    );

  return (
    <Card
      elevation={0}
      className="animate-fadeIn"
      sx={{
        borderRadius: 3,
        border: "1px solid #d9e4ee",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{
            background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)",
          }}
        >
          {/* Número */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#4A6D8C",
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {pregunta.position}
          </div>

          {/* Tipo + puntos */}
          <div className="flex items-center gap-2 flex-1">
            <Chip
              label={TIPO_LABEL[pregunta.tipo]}
              size="small"
              sx={{
                fontSize: "0.65rem",
                height: 20,
                bgcolor: `${TIPO_COLOR[pregunta.tipo]}20`,
                color: TIPO_COLOR[pregunta.tipo],
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" sx={{ color: "#8daecb" }}>
              {pregunta.puntos} pt{pregunta.puntos !== 1 ? "s" : ""}
            </Typography>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-0.5 shrink-0">
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
            <Tooltip title="Eliminar">
              <span>
                <IconButton
                  size="small"
                  onClick={handleEliminar}
                  disabled={eliminando}
                  sx={{
                    color: "#8daecb",
                    "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                  }}
                >
                  {eliminando ? (
                    <CircularProgress size={14} />
                  ) : (
                    <DeleteOutlineIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </div>
        </div>

        {/* ── Enunciado ── */}
        <div className="px-5 py-3">
          <Typography
            variant="body2"
            sx={{ color: "#1f2c38", fontWeight: 500, mb: 2 }}
          >
            <LatexRenderer>{pregunta.enunciado}</LatexRenderer>
          </Typography>

          {/* Opciones según tipo */}
          {pregunta.tipo === "multiple_choice" && (
            <div className="flex flex-col gap-1.5">
              {pregunta.opciones.map((op) => (
                <div
                  key={op._id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                    border: `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                      background: op.es_correcta ? "#1a9e5c" : "white",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: op.es_correcta ? "#065f46" : "#555" }}
                  >
                    <LatexRenderer>{op.texto}</LatexRenderer>
                  </Typography>
                  {op.es_correcta && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#1a9e5c", ml: "auto", fontWeight: 600 }}
                    >
                      ✓ Correcta
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          )}

          {pregunta.tipo === "true_false" && (
            <div className="flex gap-3">
              {pregunta.opciones.map((op) => (
                <div
                  key={op._id}
                  className="flex items-center gap-2 rounded-lg px-4 py-2"
                  style={{
                    background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                    border: `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: op.es_correcta ? "#065f46" : "#555",
                      fontWeight: op.es_correcta ? 600 : 400,
                    }}
                  >
                    {op.texto} {op.es_correcta && "✓"}
                  </Typography>
                </div>
              ))}
            </div>
          )}

          {(pregunta.tipo === "short_answer" || pregunta.tipo === "essay") && (
            <div
              className="rounded-lg px-3 py-2"
              style={{ background: "#f9f9f9", border: "1px solid #e0e0e0" }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#8daecb", fontStyle: "italic" }}
              >
                {pregunta.tipo === "short_answer"
                  ? "El estudiante ingresa una respuesta corta"
                  : "El estudiante redacta un ensayo"}
              </Typography>
            </div>
          )}

          {/* Respuestas múltiples */}
          {pregunta.tipo === "multiple_answers" && (
            <div className="flex flex-col gap-1.5">
              {pregunta.opciones.map((op) => (
                <div
                  key={op._id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                    border: `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                      background: op.es_correcta ? "#1a9e5c" : "white",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: op.es_correcta ? "#065f46" : "#555" }}
                  >
                    <LatexRenderer>{op.texto}</LatexRenderer>
                  </Typography>
                  {op.es_correcta && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#1a9e5c", ml: "auto", fontWeight: 600 }}
                    >
                      ✓
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Coincidencia */}
          {pregunta.tipo === "matching" && (
            <div className="flex flex-col gap-1.5">
              {pregunta.pares?.map((par, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ background: "#f0f4f8", border: "1px solid #d9e4ee" }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#1f2c38", fontWeight: 500, flex: 1 }}
                  >
                    {par.izquierda}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8daecb" }}>
                    ↔
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#1f2c38", flex: 1 }}
                  >
                    {par.derecha}
                  </Typography>
                </div>
              ))}
            </div>
          )}

          {/* Numérica */}
          {pregunta.tipo === "numerical" && pregunta.respuesta_numerica && (
            <div
              className="rounded-lg px-3 py-2"
              style={{ background: "#fef3c7", border: "1px solid #fde68a" }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#92400e", fontWeight: 500 }}
              >
                {pregunta.respuesta_numerica.tipo === "exact" &&
                  `Respuesta: ${pregunta.respuesta_numerica.exacto} ± ${pregunta.respuesta_numerica.margen}`}
                {pregunta.respuesta_numerica.tipo === "range" &&
                  `Rango: ${pregunta.respuesta_numerica.minimo} — ${pregunta.respuesta_numerica.maximo}`}
                {pregunta.respuesta_numerica.tipo === "precision" &&
                  `Exacto: ${pregunta.respuesta_numerica.exacto} (${pregunta.respuesta_numerica.precision} decimales)`}
              </Typography>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PreguntaCard;
