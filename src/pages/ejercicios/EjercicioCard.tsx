import { useState }        from "react";
import {
  Card, CardContent, Typography,
  IconButton, Tooltip, TextField,
  Button, CircularProgress,
  Switch, Divider, Chip,
  FormControl, InputLabel, Select, MenuItem,
  Checkbox,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import QuizIcon              from "@mui/icons-material/Quiz";
import RefreshIcon           from "@mui/icons-material/Refresh";
import AddIcon               from "@mui/icons-material/Add";
import DeleteIcon            from "@mui/icons-material/Delete";

import { useAppDispatch }    from "../../store/hooks";
import {
  editarEjercicio,
  eliminarEjercicio,
  cambiarPositionEjercicio,
  reintentarEjercicio,
} from "../../store/slices/ejercicio";
import type {
  IEjercicio,
  IOpcionEjercicio,
  IParEjercicio,
  IRespuestaNumericaEjercicio,
} from "../../store/slices/ejercicio";
import LatexRenderer         from "../../components/LaTeX/LatexRenderer";
import { LatexEditor }       from "../../components/Editor";
import { toEditorHTML }      from "../../components/Editor";
import TiptapRenderer from "../../components/Editor/TiptapRenderer";


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

const EjercicioCard = ({ ejercicio, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [editando,   setEditando]   = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [verDeploys, setVerDeploys] = useState(false);

  // ── Estado del formulario de edición ────────────────────────────────────
  const [form, setForm] = useState({
    nombre:    ejercicio.nombre,
    enunciado: ejercicio.enunciado,
    published: ejercicio.published,
  });
  const [opciones, setOpciones] = useState<IOpcionEjercicio[]>(
    ejercicio.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
  );
  const [pares, setPares] = useState<IParEjercicio[]>(
    (ejercicio.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })),
  );
  const [respNum, setRespNum] = useState<IRespuestaNumericaEjercicio>({
    tipo:      ejercicio.respuesta_numerica?.tipo      ?? "exact",
    exacto:    ejercicio.respuesta_numerica?.exacto    ?? 0,
    margen:    ejercicio.respuesta_numerica?.margen    ?? 0,
    minimo:    ejercicio.respuesta_numerica?.minimo    ?? 0,
    maximo:    ejercicio.respuesta_numerica?.maximo    ?? 10,
    precision: ejercicio.respuesta_numerica?.precision ?? 2,
  });

  // ── Status deploys ───────────────────────────────────────────────────────
  const tieneErrores = ejercicio.canvas_deployments.some(
    (d) => d.status === "error" || d.status === "missing",
  );
  const tienePending = ejercicio.canvas_deployments.some(
    (d) => d.status === "pending",
  );
  const syncCount  = ejercicio.canvas_deployments.filter((d) => d.status === "synced").length;
  const totalCount = ejercicio.canvas_deployments.length;

  // ── Abrir edición — resetea form con datos actuales ──────────────────────
  const handleAbrirEdicion = () => {
    setForm({
      nombre:    ejercicio.nombre,
      enunciado: ejercicio.enunciado,
      published: ejercicio.published,
    });
    setOpciones(
      ejercicio.opciones.map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
    );
    setPares(
      (ejercicio.pares ?? []).map((p) => ({ izquierda: p.izquierda, derecha: p.derecha })),
    );
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

  // ── Guardar ──────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarEjercicio({
      ejercicio_id: ejercicio._id,
      ...form,
      opciones,
      pares:              ejercicio.tipo_pregunta === "matching"  ? pares   : [],
      respuesta_numerica: ejercicio.tipo_pregunta === "numerical" ? respNum : undefined,
    }));
    setGuardando(false);
    setEditando(false);
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${ejercicio.nombre}"?`)) return;
    setEliminando(true);
    await dispatch(eliminarEjercicio({ ejercicio_id: ejercicio._id }));
    setEliminando(false);
  };

  const handleMoverArriba = () =>
    dispatch(cambiarPositionEjercicio({ ejercicio_id: ejercicio._id, direction: "up" }));
  const handleMoverAbajo  = () =>
    dispatch(cambiarPositionEjercicio({ ejercicio_id: ejercicio._id, direction: "down" }));
  const handleReintentar  = (canvas_curso_id: number) =>
    dispatch(reintentarEjercicio({ ejercicio_id: ejercicio._id, canvas_curso_id }));

  // ── Handlers opciones (edición) ──────────────────────────────────────────
  const handleOpcionCorrecta = (idx: number) => {
    const esMultiple = ejercicio.tipo_pregunta === "multiple_answers";
    if (esMultiple) {
      setOpciones((ops) =>
        ops.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op),
      );
    } else {
      setOpciones((ops) =>
        ops.map((op, i) => ({ ...op, es_correcta: i === idx })),
      );
    }
  };

  const handleParIzq = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => i === idx ? { ...p, derecha: v } : p));

  const esMultiple     = ejercicio.tipo_pregunta === "multiple_answers";
  const mostrarOpciones =
    ejercicio.tipo_pregunta === "multiple_choice"  ||
    ejercicio.tipo_pregunta === "multiple_answers" ||
    ejercicio.tipo_pregunta === "true_false";

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
            width: 48, height: 48, borderRadius: "50%",
            background: "white", border: "1px solid #e0e0e0",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 22,
          }}>
            ✏️
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Typography
                variant="caption"
                sx={{ color: "#a0a0a0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Ejercicio {ejercicio.position}
              </Typography>
              <Chip
                label={TIPO_LABEL[ejercicio.tipo_pregunta] ?? ejercicio.tipo_pregunta}
                size="small"
                sx={{
                  fontSize: "0.62rem", height: 18,
                  bgcolor: `${TIPO_COLOR[ejercicio.tipo_pregunta] ?? "#4A6D8C"}18`,
                  color:    TIPO_COLOR[ejercicio.tipo_pregunta]   ?? "#4A6D8C",
                  fontWeight: 600,
                }}
              />
              {totalCount > 0 && (
                <Chip
                  label={
                    tieneErrores ? "Error Canvas"
                    : tienePending ? "Pendiente"
                    : `${syncCount}/${totalCount} sync`
                  }
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
                <Tooltip title={ejercicio.published ? "Publicado" : "No publicado"}>
                  <Switch
                    size="small" checked={ejercicio.published} disabled
                    sx={{ "& .MuiSwitch-thumb": { bgcolor: ejercicio.published ? "#4A6D8C" : "#ccc" } }}
                  />
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    size="small" onClick={handleAbrirEdicion}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <span>
                    <IconButton
                      size="small" onClick={handleEliminar} disabled={eliminando}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
                    >
                      {eliminando ? <CircularProgress size={14} /> : <DeleteOutlineIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Subir">
                  <span>
                    <IconButton
                      size="small" disabled={esPrimero} onClick={handleMoverArriba}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" }, "&:disabled": { color: "#d9e4ee" } }}
                    >
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Bajar">
                  <span>
                    <IconButton
                      size="small" disabled={esUltimo} onClick={handleMoverAbajo}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" }, "&:disabled": { color: "#d9e4ee" } }}
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

              {/* Nombre */}
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                size="small" fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              {/* Enunciado con LatexEditor */}
              <div>
                <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
                  Enunciado
                </Typography>
                <LatexEditor
                  initialContent={toEditorHTML(form.enunciado)}
                  onChange={(html) => setForm((f) => ({ ...f, enunciado: html }))}
                  placeholder="Escribe el enunciado…"
                  minHeight="120px"
                />
              </div>

              {/* ── Opciones editables ── */}
              {mostrarOpciones && (
                <div className="flex flex-col gap-2">
                  <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
                    {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
                  </Typography>
                  {opciones.map((op, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {esMultiple ? (
                        <Checkbox
                          checked={op.es_correcta}
                          onChange={() => handleOpcionCorrecta(idx)}
                          size="small" sx={{ color: "#4A6D8C" }}
                        />
                      ) : (
                        <input
                          type="radio" name="correcta_edit"
                          checked={op.es_correcta}
                          onChange={() => handleOpcionCorrecta(idx)}
                          style={{ accentColor: "#4A6D8C", flexShrink: 0 }}
                        />
                      )}
                      {ejercicio.tipo_pregunta === "true_false" ? (
                        <Typography variant="body2" sx={{ color: "#3c5770" }}>{op.texto}</Typography>
                      ) : (
                        <TextField
                          value={op.texto}
                          onChange={(e) =>
                            setOpciones((ops) =>
                              ops.map((o, i) => i === idx ? { ...o, texto: e.target.value } : o),
                            )
                          }
                          size="small" fullWidth
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      )}
                      {(ejercicio.tipo_pregunta === "multiple_choice" || esMultiple) && (
                        <IconButton
                          size="small"
                          onClick={() => setOpciones((ops) => ops.filter((_, i) => i !== idx))}
                          sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                  {(ejercicio.tipo_pregunta === "multiple_choice" || esMultiple) && (
                    <Button
                      size="small" startIcon={<AddIcon />}
                      onClick={() => setOpciones((ops) => [...ops, { texto: "", es_correcta: false }])}
                      sx={{ color: "#4A6D8C", alignSelf: "flex-start" }}
                    >
                      Agregar opción
                    </Button>
                  )}
                </div>
              )}

              {/* ── Pares (matching) ── */}
              {ejercicio.tipo_pregunta === "matching" && (
                <div className="flex flex-col gap-2">
                  <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
                    Pares — término / definición
                  </Typography>
                  {pares.map((par, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <TextField
                        value={par.izquierda} onChange={(e) => handleParIzq(idx, e.target.value)}
                        placeholder="Término" size="small" fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                      <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>↔</Typography>
                      <TextField
                        value={par.derecha} onChange={(e) => handleParDer(idx, e.target.value)}
                        placeholder="Definición" size="small" fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                      {pares.length > 2 && (
                        <IconButton
                          size="small"
                          onClick={() => setPares((ps) => ps.filter((_, i) => i !== idx))}
                          sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                  <Button
                    size="small" startIcon={<AddIcon />}
                    onClick={() => setPares((ps) => [...ps, { izquierda: "", derecha: "" }])}
                    sx={{ color: "#4A6D8C", alignSelf: "flex-start" }}
                  >
                    Agregar par
                  </Button>
                </div>
              )}

              {/* ── Respuesta numérica (numerical) ── */}
              {ejercicio.tipo_pregunta === "numerical" && (
                <div className="flex flex-col gap-3">
                  <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
                    Respuesta numérica
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={respNum.tipo} label="Tipo"
                      onChange={(e) =>
                        setRespNum((r) => ({ ...r, tipo: e.target.value as "exact" | "range" | "precision" }))
                      }
                      sx={{ borderRadius: 2 }}
                    >
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

              {/* Publicado */}
              <div className="flex items-center gap-2">
                <Switch
                  size="small" checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  sx={{ "& .MuiSwitch-thumb": { bgcolor: form.published ? "#4A6D8C" : "#ccc" } }}
                />
                <Typography variant="caption" sx={{ color: "#6793ba" }}>
                  {form.published ? "Publicado" : "No publicado"}
                </Typography>
              </div>

            </div>
          ) : (
            /* ── Vista de lectura ── */
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#3d3d3d" }}>
              {ejercicio.enunciado
                ? <TiptapRenderer>{ejercicio.enunciado}</TiptapRenderer>
                : <span style={{ color: "#8daecb", fontStyle: "italic" }}>Sin enunciado</span>
              }
            </div>
          )}
        </div>

        {/* ── Opciones en vista de lectura ── */}
        {!editando && mostrarOpciones && ejercicio.opciones.length > 0 && (
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
                    width: 12, height: 12, borderRadius: esMultiple ? "3px" : "50%",
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
            </div>
          </>
        )}

        {/* ── Pares en vista de lectura ── */}
        {!editando && ejercicio.tipo_pregunta === "matching" && (ejercicio.pares ?? []).length > 0 && (
          <>
            <Divider sx={{ borderColor: "#f0f0f0" }} />
            <div className="px-5 py-3 flex flex-col gap-1.5">
              {(ejercicio.pares ?? []).map((par, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: "#3d3d3d" }}>
                  <span style={{ fontWeight: 500, color: "#4A6D8C" }}>{par.izquierda}</span>
                  <span style={{ color: "#8daecb" }}>↔</span>
                  <span>{par.derecha}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Numérica en vista de lectura ── */}
        {!editando && ejercicio.tipo_pregunta === "numerical" && ejercicio.respuesta_numerica && (
          <>
            <Divider sx={{ borderColor: "#f0f0f0" }} />
            <div className="px-5 py-3">
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
                Respuesta numérica
              </Typography>
              {ejercicio.respuesta_numerica.tipo === "exact" && (
                <Typography variant="caption" sx={{ color: "#3d3d3d" }}>
                  Valor exacto: <strong>{ejercicio.respuesta_numerica.exacto}</strong>
                  {` ± ${ejercicio.respuesta_numerica.margen}`}
                </Typography>
              )}
              {ejercicio.respuesta_numerica.tipo === "range" && (
                <Typography variant="caption" sx={{ color: "#3d3d3d" }}>
                  Rango: <strong>{ejercicio.respuesta_numerica.minimo}</strong>
                  {" — "}
                  <strong>{ejercicio.respuesta_numerica.maximo}</strong>
                </Typography>
              )}
              {ejercicio.respuesta_numerica.tipo === "precision" && (
                <Typography variant="caption" sx={{ color: "#3d3d3d" }}>
                  Respuesta: <strong>{ejercicio.respuesta_numerica.exacto}</strong>
                  {` (${ejercicio.respuesta_numerica.precision} decimales)`}
                </Typography>
              )}
            </div>
          </>
        )}

        {/* ── Canvas deployments ── */}
        {verDeploys && (
          <div className="animate-slideDown" style={{ borderTop: "0.5px solid #d9e4ee" }}>
            <div className="px-5 py-3">
              <div className="flex items-center gap-1.5 mb-3">
                <QuizIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                <Typography variant="caption" sx={{ color: "#6793ba", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
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
                        fontSize: "0.65rem", height: 22,
                        bgcolor: d.status === "synced" ? "#d1fae5" : d.status === "error" ? "#fee2e2" : "#fef9c3",
                        color:   d.status === "synced" ? "#065f46" : d.status === "error" ? "#991b1b" : "#854d0e",
                      }}
                    />
                    {d.error_msg && (
                      <Typography variant="caption" sx={{ color: "#991b1b", fontSize: "0.62rem" }}>
                        {d.error_msg}
                      </Typography>
                    )}
                    {(d.status === "error" || d.status === "missing") && (
                      <Tooltip title="Reintentar">
                        <IconButton size="small" onClick={() => handleReintentar(d.canvas_curso_id)} sx={{ color: "#4A6D8C" }}>
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