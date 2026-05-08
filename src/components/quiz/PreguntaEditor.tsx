// src/components/quiz/PreguntaEditor.tsx
import {
  Typography, TextField, Button, IconButton,
  Checkbox, Divider, Alert,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "../../store/hooks";
import MathTextEditor from "../CKEditor/MathTextEditor";

export interface IOpcionEditor {
  texto:       string;
  es_correcta: boolean;
  blank_id?:   string | null;
  tipo_pimu?:  string | null;
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

export interface IBlancoEditor {
  blank_id:  string;
  respuesta: string;
  tipoPimu:  string;
}

export interface IDropdownBlancoEditor {
  blank_id: string;
  opciones: { texto: string; es_correcta: boolean }[];
}

export type TipoPreguntaEditor =
  | "multiple_choice"
  | "multiple_answers"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "numerical"
  | "fill_in_multiple_blanks"
  | "multiple_dropdowns"
  | "text_only_question";

// ── Tipos PIMU ────────────────────────────────────────────────────────────────
const TIPOS_PIMU: { value: string; label: string; hint: string }[] = [
  { value: "numero",            label: "Número",            hint: "Ej: 3, -1/3, e, pi" },
  { value: "formula",           label: "Fórmula",           hint: "Ej: -tan(x), x*e^x" },
  { value: "antiderivada",      label: "Antiderivada",      hint: "Ej: x^2/2+C, sin(x)+C" },
  { value: "conjunto",          label: "Conjunto",          hint: "Ej: {1}, {-pi/3,pi/3}" },
  { value: "intervalo",         label: "Intervalo",         hint: "Ej: (-inf,-2), [0,1)" },
  { value: "ecuacion",          label: "Ecuación",          hint: "Ej: y=x+1/2, y=-4x+30" },
  { value: "punto",             label: "Punto",             hint: "Ej: (-1,-1), (5/4,3/4)" },
  { value: "factorizacion",     label: "Factorización",     hint: "Ej: (x+3)(x+2)(x-1)" },
  { value: "formulaN",          label: "Fórmula en n",      hint: "Ej: n^3+4*n" },
  { value: "formulaT",          label: "Fórmula en t",      hint: "Ej: sin(t)/cos(t)" },
  { value: "vector",            label: "Vector",            hint: "Ej: (4,1), (1,0,2)" },
  { value: "conjunto-vectores", label: "Conjunto vectores", hint: "Ej: {(0,0),(1,2)}" },
];

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
  // ── Campos LTI (fill_in_multiple_blanks) ─────────────────────────────────
  blancos?:            IBlancoEditor[];
  onBlancosChange?:    (bs: IBlancoEditor[]) => void;
  // ── Campos dropdown (multiple_dropdowns) ─────────────────────────────────
  dropdownBlancos?:    IDropdownBlancoEditor[];
  onDropdownBlancosChange?: (bs: IDropdownBlancoEditor[]) => void;
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
  blancos = [],
  onBlancosChange,
  dropdownBlancos = [],
  onDropdownBlancosChange,
}: Props) => {
  const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");
  const esMultiple = tipo === "multiple_answers";
  const esFib      = tipo === "fill_in_multiple_blanks";
  const esDropdown = tipo === "multiple_dropdowns";
  const esTexto    = tipo === "text_only_question";

  const mostrarOpciones =
    tipo === "multiple_choice" || tipo === "multiple_answers" || tipo === "true_false";
  const esTrueFalse = tipo === "true_false";

  // ── Handlers opciones ─────────────────────────────────────────────────────
  const handleOpcionTexto     = (idx: number, texto: string) =>
    onOpcionesChange(opciones.map((op, i) => i === idx ? { ...op, texto } : op));
  const handleOpcionCorrecta  = (idx: number) => {
    if (esMultiple) {
      onOpcionesChange(opciones.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op));
    } else {
      onOpcionesChange(opciones.map((op, i) => ({ ...op, es_correcta: i === idx })));
    }
  };
  const agregarOpcion  = () => onOpcionesChange([...opciones, { texto: "", es_correcta: false }]);
  const eliminarOpcion = (idx: number) => onOpcionesChange(opciones.filter((_, i) => i !== idx));

  // ── Handlers pares ────────────────────────────────────────────────────────
  const handleParIzq = (idx: number, v: string) =>
    onParesChange(pares.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    onParesChange(pares.map((p, i) => i === idx ? { ...p, derecha: v } : p));
  const agregarPar   = () => onParesChange([...pares, { izquierda: "", derecha: "" }]);
  const eliminarPar  = (idx: number) => onParesChange(pares.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-4">

      {/* Puntos */}
      <TextField
        label="Puntos" type="number" value={puntos}
        onChange={e => onPuntosChange(Number(e.target.value))}
        size="small"
        sx={{ maxWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
      />

      {/* ── Sección LTI — fill_in_multiple_blanks ── */}
      {esFib && (
        <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Espacios en blanco — validación LTI
          </Typography>
          {blancos.map((b, idx) => {
            const hintBlanco = TIPOS_PIMU.find(t => t.value === b.tipoPimu)?.hint ?? "";
            return (
              <div key={idx} style={{ background: "white", border: "1px solid #d9e4ee", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="caption"
                    sx={{ color: "#4A6D8C", fontWeight: 700, fontFamily: "monospace", background: "#dbeafe", borderRadius: 1, px: 1, py: 0.5, fontSize: 12 }}>
                    [{b.blank_id}]
                  </Typography>
                  <IconButton size="small"
                    onClick={() => onBlancosChange?.(blancos.filter((_, i) => i !== idx))}
                    disabled={blancos.length <= 1}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={b.tipoPimu} label="Tipo"
                      onChange={e => onBlancosChange?.(blancos.map((x, i) => i === idx ? { ...x, tipoPimu: e.target.value } : x))}
                      sx={{ borderRadius: 2, background: "white", fontSize: 13 }}>
                      {TIPOS_PIMU.map(t => (
                        <MenuItem key={t.value} value={t.value} sx={{ fontSize: 13 }}>{t.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    placeholder={hintBlanco || `Respuesta para [${b.blank_id}]`}
                    value={b.respuesta}
                    onChange={e => onBlancosChange?.(blancos.map((x, i) => i === idx ? { ...x, respuesta: e.target.value } : x))}
                    size="small" fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, background: "white" } }}
                  />
                </div>
              </div>
            );
          })}
          <Button size="small" startIcon={<AddIcon />}
            onClick={() => onBlancosChange?.([...blancos, { blank_id: `blanco${blancos.length + 1}`, respuesta: "", tipoPimu: "numero" }])}
            sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}>
            Agregar espacio en blanco
          </Button>
          <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
            Usa [blanco1], [blanco2], etc. en el enunciado donde el alumno debe completar
          </Alert>
        </div>
      )}

      {/* ── Sección dropdown — multiple_dropdowns ── */}
      {esDropdown && (
        <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Listas desplegables por blanco
          </Typography>
          {dropdownBlancos.map((b, bidx) => (
            <div key={bidx} style={{ background: "white", border: "1px solid #d9e4ee", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption"
                  sx={{ color: "#4A6D8C", fontWeight: 700, fontFamily: "monospace", background: "#dbeafe", borderRadius: 1, px: 1, py: 0.5, fontSize: 12 }}>
                  [{b.blank_id}]
                </Typography>
                <IconButton size="small"
                  onClick={() => onDropdownBlancosChange?.(dropdownBlancos.filter((_, i) => i !== bidx))}
                  disabled={dropdownBlancos.length <= 1}
                  sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </div>
              {b.opciones.map((op, oidx) => (
                <div key={oidx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio" name={`dropdown-${bidx}`} checked={op.es_correcta}
                    onChange={() => onDropdownBlancosChange?.(dropdownBlancos.map((x, i) => i !== bidx ? x : {
                      ...x, opciones: x.opciones.map((o, j) => ({ ...o, es_correcta: j === oidx })),
                    }))}
                    style={{ accentColor: "#4A6D8C", flexShrink: 0 }} />
                  <TextField value={op.texto}
                    onChange={e => onDropdownBlancosChange?.(dropdownBlancos.map((x, i) => i !== bidx ? x : {
                      ...x, opciones: x.opciones.map((o, j) => j === oidx ? { ...o, texto: e.target.value } : o),
                    }))}
                    placeholder={`Opción ${oidx + 1}`} size="small" fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                  <IconButton size="small"
                    onClick={() => onDropdownBlancosChange?.(dropdownBlancos.map((x, i) => i !== bidx ? x : {
                      ...x, opciones: x.opciones.filter((_, j) => j !== oidx),
                    }))}
                    disabled={b.opciones.length <= 2}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" }, flexShrink: 0 }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </div>
              ))}
              <Button size="small" startIcon={<AddIcon />}
                onClick={() => onDropdownBlancosChange?.(dropdownBlancos.map((x, i) => i !== bidx ? x : {
                  ...x, opciones: [...x.opciones, { texto: "", es_correcta: false }],
                }))}
                sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none", fontSize: 12 }}>
                Agregar opción
              </Button>
            </div>
          ))}
          <Button size="small" startIcon={<AddIcon />}
            onClick={() => onDropdownBlancosChange?.([...dropdownBlancos, {
              blank_id: `blanco${dropdownBlancos.length + 1}`,
              opciones: [{ texto: "", es_correcta: true }, { texto: "", es_correcta: false }],
            }])}
            sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}>
            Agregar blanco
          </Button>
          <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
            Usa [blanco1], [blanco2], etc. en el enunciado. Cada blanco tendrá su propia lista desplegable.
          </Alert>
        </div>
      )}

      {/* ── Texto informativo para text_only_question ── */}
      {esTexto && (
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>
          Este tipo solo muestra texto — no tiene respuesta. Útil como separador o instrucción.
        </Alert>
      )}

      {/* Enunciado */}
      <div>
        <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
          Enunciado{(esFib || esDropdown) ? " — usa [blanco1], [blanco2], etc. donde corresponda" : ""}
        </Typography>
        <MathTextEditor
          initialData={enunciado}
          onChange={onEnunciadoChange}
          siglaCurso={siglaCurso}
        />
      </div>

      <Divider />

      {/* ── Opciones ── */}
      {mostrarOpciones && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
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
                <Checkbox checked={op.es_correcta} onChange={() => handleOpcionCorrecta(idx)}
                  size="small" sx={{ color: "#4A6D8C" }} />
              ) : (
                <input type="radio" name="correcta" checked={op.es_correcta}
                  onChange={() => handleOpcionCorrecta(idx)}
                  style={{ accentColor: "#4A6D8C", flexShrink: 0 }} />
              )}
              {esTrueFalse ? (
                <Typography variant="body2" sx={{ color: "#1e293b" }}>{op.texto}</Typography>
              ) : (
                <TextField value={op.texto} onChange={e => handleOpcionTexto(idx, e.target.value)}
                  placeholder={`Opción ${idx + 1}`} size="small" fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              )}
              {!esTrueFalse && (
                <IconButton size="small" onClick={() => eliminarOpcion(idx)}
                  disabled={opciones.length <= 2}
                  sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </div>
          ))}
          {!esTrueFalse && (
            <Button size="small" startIcon={<AddIcon />} onClick={agregarOpcion}
              sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}>
              Agregar opción
            </Button>
          )}
        </div>
      )}

      {/* ── Pares matching ── */}
      {tipo === "matching" && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
            Pares — izquierda / derecha
          </Typography>
          {pares.map((par, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <TextField value={par.izquierda} onChange={e => handleParIzq(idx, e.target.value)}
                placeholder="Término" size="small" fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <span style={{ color: "#8daecb", flexShrink: 0 }}>→</span>
              <TextField value={par.derecha} onChange={e => handleParDer(idx, e.target.value)}
                placeholder="Definición" size="small" fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <IconButton size="small" onClick={() => eliminarPar(idx)}
                disabled={pares.length <= 2}
                sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </div>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={agregarPar}
            sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}>
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
          <FormControl size="small" sx={{ maxWidth: 220 }}>
            <InputLabel>Tipo</InputLabel>
            <Select value={respNum.tipo} label="Tipo"
              onChange={e => onRespNumChange({ ...respNum, tipo: e.target.value as "exact" | "range" | "precision" })}
              sx={{ borderRadius: 2 }}>
              <MenuItem value="exact">Exacta (con margen)</MenuItem>
              <MenuItem value="range">Rango</MenuItem>
              <MenuItem value="precision">Precisión decimal</MenuItem>
            </Select>
          </FormControl>
          {respNum.tipo === "exact" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Valor exacto" type="number" value={respNum.exacto}
                onChange={e => onRespNumChange({ ...respNum, exacto: Number(e.target.value) })}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Margen de error" type="number" value={respNum.margen}
                onChange={e => onRespNumChange({ ...respNum, margen: Number(e.target.value) })}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
          {respNum.tipo === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Mínimo" type="number" value={respNum.minimo}
                onChange={e => onRespNumChange({ ...respNum, minimo: Number(e.target.value) })}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Máximo" type="number" value={respNum.maximo}
                onChange={e => onRespNumChange({ ...respNum, maximo: Number(e.target.value) })}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
          {respNum.tipo === "precision" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Valor" type="number" value={respNum.exacto}
                onChange={e => onRespNumChange({ ...respNum, exacto: Number(e.target.value) })}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Decimales significativos" type="number" value={respNum.precision}
                onChange={e => onRespNumChange({ ...respNum, precision: Number(e.target.value) })}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreguntaEditor;