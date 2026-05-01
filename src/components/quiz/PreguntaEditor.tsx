// src/components/quiz/PreguntaEditor.tsx
// Componente de edición para opciones/pares/respuesta numérica de una pregunta.
// Usado en: PreguntaCard (quiz), EjercicioCard (ejercicios), FormPregunta (creación)

import {
  Typography, TextField, Button, IconButton,
  Checkbox, Divider,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "../../store/hooks";
import MathTextEditor from "../CKEditor/MathTextEditor";

export interface IOpcionEditor {
  texto:       string;
  es_correcta: boolean;
}

export interface IParEditor {
  izquierda: string;
  derecha:   string;
}

export interface IRespuestaNumEditor {
  tipo:      "exact" | "range" | "precision";
  exacto:    number;
  margen:    number;
  minimo:    number;
  maximo:    number;
  precision: number;
}

export type TipoPreguntaEditor =
  | "multiple_choice"
  | "multiple_answers"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "numerical";

interface Props {
  tipo:                TipoPreguntaEditor;
  enunciado:           string;
  onEnunciadoChange:   (html: string) => void;
  puntos:              number;
  onPuntosChange:      (n: number) => void;
  opciones:            IOpcionEditor[];
  onOpcionesChange:    (ops: IOpcionEditor[]) => void;
  pares:               IParEditor[];
  onParesChange:       (pares: IParEditor[]) => void;
  respNum:             IRespuestaNumEditor;
  onRespNumChange:     (r: IRespuestaNumEditor) => void;
}

const PreguntaEditor = ({
  tipo,
  enunciado,
  onEnunciadoChange,
  puntos,
  onPuntosChange,
  opciones,
  onOpcionesChange,
  pares,
  onParesChange,
  respNum,
  onRespNumChange,
}: Props) => {
  const siglaCurso  = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");
  const esMultiple  = tipo === "multiple_answers";
  const mostrarOpciones =
    tipo === "multiple_choice" ||
    tipo === "multiple_answers" ||
    tipo === "true_false";
  const esTrueFalse = tipo === "true_false";

  // ── Handlers opciones ──────────────────────────────────────────────────────

  const handleOpcionTexto = (idx: number, texto: string) =>
    onOpcionesChange(opciones.map((op, i) => i === idx ? { ...op, texto } : op));

  const handleOpcionCorrecta = (idx: number) => {
    if (esMultiple) {
      onOpcionesChange(opciones.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op));
    } else {
      onOpcionesChange(opciones.map((op, i) => ({ ...op, es_correcta: i === idx })));
    }
  };

  const agregarOpcion  = () => onOpcionesChange([...opciones, { texto: "", es_correcta: false }]);
  const eliminarOpcion = (idx: number) => onOpcionesChange(opciones.filter((_, i) => i !== idx));

  // ── Handlers pares ─────────────────────────────────────────────────────────

  const handleParIzq = (idx: number, v: string) =>
    onParesChange(pares.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    onParesChange(pares.map((p, i) => i === idx ? { ...p, derecha: v } : p));
  const agregarPar   = () => onParesChange([...pares, { izquierda: "", derecha: "" }]);
  const eliminarPar  = (idx: number) => onParesChange(pares.filter((_, i) => i !== idx));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* ── Enunciado ── */}
      <MathTextEditor
        initialData={enunciado}
        onChange={onEnunciadoChange}
        siglaCurso={siglaCurso}
      />

      {/* ── Puntos ── */}
      <div className="flex items-center gap-2">
        <TextField
          label="Puntos" type="number" value={puntos}
          onChange={(e) => onPuntosChange(Number(e.target.value))}
          size="small"
          sx={{ width: 100, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </div>

      {/* ── Opciones ── */}
      {mostrarOpciones && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
            </Typography>

            {(esTrueFalse
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
                    onChange={() => handleOpcionCorrecta(idx)}
                    size="small" sx={{ color: "#4A6D8C" }}
                  />
                ) : (
                  <input
                    type="radio" name="correcta-editor" checked={op.es_correcta}
                    onChange={() => handleOpcionCorrecta(idx)}
                    style={{ accentColor: "#4A6D8C", flexShrink: 0 }}
                  />
                )}

                {esTrueFalse ? (
                  <Typography variant="body2" sx={{ color: "#3c5770" }}>{op.texto}</Typography>
                ) : (
                  <TextField
                    value={op.texto}
                    onChange={(e) => handleOpcionTexto(idx, e.target.value)}
                    placeholder={`Opción ${idx + 1}`}
                    size="small" fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}

                {!esTrueFalse && (
                  <IconButton size="small" onClick={() => eliminarOpcion(idx)}
                    sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            ))}

            {!esTrueFalse && (
              <Button size="small" startIcon={<AddIcon />} onClick={agregarOpcion}
                sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}>
                Agregar opción
              </Button>
            )}
          </div>
        </>
      )}

      {/* ── Pares ── */}
      {tipo === "matching" && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
        </>
      )}

      {/* ── Respuesta numérica ── */}
      {tipo === "numerical" && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-3">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Respuesta numérica
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={respNum.tipo} label="Tipo"
                onChange={e => onRespNumChange({ ...respNum, tipo: e.target.value as IRespuestaNumEditor["tipo"] })}
                sx={{ borderRadius: 2 }}>
                <MenuItem value="exact">Exacto (con margen)</MenuItem>
                <MenuItem value="range">Rango</MenuItem>
                <MenuItem value="precision">Precisión decimal</MenuItem>
              </Select>
            </FormControl>

            {respNum.tipo === "exact" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Valor exacto" type="number" size="small" value={respNum.exacto}
                  onChange={e => onRespNumChange({ ...respNum, exacto: Number(e.target.value) })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                <TextField label="Margen ±" type="number" size="small" value={respNum.margen}
                  onChange={e => onRespNumChange({ ...respNum, margen: Number(e.target.value) })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </div>
            )}
            {respNum.tipo === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Mínimo" type="number" size="small" value={respNum.minimo}
                  onChange={e => onRespNumChange({ ...respNum, minimo: Number(e.target.value) })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                <TextField label="Máximo" type="number" size="small" value={respNum.maximo}
                  onChange={e => onRespNumChange({ ...respNum, maximo: Number(e.target.value) })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </div>
            )}
            {respNum.tipo === "precision" && (
              <TextField label="Decimales de precisión" type="number" size="small" value={respNum.precision}
                onChange={e => onRespNumChange({ ...respNum, precision: Number(e.target.value) })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default PreguntaEditor;