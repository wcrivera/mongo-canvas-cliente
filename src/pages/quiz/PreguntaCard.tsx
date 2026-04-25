import { useState } from "react";
import {
  Card, CardContent, Typography,
  IconButton, Tooltip, CircularProgress,
  Chip, TextField, Button, Checkbox,
  FormControl, InputLabel, Select, MenuItem,
  Divider,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import AddIcon               from "@mui/icons-material/Add";
import DeleteIcon            from "@mui/icons-material/Delete";

import { useAppDispatch } from "../../store/hooks";
import {
  eliminarPregunta,
  cambiarPositionPregunta,
  editarPregunta,
} from "../../store/slices/quiz";
import type { IPregunta } from "../../store/slices/quiz";
import LatexRenderer  from "../../components/LaTeX/LatexRenderer";
import { LatexEditor, toEditorHTML } from "../../components/Editor";
import TiptapRenderer from "../../components/Editor/TiptapRenderer";

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

const PreguntaCard = ({ pregunta, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [eliminando, setEliminando] = useState(false);
  const [editando,   setEditando]   = useState(false);
  const [guardando,  setGuardando]  = useState(false);

  // ── Estado edición ────────────────────────────────────────────
  const [enunciado, setEnunciado] = useState(pregunta.enunciado);
  const [puntos,    setPuntos]    = useState(pregunta.puntos);
  const [opciones,  setOpciones]  = useState(
    pregunta.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
  );
  const [pares, setPares] = useState(
    (pregunta.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })),
  );
  const [respNum, setRespNum] = useState({
    tipo:      pregunta.respuesta_numerica?.tipo      ?? ("exact" as "exact" | "range" | "precision"),
    exacto:    pregunta.respuesta_numerica?.exacto    ?? 0,
    margen:    pregunta.respuesta_numerica?.margen    ?? 0,
    minimo:    pregunta.respuesta_numerica?.minimo    ?? 0,
    maximo:    pregunta.respuesta_numerica?.maximo    ?? 10,
    precision: pregunta.respuesta_numerica?.precision ?? 2,
  });

  const esMultiple = pregunta.tipo === "multiple_answers";

  // ── Handlers opciones ─────────────────────────────────────────
  const handleOpcionTexto = (idx: number, texto: string) =>
    setOpciones((ops) => ops.map((op, i) => i === idx ? { ...op, texto } : op));

  const handleOpcionCorrecta = (idx: number) => {
    if (esMultiple) {
      setOpciones((ops) => ops.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op));
    } else {
      setOpciones((ops) => ops.map((op, i) => ({ ...op, es_correcta: i === idx })));
    }
  };
  const agregarOpcion  = () => setOpciones((ops) => [...ops, { texto: "", es_correcta: false }]);
  const eliminarOpcion = (idx: number) => setOpciones((ops) => ops.filter((_, i) => i !== idx));

  // ── Handlers pares ────────────────────────────────────────────
  const handleParIzq = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => i === idx ? { ...p, derecha: v } : p));
  const agregarPar   = () => setPares((ps) => [...ps, { izquierda: "", derecha: "" }]);
  const eliminarPar  = (idx: number) => setPares((ps) => ps.filter((_, i) => i !== idx));

  // ── Abrir edición — resetea desde datos actuales ──────────────
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

  // ── Guardar ───────────────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true);
    const payload: Parameters<typeof editarPregunta>[0] = {
      pregunta_id: pregunta._id,
      enunciado,
      puntos,
    };
    if (pregunta.tipo === "multiple_choice" || pregunta.tipo === "multiple_answers" || pregunta.tipo === "true_false") {
      payload.opciones = opciones;
    }
    if (pregunta.tipo === "matching")  payload.pares              = pares;
    if (pregunta.tipo === "numerical") payload.respuesta_numerica = respNum;

    await dispatch(editarPregunta(payload));
    setGuardando(false);
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    setEliminando(true);
    await dispatch(eliminarPregunta({ pregunta_id: pregunta._id }));
    setEliminando(false);
  };

  return (
    <Card
      elevation={0}
      className="animate-fadeIn"
      sx={{
        borderRadius: 3, border: "1px solid #d9e4ee",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
      }}
    >
      <CardContent sx={{ p: 0 }}>

        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)" }}
        >
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
                <Tooltip title="Guardar">
                  <span>
                    <IconButton size="small" onClick={handleGuardar} disabled={guardando} sx={{ color: "#4A6D8C" }}>
                      {guardando ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton size="small" onClick={() => setEditando(false)} sx={{ color: "#8daecb" }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Subir">
                  <span>
                    <IconButton size="small" disabled={esPrimero}
                      onClick={() => dispatch(cambiarPositionPregunta({ pregunta_id: pregunta._id, direction: "up" }))}
                      sx={{ color: "#8daecb", "&:disabled": { color: "#d9e4ee" } }}>
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Bajar">
                  <span>
                    <IconButton size="small" disabled={esUltimo}
                      onClick={() => dispatch(cambiarPositionPregunta({ pregunta_id: pregunta._id, direction: "down" }))}
                      sx={{ color: "#8daecb", "&:disabled": { color: "#d9e4ee" } }}>
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={handleAbrirEdicion}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <span>
                    <IconButton size="small" onClick={handleEliminar} disabled={eliminando}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                      {eliminando ? <CircularProgress size={14} /> : <DeleteOutlineIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        <Divider sx={{ borderColor: "#f0f0f0" }} />

        {/* ── Cuerpo: edición o lectura ── */}
        <div className="px-5 py-4">
          {editando ? (
            <div className="flex flex-col gap-4">

              {/* Enunciado */}
              <div>
                <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
                  Enunciado
                </Typography>
                <LatexEditor
                  initialContent={toEditorHTML(enunciado)}
                  onChange={setEnunciado}
                  placeholder="Escribe el enunciado…"
                  minHeight="120px"
                />
              </div>

              {/* Puntos */}
              <TextField
                label="Puntos" type="number" value={puntos}
                onChange={(e) => setPuntos(Number(e.target.value))}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, width: 120 }}
              />

              <Divider />

              {/* ── Opciones ── */}
              {(pregunta.tipo === "multiple_choice" || pregunta.tipo === "multiple_answers" || pregunta.tipo === "true_false") && (
                <div className="flex flex-col gap-2">
                  <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
                    {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
                  </Typography>
                  {opciones.map((op, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {esMultiple ? (
                        <Checkbox checked={op.es_correcta} onChange={() => handleOpcionCorrecta(idx)}
                          size="small" sx={{ color: "#4A6D8C" }} />
                      ) : (
                        <input type="radio" name={`correcta-${pregunta._id}`}
                          checked={op.es_correcta} onChange={() => handleOpcionCorrecta(idx)}
                          style={{ accentColor: "#4A6D8C", flexShrink: 0 }} />
                      )}
                      {pregunta.tipo === "true_false" ? (
                        <Typography variant="body2" sx={{ color: "#3c5770" }}>{op.texto}</Typography>
                      ) : (
                        <TextField
                          value={op.texto} onChange={(e) => handleOpcionTexto(idx, e.target.value)}
                          size="small" fullWidth
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      )}
                      {pregunta.tipo !== "true_false" && (
                        <IconButton size="small" onClick={() => eliminarOpcion(idx)}
                          sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                  {pregunta.tipo !== "true_false" && (
                    <Button size="small" startIcon={<AddIcon />} onClick={agregarOpcion}
                      sx={{ color: "#4A6D8C", alignSelf: "flex-start" }}>
                      Agregar opción
                    </Button>
                  )}
                </div>
              )}

              {/* ── Pares (matching) ── */}
              {pregunta.tipo === "matching" && (
                <div className="flex flex-col gap-2">
                  <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
                    Pares — término / definición
                  </Typography>
                  {pares.map((par, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <TextField value={par.izquierda} onChange={(e) => handleParIzq(idx, e.target.value)}
                        placeholder="Término" size="small" fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>↔</Typography>
                      <TextField value={par.derecha} onChange={(e) => handleParDer(idx, e.target.value)}
                        placeholder="Definición" size="small" fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      {pares.length > 2 && (
                        <IconButton size="small" onClick={() => eliminarPar(idx)}
                          sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                  <Button size="small" startIcon={<AddIcon />} onClick={agregarPar}
                    sx={{ color: "#4A6D8C", alignSelf: "flex-start" }}>
                    Agregar par
                  </Button>
                </div>
              )}

              {/* ── Numérica (numerical) ── */}
              {pregunta.tipo === "numerical" && (
                <div className="flex flex-col gap-3">
                  <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
                    Respuesta numérica
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Tipo de respuesta</InputLabel>
                    <Select value={respNum.tipo} label="Tipo de respuesta"
                      onChange={(e) => setRespNum((r) => ({ ...r, tipo: e.target.value as "exact" | "range" | "precision" }))}
                      sx={{ borderRadius: 2 }}>
                      <MenuItem value="exact">Valor exacto (con margen)</MenuItem>
                      <MenuItem value="range">Rango (mínimo — máximo)</MenuItem>
                      <MenuItem value="precision">Precisión decimal</MenuItem>
                    </Select>
                  </FormControl>
                  {respNum.tipo === "exact" && (
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="Respuesta exacta" type="number" size="small" value={respNum.exacto}
                        onChange={(e) => setRespNum((r) => ({ ...r, exacto: Number(e.target.value) }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      <TextField label="Margen (±)" type="number" size="small" value={respNum.margen}
                        onChange={(e) => setRespNum((r) => ({ ...r, margen: Number(e.target.value) }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </div>
                  )}
                  {respNum.tipo === "range" && (
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="Mínimo" type="number" size="small" value={respNum.minimo}
                        onChange={(e) => setRespNum((r) => ({ ...r, minimo: Number(e.target.value) }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      <TextField label="Máximo" type="number" size="small" value={respNum.maximo}
                        onChange={(e) => setRespNum((r) => ({ ...r, maximo: Number(e.target.value) }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </div>
                  )}
                  {respNum.tipo === "precision" && (
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="Respuesta exacta" type="number" size="small" value={respNum.exacto}
                        onChange={(e) => setRespNum((r) => ({ ...r, exacto: Number(e.target.value) }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      <TextField label="Decimales" type="number" size="small" value={respNum.precision}
                        onChange={(e) => setRespNum((r) => ({ ...r, precision: Number(e.target.value) }))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* ── Vista de lectura del enunciado ── */
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#1f2c38" }}>
              {pregunta.enunciado
                ? <TiptapRenderer>{pregunta.enunciado}</TiptapRenderer>
                : <span style={{ color: "#8daecb", fontStyle: "italic" }}>Sin enunciado</span>
              }
            </div>
          )}
        </div>

        {/* ── Vista de lectura: opciones / pares / numérica ── */}
        {!editando && (
          <div className="px-5 pb-4 flex flex-col gap-2">

            {/* Opciones */}
            {(pregunta.tipo === "multiple_choice" || pregunta.tipo === "multiple_answers" || pregunta.tipo === "true_false") &&
              pregunta.opciones.length > 0 && (
              <>
                <Divider sx={{ borderColor: "#f0f0f0", mb: 1 }} />
                {pregunta.opciones.map((op, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                      border: `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                    }}>
                    <div style={{
                      width: 12, height: 12,
                      borderRadius: esMultiple ? "3px" : "50%",
                      border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                      background: op.es_correcta ? "#1a9e5c" : "white", flexShrink: 0,
                    }} />
                    <Typography variant="caption" sx={{ color: op.es_correcta ? "#065f46" : "#555", flex: 1 }}>
                      <LatexRenderer>{op.texto}</LatexRenderer>
                    </Typography>
                    {op.es_correcta && (
                      <Typography variant="caption" sx={{ color: "#1a9e5c", fontWeight: 600 }}>✓</Typography>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Short answer / Essay */}
            {(pregunta.tipo === "short_answer" || pregunta.tipo === "essay") && (
              <Typography variant="caption" sx={{ color: "#8daecb", fontStyle: "italic" }}>
                {pregunta.tipo === "short_answer"
                  ? "El estudiante ingresa una respuesta corta"
                  : "El estudiante redacta un ensayo"}
              </Typography>
            )}

            {/* Matching */}
            {pregunta.tipo === "matching" && (pregunta.pares ?? []).length > 0 && (
              <>
                <Divider sx={{ borderColor: "#f0f0f0", mb: 1 }} />
                <div className="flex flex-col gap-1.5">
                  {(pregunta.pares ?? []).map((par, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{ background: "#f0f4f8", border: "1px solid #d9e4ee" }}>
                      <Typography variant="caption" sx={{ color: "#1f2c38", fontWeight: 500, flex: 1 }}>
                        {par.izquierda}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#8daecb" }}>↔</Typography>
                      <Typography variant="caption" sx={{ color: "#1f2c38", flex: 1 }}>
                        {par.derecha}
                      </Typography>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Numérica */}
            {pregunta.tipo === "numerical" && pregunta.respuesta_numerica && (
              <>
                <Divider sx={{ borderColor: "#f0f0f0", mb: 1 }} />
                <div className="rounded-lg px-3 py-2"
                  style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                  <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 500 }}>
                    {pregunta.respuesta_numerica.tipo === "exact" &&
                      `Respuesta: ${pregunta.respuesta_numerica.exacto} ± ${pregunta.respuesta_numerica.margen}`}
                    {pregunta.respuesta_numerica.tipo === "range" &&
                      `Rango: ${pregunta.respuesta_numerica.minimo} — ${pregunta.respuesta_numerica.maximo}`}
                    {pregunta.respuesta_numerica.tipo === "precision" &&
                      `Exacto: ${pregunta.respuesta_numerica.exacto} (${pregunta.respuesta_numerica.precision} decimales)`}
                  </Typography>
                </div>
              </>
            )}

          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default PreguntaCard;