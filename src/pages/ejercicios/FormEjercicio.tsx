import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Checkbox,
  Divider,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { crearEjercicio } from "../../store/slices/ejercicio";
import type {
  TipoPreguntaEjercicio,
  IOpcionEjercicio,
  IParEjercicio,
  IRespuestaNumericaEjercicio,
} from "../../store/slices/ejercicio";
import MathTextEditor from "../../components/CKEditor/MathTextEditor";

const enunciadoVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

const TIPOS: { value: TipoPreguntaEjercicio; label: string }[] = [
  { value: "multiple_choice",  label: "Opción múltiple" },
  { value: "multiple_answers", label: "Respuestas múltiples" },
  { value: "true_false",       label: "Verdadero / Falso" },
  { value: "short_answer",     label: "Respuesta corta" },
  { value: "essay",            label: "Ensayo / Desarrollo" },
  { value: "matching",         label: "Coincidencia" },
  { value: "numerical",        label: "Respuesta numérica" },
];

interface Props {
  capitulo_id: string;
  onCreado:    () => void;
  onCancelar:  () => void;
}

const FormEjercicio = ({ capitulo_id, onCreado, onCancelar }: Props) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");

  const [form, setForm] = useState({
    nombre:        "",
    enunciado:     "",
    tipo_pregunta: "multiple_choice" as TipoPreguntaEjercicio,
    puntos:        1,
    published:     false,
  });

  const [opciones, setOpciones] = useState<IOpcionEjercicio[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);
  const [pares, setPares] = useState<IParEjercicio[]>([
    { izquierda: "", derecha: "" },
    { izquierda: "", derecha: "" },
  ]);
  const [respNum, setRespNum] = useState<IRespuestaNumericaEjercicio>({
    tipo: "exact", exacto: 0, margen: 0, minimo: 0, maximo: 10, precision: 2,
  });

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── Cambio de tipo ────────────────────────────────────────────────────────
  const handleTipoChange = (tipo: TipoPreguntaEjercicio) => {
    setForm((f) => ({ ...f, tipo_pregunta: tipo }));
    if (tipo === "true_false") {
      setOpciones([
        { texto: "Verdadero", es_correcta: false },
        { texto: "Falso",     es_correcta: false },
      ]);
    } else if (tipo === "multiple_choice" || tipo === "multiple_answers") {
      setOpciones([
        { texto: "", es_correcta: false },
        { texto: "", es_correcta: false },
      ]);
    }
  };

  // ── Handlers opciones ─────────────────────────────────────────────────────
  const handleOpcionCorrecta = (idx: number, multiple: boolean) => {
    if (multiple) {
      setOpciones((ops) =>
        ops.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op),
      );
    } else {
      setOpciones((ops) =>
        ops.map((op, i) => ({ ...op, es_correcta: i === idx })),
      );
    }
  };

  // ── Handlers pares ────────────────────────────────────────────────────────
  const handleParIzq = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => i === idx ? { ...p, derecha: v } : p));

  // ── Validación y guardado ─────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!form.nombre.trim() || enunciadoVacio(form.enunciado)) {
      setError("Nombre y enunciado son requeridos");
      return;
    }
    if (
      (form.tipo_pregunta === "multiple_choice" || form.tipo_pregunta === "true_false") &&
      !opciones.some((op) => op.es_correcta)
    ) {
      setError("Debes marcar una opción como correcta");
      return;
    }
    if (
      (form.tipo_pregunta === "multiple_choice" || form.tipo_pregunta === "multiple_answers") &&
      opciones.some((op) => !op.texto.trim())
    ) {
      setError("Todas las opciones deben tener texto");
      return;
    }
    if (
      form.tipo_pregunta === "multiple_answers" &&
      !opciones.some((op) => op.es_correcta)
    ) {
      setError("Debes marcar al menos una opción como correcta");
      return;
    }
    if (
      form.tipo_pregunta === "matching" &&
      pares.some((p) => !p.izquierda.trim() || !p.derecha.trim())
    ) {
      setError("Todos los pares deben tener término y definición");
      return;
    }

    setError(null);
    setGuardando(true);
    await dispatch(
      crearEjercicio({
        capitulo_id,
        ...form,
        opciones,
        pares:              form.tipo_pregunta === "matching"  ? pares   : [],
        respuesta_numerica: form.tipo_pregunta === "numerical" ? respNum : undefined,
      }),
    );
    setGuardando(false);
    onCreado();
  };

  const esMultiple     = form.tipo_pregunta === "multiple_answers";
  const mostrarOpciones =
    form.tipo_pregunta === "multiple_choice"  ||
    form.tipo_pregunta === "multiple_answers" ||
    form.tipo_pregunta === "true_false";

  return (
    <div
      className="rounded-2xl p-5 animate-slideDown"
      style={{ background: "white", border: "1px solid #d9e4ee", boxShadow: "0 4px 16px rgba(74,109,140,0.08)" }}
    >
      <Typography variant="subtitle2" sx={{ color: "#2e4154", mb: 3, fontWeight: 600 }}>
        Nuevo ejercicio
      </Typography>

      <div className="flex flex-col gap-4">

        {/* Nombre */}
        <TextField
          label="Nombre del ejercicio"
          placeholder="ej: Ejercicio 1"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          size="small" fullWidth
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        {/* Tipo + Puntos */}
        <div className="grid grid-cols-2 gap-3">
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de pregunta</InputLabel>
            <Select
              value={form.tipo_pregunta}
              label="Tipo de pregunta"
              onChange={(e) => handleTipoChange(e.target.value as TipoPreguntaEjercicio)}
              sx={{ borderRadius: 2 }}
            >
              {TIPOS.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Puntos" type="number" value={form.puntos}
            onChange={(e) => setForm((f) => ({ ...f, puntos: Number(e.target.value) }))}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </div>

        {/* Enunciado */}
        <div>
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
            Enunciado
          </Typography>
          <MathTextEditor
            initialData={form.enunciado}
            onChange={(html) => setForm((f) => ({ ...f, enunciado: html }))}
            siglaCurso={siglaCurso}
          />
          {error && (
            <Typography variant="caption" sx={{ color: "#ef4444", mt: 0.5, display: "block" }}>
              {error}
            </Typography>
          )}
        </div>

        <Divider />

        {/* ── Opciones ── */}
        {mostrarOpciones && (
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
              {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
            </Typography>

            {(form.tipo_pregunta === "true_false"
              ? [
                  { texto: "Verdadero", es_correcta: opciones[0]?.es_correcta ?? false },
                  { texto: "Falso",     es_correcta: opciones[1]?.es_correcta ?? false },
                ]
              : opciones
            ).map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {esMultiple ? (
                  <Checkbox
                    checked={op.es_correcta}
                    onChange={() => handleOpcionCorrecta(idx, true)}
                    size="small" sx={{ color: "#4A6D8C" }}
                  />
                ) : (
                  <input
                    type="radio" name="correcta" checked={op.es_correcta}
                    onChange={() => handleOpcionCorrecta(idx, false)}
                    style={{ accentColor: "#4A6D8C", flexShrink: 0 }}
                  />
                )}

                {form.tipo_pregunta === "true_false" ? (
                  <Typography variant="body2" sx={{ color: "#3c5770" }}>{op.texto}</Typography>
                ) : (
                  <TextField
                    value={op.texto}
                    onChange={(e) =>
                      setOpciones((ops) =>
                        ops.map((o, i) => i === idx ? { ...o, texto: e.target.value } : o),
                      )
                    }
                    placeholder={`Opción ${idx + 1}`}
                    size="small" fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}

                {(form.tipo_pregunta === "multiple_choice" || form.tipo_pregunta === "multiple_answers") && (
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

            {(form.tipo_pregunta === "multiple_choice" || form.tipo_pregunta === "multiple_answers") && (
              <Button
                size="small" startIcon={<AddIcon />}
                onClick={() => setOpciones((ops) => [...ops, { texto: "", es_correcta: false }])}
                sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}
              >
                Agregar opción
              </Button>
            )}
          </div>
        )}

        {/* ── Pares ── */}
        {form.tipo_pregunta === "matching" && (
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
              Pares — término / definición
            </Typography>
            {pares.map((par, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <TextField
                  value={par.izquierda}
                  onChange={(e) => handleParIzq(idx, e.target.value)}
                  placeholder="Término" size="small" fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>↔</Typography>
                <TextField
                  value={par.derecha}
                  onChange={(e) => handleParDer(idx, e.target.value)}
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
              sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}
            >
              Agregar par
            </Button>
          </div>
        )}

        {/* ── Respuesta numérica ── */}
        {form.tipo_pregunta === "numerical" && (
          <div className="flex flex-col gap-3">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
              Configuración de respuesta numérica
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de respuesta</InputLabel>
              <Select
                value={respNum.tipo} label="Tipo de respuesta"
                onChange={(e) => setRespNum((r) => ({ ...r, tipo: e.target.value as IRespuestaNumericaEjercicio["tipo"] }))}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="exact">Exacto (con margen)</MenuItem>
                <MenuItem value="range">Rango</MenuItem>
                <MenuItem value="precision">Precisión decimal</MenuItem>
              </Select>
            </FormControl>

            {respNum.tipo === "exact" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Valor exacto" type="number" size="small" value={respNum.exacto}
                  onChange={(e) => setRespNum((r) => ({ ...r, exacto: Number(e.target.value) }))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Margen ±" type="number" size="small" value={respNum.margen}
                  onChange={(e) => setRespNum((r) => ({ ...r, margen: Number(e.target.value) }))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </div>
            )}
            {respNum.tipo === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Mínimo" type="number" size="small" value={respNum.minimo}
                  onChange={(e) => setRespNum((r) => ({ ...r, minimo: Number(e.target.value) }))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Máximo" type="number" size="small" value={respNum.maximo}
                  onChange={(e) => setRespNum((r) => ({ ...r, maximo: Number(e.target.value) }))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </div>
            )}
            {respNum.tipo === "precision" && (
              <TextField
                label="Decimales de precisión" type="number" size="small" value={respNum.precision}
                onChange={(e) => setRespNum((r) => ({ ...r, precision: Number(e.target.value) }))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
          </div>
        )}

        {/* ── Publicar ── */}
        <FormControlLabel
          control={
            <Switch
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#4A6D8C" } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "#6793ba" }}>
              Publicar inmediatamente
            </Typography>
          }
        />

        <Divider />

        {/* ── Acciones ── */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancelar} variant="text"
            sx={{ color: "#6793ba", borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar} variant="contained" disabled={guardando}
            startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
              boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
            }}
          >
            {guardando ? "Guardando..." : "Guardar ejercicio"}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default FormEjercicio;