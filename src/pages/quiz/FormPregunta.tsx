import { useState } from "react";
import {
  Typography, TextField, Button,
  Select, MenuItem, FormControl,
  InputLabel, IconButton,
  CircularProgress, Checkbox,
  Divider,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { crearPregunta }  from "../../store/slices/quiz";
import type { TipoPregunta } from "../../store/slices/quiz";
import MathTextEditor from "../../components/CKEditor/MathTextEditor";

interface Props {
  quiz_id:  string;
  onCreada: () => void;
}

interface IOpcionForm      { texto: string; es_correcta: boolean; }
interface IParForm         { izquierda: string; derecha: string; }
interface IRespuestaNumForm {
  tipo: "exact" | "range" | "precision";
  exacto: number; margen: number;
  minimo: number; maximo: number; precision: number;
}

const TIPOS: { value: TipoPregunta; label: string }[] = [
  { value: "multiple_choice",  label: "Opción múltiple" },
  { value: "multiple_answers", label: "Respuestas múltiples" },
  { value: "true_false",       label: "Verdadero / Falso" },
  { value: "short_answer",     label: "Respuesta corta" },
  { value: "essay",            label: "Ensayo / Desarrollo" },
  { value: "matching",         label: "Coincidencia" },
  { value: "numerical",        label: "Respuesta numérica" },
];

const enunciadoVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

const FormPregunta = ({ quiz_id, onCreada }: Props) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");

  const [tipo,      setTipo]      = useState<TipoPregunta>("multiple_choice");
  const [enunciado, setEnunciado] = useState("");
  const [puntos,    setPuntos]    = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const [opciones, setOpciones] = useState<IOpcionForm[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);
  const [pares, setPares] = useState<IParForm[]>([
    { izquierda: "", derecha: "" },
    { izquierda: "", derecha: "" },
  ]);
  const [respNum, setRespNum] = useState<IRespuestaNumForm>({
    tipo: "exact", exacto: 0, margen: 0, minimo: 0, maximo: 10, precision: 2,
  });

  // ── Handlers opciones ─────────────────────────────────────────
  const handleOpcionTexto    = (idx: number, texto: string) =>
    setOpciones(ops => ops.map((op, i) => i === idx ? { ...op, texto } : op));
  const handleOpcionCorrecta = (idx: number, multiple: boolean) => {
    if (multiple) {
      setOpciones(ops => ops.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op));
    } else {
      setOpciones(ops => ops.map((op, i) => ({ ...op, es_correcta: i === idx })));
    }
  };
  const agregarOpcion  = () => setOpciones(ops => [...ops, { texto: "", es_correcta: false }]);
  const eliminarOpcion = (idx: number) => setOpciones(ops => ops.filter((_, i) => i !== idx));

  // ── Handlers pares ────────────────────────────────────────────
  const handleParIzq = (idx: number, v: string) =>
    setPares(ps => ps.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    setPares(ps => ps.map((p, i) => i === idx ? { ...p, derecha: v } : p));
  const agregarPar   = () => setPares(ps => [...ps, { izquierda: "", derecha: "" }]);
  const eliminarPar  = (idx: number) => setPares(ps => ps.filter((_, i) => i !== idx));

  const handleTipoChange = (t: TipoPregunta) => {
    setTipo(t);
    if (t === "true_false") {
      setOpciones([{ texto: "Verdadero", es_correcta: false }, { texto: "Falso", es_correcta: false }]);
    } else if (t === "multiple_choice" || t === "multiple_answers") {
      setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
    }
  };

  // ── Guardar ───────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (enunciadoVacio(enunciado)) { setError("El enunciado es requerido."); return; }
    setError(null);
    setGuardando(true);

    const payload: Parameters<typeof crearPregunta>[0] = {
      quiz_id, enunciado, tipo, puntos,
    };

    switch (tipo) {
      case "multiple_choice":
      case "multiple_answers":
        payload.opciones = opciones;
        break;
      case "true_false":
        payload.opciones = [
          { texto: "Verdadero", es_correcta: opciones[0]?.es_correcta ?? false },
          { texto: "Falso",     es_correcta: opciones[1]?.es_correcta ?? false },
        ];
        break;
      case "matching":
        payload.pares = pares;
        break;
      case "numerical":
        payload.respuesta_numerica = {
          tipo:      respNum.tipo,
          exacto:    respNum.exacto,
          margen:    respNum.margen,
          minimo:    respNum.minimo,
          maximo:    respNum.maximo,
          precision: respNum.precision,
        };
        break;
    }

    const result = await dispatch(crearPregunta(payload));
    setGuardando(false);
    if (result.ok) {
      setEnunciado("");
      setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
      onCreada();
    } else {
      setError(result.msg ?? "Error al guardar");
    }
  };

  const esMultiple = tipo === "multiple_answers";

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-[#d9e4ee]">
      <Typography variant="subtitle2" sx={{ color: "#4A6D8C", fontWeight: 700 }}>
        Nueva pregunta
      </Typography>

      {/* Tipo + Puntos */}
      <div className="grid grid-cols-2 gap-3">
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de pregunta</InputLabel>
          <Select value={tipo} label="Tipo de pregunta"
            onChange={e => handleTipoChange(e.target.value as TipoPregunta)}
            sx={{ borderRadius: 2 }}>
            {TIPOS.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          label="Puntos" type="number" value={puntos}
          onChange={e => setPuntos(Number(e.target.value))}
          size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </div>

      {/* Enunciado */}
      <div>
        <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
          Enunciado
        </Typography>
        <MathTextEditor
          initialData={enunciado}
          onChange={setEnunciado}
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
      {(tipo === "multiple_choice" || tipo === "multiple_answers" || tipo === "true_false") && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
            {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
          </Typography>

          {(tipo === "true_false"
            ? [
                { texto: "Verdadero", es_correcta: opciones[0]?.es_correcta ?? false },
                { texto: "Falso",     es_correcta: opciones[1]?.es_correcta ?? false },
              ]
            : opciones
          ).map((op, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {esMultiple ? (
                <Checkbox checked={op.es_correcta} onChange={() => handleOpcionCorrecta(idx, true)}
                  size="small" sx={{ color: "#4A6D8C" }} />
              ) : (
                <input type="radio" name="correcta" checked={op.es_correcta}
                  onChange={() => handleOpcionCorrecta(idx, false)}
                  style={{ accentColor: "#4A6D8C", flexShrink: 0 }} />
              )}

              {tipo === "true_false" ? (
                <Typography variant="body2" sx={{ color: "#3c5770" }}>{op.texto}</Typography>
              ) : (
                <TextField
                  value={op.texto}
                  onChange={e => handleOpcionTexto(idx, e.target.value)}
                  placeholder={`Opción ${idx + 1}`}
                  size="small" fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              )}

              {tipo !== "true_false" && (
                <IconButton size="small" onClick={() => eliminarOpcion(idx)}
                  sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </div>
          ))}

          {tipo !== "true_false" && (
            <Button size="small" startIcon={<AddIcon />} onClick={agregarOpcion}
              sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}>
              Agregar opción
            </Button>
          )}
        </div>
      )}

      {/* ── Pares ── */}
      {tipo === "matching" && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
            Pares — término / definición
          </Typography>
          {pares.map((par, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <TextField value={par.izquierda} onChange={e => handleParIzq(idx, e.target.value)}
                placeholder="Término" size="small" fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>↔</Typography>
              <TextField value={par.derecha} onChange={e => handleParDer(idx, e.target.value)}
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
            sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}>
            Agregar par
          </Button>
        </div>
      )}

      {/* ── Respuesta numérica ── */}
      {tipo === "numerical" && (
        <div className="flex flex-col gap-3">
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
            Respuesta numérica
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select value={respNum.tipo} label="Tipo"
              onChange={e => setRespNum(r => ({ ...r, tipo: e.target.value as IRespuestaNumForm["tipo"] }))}
              sx={{ borderRadius: 2 }}>
              <MenuItem value="exact">Exacto (con margen)</MenuItem>
              <MenuItem value="range">Rango</MenuItem>
              <MenuItem value="precision">Precisión decimal</MenuItem>
            </Select>
          </FormControl>

          {respNum.tipo === "exact" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Valor exacto" type="number" size="small" value={respNum.exacto}
                onChange={e => setRespNum(r => ({ ...r, exacto: Number(e.target.value) }))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Margen ±" type="number" size="small" value={respNum.margen}
                onChange={e => setRespNum(r => ({ ...r, margen: Number(e.target.value) }))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
          {respNum.tipo === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Mínimo" type="number" size="small" value={respNum.minimo}
                onChange={e => setRespNum(r => ({ ...r, minimo: Number(e.target.value) }))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Máximo" type="number" size="small" value={respNum.maximo}
                onChange={e => setRespNum(r => ({ ...r, maximo: Number(e.target.value) }))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
          {respNum.tipo === "precision" && (
            <TextField label="Decimales de precisión" type="number" size="small" value={respNum.precision}
              onChange={e => setRespNum(r => ({ ...r, precision: Number(e.target.value) }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          )}
        </div>
      )}

      <Divider />

      {/* ── Acciones ── */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleGuardar} variant="contained" disabled={guardando}
          startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
            boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
          {guardando ? "Guardando..." : "Guardar pregunta"}
        </Button>
      </div>
    </div>
  );
};

export default FormPregunta;