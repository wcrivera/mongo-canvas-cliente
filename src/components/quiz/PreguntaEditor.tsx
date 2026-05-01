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
import { CKEditorField } from "../CKEditor";

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
  const esMultiple      = tipo === "multiple_answers";
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
      <CKEditorField
        initialContent={enunciado}
        onChange={onEnunciadoChange}
        placeholder="Escribe el enunciado de la pregunta..."
        minHeight="160px"
      />

      {/* ── Puntos ── */}
      <div className="flex items-center gap-2">
        <TextField
          label="Puntos"
          type="number"
          value={puntos}
          onChange={(e) => onPuntosChange(Number(e.target.value))}
          size="small"
          sx={{ width: 100, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </div>

      {/* ── Opciones (multiple_choice, multiple_answers, true_false) ── */}
      {mostrarOpciones && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {esMultiple ? "Respuestas correctas (puede haber varias)" : "Opciones (marca la correcta)"}
            </Typography>
            {opciones.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Checkbox
                  size="small"
                  checked={op.es_correcta}
                  onChange={() => handleOpcionCorrecta(idx)}
                  sx={{ color: "#8daecb", "&.Mui-checked": { color: "#4A6D8C" }, p: 0.5 }}
                />
                <TextField
                  value={op.texto}
                  onChange={(e) => handleOpcionTexto(idx, e.target.value)}
                  size="small"
                  fullWidth
                  placeholder={`Opción ${idx + 1}`}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem" } }}
                />
                {!esTrueFalse && opciones.length > 2 && (
                  <IconButton
                    size="small"
                    onClick={() => eliminarOpcion(idx)}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            ))}
            {!esTrueFalse && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={agregarOpcion}
                sx={{ color: "#8daecb", alignSelf: "flex-start", "&:hover": { color: "#4A6D8C" } }}
              >
                Agregar opción
              </Button>
            )}
          </div>
        </>
      )}

      {/* ── Matching ── */}
      {tipo === "matching" && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Pares de coincidencia
            </Typography>
            {pares.map((par, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <TextField
                  value={par.izquierda}
                  onChange={(e) => handleParIzq(idx, e.target.value)}
                  size="small"
                  placeholder="Término"
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem" } }}
                />
                <span style={{ color: "#8daecb", fontSize: 18 }}>↔</span>
                <TextField
                  value={par.derecha}
                  onChange={(e) => handleParDer(idx, e.target.value)}
                  size="small"
                  placeholder="Definición"
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem" } }}
                />
                {pares.length > 2 && (
                  <IconButton
                    size="small"
                    onClick={() => eliminarPar(idx)}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={agregarPar}
              sx={{ color: "#8daecb", alignSelf: "flex-start", "&:hover": { color: "#4A6D8C" } }}
            >
              Agregar par
            </Button>
          </div>
        </>
      )}

      {/* ── Numérica ── */}
      {tipo === "numerical" && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-3">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Respuesta numérica
            </Typography>
            <FormControl size="small" sx={{ maxWidth: 200 }}>
              <InputLabel>Tipo de respuesta</InputLabel>
              <Select
                value={respNum.tipo}
                label="Tipo de respuesta"
                onChange={(e) => onRespNumChange({ ...respNum, tipo: e.target.value as "exact" | "range" | "precision" })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="exact">Exacto con margen</MenuItem>
                <MenuItem value="range">Rango</MenuItem>
                <MenuItem value="precision">Precisión decimal</MenuItem>
              </Select>
            </FormControl>

            {respNum.tipo === "exact" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Respuesta exacta"
                  type="number"
                  value={respNum.exacto}
                  onChange={(e) => onRespNumChange({ ...respNum, exacto: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Margen de error ±"
                  type="number"
                  value={respNum.margen}
                  onChange={(e) => onRespNumChange({ ...respNum, margen: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </div>
            )}

            {respNum.tipo === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Mínimo"
                  type="number"
                  value={respNum.minimo}
                  onChange={(e) => onRespNumChange({ ...respNum, minimo: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Máximo"
                  type="number"
                  value={respNum.maximo}
                  onChange={(e) => onRespNumChange({ ...respNum, maximo: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </div>
            )}

            {respNum.tipo === "precision" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Respuesta exacta"
                  type="number"
                  value={respNum.exacto}
                  onChange={(e) => onRespNumChange({ ...respNum, exacto: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Decimales requeridos"
                  type="number"
                  value={respNum.precision}
                  onChange={(e) => onRespNumChange({ ...respNum, precision: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Short answer / Essay — sin campos adicionales ── */}
      {(tipo === "short_answer" || tipo === "essay") && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: "#f0f4f8", border: "1px solid #d9e4ee" }}
          >
            <Typography variant="caption" sx={{ color: "#6793ba", fontStyle: "italic" }}>
              {tipo === "short_answer"
                ? "El estudiante ingresará una respuesta corta de texto libre"
                : "El estudiante redactará un ensayo o desarrollo largo"}
            </Typography>
          </div>
        </>
      )}

    </div>
  );
};

export default PreguntaEditor;