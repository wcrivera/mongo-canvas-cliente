// src/pages/quiz/FormPregunta.tsx
import { useState } from "react";
import {
  Typography, TextField, Button,
  Select, MenuItem, FormControl,
  InputLabel, IconButton,
  CircularProgress, Checkbox,
  Divider, Alert,
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

interface IOpcionForm { texto: string; es_correcta: boolean; }
interface IBlancoForm          { blank_id: string; respuesta: string; tipoPimu: TipoPimu; }
interface IDropdownOpcionForm  { texto: string; es_correcta: boolean; }
interface IDropdownBlancoForm  { blank_id: string; opciones: IDropdownOpcionForm[]; }
interface IParForm    { izquierda: string; derecha: string; }
interface IRespuestaNumForm {
  tipo:      "exact" | "range" | "precision";
  exacto:    number;
  margen:    number;
  minimo:    number;
  maximo:    number;
  precision: number;
}

// ── Tipos Canvas disponibles ──────────────────────────────────────────────────

const TIPOS: { value: TipoPregunta; label: string }[] = [
  { value: "multiple_choice",         label: "Opción múltiple" },
  { value: "multiple_answers",        label: "Respuestas múltiples" },
  { value: "true_false",              label: "Verdadero / Falso" },
  { value: "fill_in_multiple_blanks", label: "Completar respuesta (LTI)" },
  { value: "multiple_dropdowns",        label: "Listas desplegables múltiples" },
  { value: "short_answer",            label: "Respuesta corta" },
  { value: "essay",                   label: "Ensayo / Desarrollo" },
  { value: "matching",                label: "Coincidencia" },
  { value: "numerical",               label: "Respuesta numérica" },
  { value: "text_only_question",      label: "Solo texto (sin respuesta)" },
];

// ── Tipos PIMU para preguntas LTI ─────────────────────────────────────────────

type TipoPimu =
  | "numero"
  | "formula"
  | "antiderivada"
  | "conjunto"
  | "intervalo"
  | "ecuacion"
  | "punto"
  | "factorizacion"
  | "formulaN"
  | "formulaT"
  | "vector"
  | "conjunto-vectores";

const TIPOS_PIMU: { value: TipoPimu; label: string; hint: string }[] = [
  { value: "numero",           label: "Número",            hint: "Ej: 3, -1/3, e, pi" },
  { value: "formula",          label: "Fórmula",           hint: "Ej: -tan(x), x*e^x" },
  { value: "antiderivada",     label: "Antiderivada",      hint: "Ej: x^2/2+C, sin(x)+C" },
  { value: "conjunto",         label: "Conjunto",          hint: "Ej: {1}, {-pi/3,pi/3}" },
  { value: "intervalo",        label: "Intervalo",         hint: "Ej: (-inf,-2), [0,1)" },
  { value: "ecuacion",         label: "Ecuación",          hint: "Ej: y=x+1/2, y=-4x+30" },
  { value: "punto",            label: "Punto",             hint: "Ej: (-1,-1), (5/4,3/4)" },
  { value: "factorizacion",    label: "Factorización",     hint: "Ej: (x+3)(x+2)(x-1)" },
  { value: "formulaN",         label: "Fórmula en n",      hint: "Ej: n^3+4*n" },
  { value: "formulaT",         label: "Fórmula en t",      hint: "Ej: sin(t)/cos(t)" },
  { value: "vector",           label: "Vector",            hint: "Ej: (4,1), (1,0,2)" },
  { value: "conjunto-vectores",label: "Conjunto de vectores", hint: "Ej: {(0,0),(1,2)}" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const enunciadoVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

const HINT_BLANK = "Usa [blanco1], [blanco2], etc. en el enunciado para marcar cada espacio en blanco. Ej: «La derivada de x² es [blanco1] y su integral es [blanco2]»";

// ── Componente ────────────────────────────────────────────────────────────────

const FormPregunta = ({ quiz_id, onCreada }: Props) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");

  const [tipo,         setTipo]        = useState<TipoPregunta>("multiple_choice");
  const [blancos,          setBlancos]          = useState<IBlancoForm[]>([{ blank_id: "blanco1", respuesta: "", tipoPimu: "numero" }]);
  const [dropdownBlancos,  setDropdownBlancos]  = useState<IDropdownBlancoForm[]>([
    { blank_id: "blanco1", opciones: [{ texto: "", es_correcta: true }, { texto: "", es_correcta: false }] },
  ]);
  const [enunciado,    setEnunciado]   = useState("");
  const [puntos,       setPuntos]      = useState(1);
  const [guardando,    setGuardando]   = useState(false);
  const [error,        setError]       = useState<string | null>(null);

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

  // ── Handlers opciones ─────────────────────────────────────────────────────

  const handleOpcionTexto = (idx: number, texto: string) =>
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

  // ── Handlers pares ────────────────────────────────────────────────────────

  const handleParIzq = (idx: number, v: string) =>
    setPares(ps => ps.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
  const handleParDer = (idx: number, v: string) =>
    setPares(ps => ps.map((p, i) => i === idx ? { ...p, derecha: v } : p));
  const agregarPar   = () => setPares(ps => [...ps, { izquierda: "", derecha: "" }]);
  const eliminarPar  = (idx: number) => setPares(ps => ps.filter((_, i) => i !== idx));

  // ── Cambio de tipo ────────────────────────────────────────────────────────

  const handleTipoChange = (t: TipoPregunta) => {
    setTipo(t);
    setError(null);
    if (t === "true_false") {
      setOpciones([{ texto: "Verdadero", es_correcta: false }, { texto: "Falso", es_correcta: false }]);
    } else if (t === "multiple_choice" || t === "multiple_answers") {
      setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
    }
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (enunciadoVacio(enunciado)) { setError("El enunciado es requerido."); return; }

    // Validaciones específicas para fill_in_multiple_blanks
    if (tipo === "fill_in_multiple_blanks") {
      const blancosSinRespuesta = blancos.filter((b) => !b.respuesta.trim());
      if (blancosSinRespuesta.length > 0) {
        setError("Todos los espacios en blanco deben tener una respuesta.");
        return;
      }
      for (const b of blancos) {
        if (!enunciado.includes(`[${b.blank_id}]`)) {
          setError(`El enunciado debe contener [${b.blank_id}] para marcar el espacio en blanco.`);
          return;
        }
      }
    }

    // Validación multiple_dropdowns
    if (tipo === "multiple_dropdowns") {
      for (const b of dropdownBlancos) {
        if (!enunciado.includes(`[${b.blank_id}]`)) {
          setError(`El enunciado debe contener [${b.blank_id}].`); return;
        }
        if (b.opciones.filter((o) => o.texto.trim()).length < 2) {
          setError(`El blanco [${b.blank_id}] debe tener al menos 2 opciones.`); return;
        }
        if (!b.opciones.some((o) => o.es_correcta && o.texto.trim())) {
          setError(`El blanco [${b.blank_id}] debe tener una opción correcta.`); return;
        }
      }
    }

    setError(null);
    setGuardando(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { quiz_id, enunciado, tipo, puntos };

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
      case "fill_in_multiple_blanks":
        // tipo_pimu del primer blanco como valor global (compatibilidad Canvas)
        payload.tipo_pimu = blancos[0]?.tipoPimu ?? "numero";
        payload.opciones  = blancos.map((b) => ({
          texto:       b.respuesta.trim(),
          es_correcta: true,
          blank_id:    b.blank_id,
          tipo_pimu:   b.tipoPimu,
        }));
        break;
      case "multiple_dropdowns":
        // Cada blanco tiene sus opciones, se aplanan en un array con blank_id
        payload.opciones = dropdownBlancos.flatMap((b) =>
          b.opciones
            .filter((o) => o.texto.trim())
            .map((o) => ({ texto: o.texto.trim(), es_correcta: o.es_correcta, blank_id: b.blank_id }))
        );
        break;
      case "text_only_question":
      case "essay":
      case "short_answer":
        // Sin opciones ni respuesta
        break;
    }

    const result = await dispatch(crearPregunta(payload));
    setGuardando(false);
    if (result.ok) {
      setEnunciado("");
      setBlancos([{ blank_id: "blanco1", respuesta: "", tipoPimu: "numero" }]);
      setDropdownBlancos([{ blank_id: "blanco1", opciones: [{ texto: "", es_correcta: true }, { texto: "", es_correcta: false }] }]);
      setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
      onCreada();
    } else {
      setError(result.msg ?? "Error al guardar");
    }
  };

  const esMultiple = tipo === "multiple_answers";
  const esFib      = tipo === "fill_in_multiple_blanks";

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

      {/* ── Sección LTI — solo para fill_in_multiple_blanks ── */}
      {esFib && (
        <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Configuración LTI — validación matemática
          </Typography>

          {/* Blancos dinámicos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 600 }}>
              Espacios en blanco y sus respuestas
            </Typography>
            {blancos.map((b, idx) => {
              const hintBlanco = TIPOS_PIMU.find(t => t.value === b.tipoPimu)?.hint ?? "";
              return (
                <div key={idx} style={{ background: "white", border: "1px solid #d9e4ee", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption"
                      sx={{ color: "#4A6D8C", fontWeight: 700, fontFamily: "monospace",
                        background: "#dbeafe", borderRadius: 1, px: 1, py: 0.5, fontSize: 12 }}>
                      [{b.blank_id}]
                    </Typography>
                    <IconButton size="small"
                      onClick={() => setBlancos(bs => bs.filter((_, i) => i !== idx))}
                      disabled={blancos.length <= 1}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Tipo</InputLabel>
                      <Select value={b.tipoPimu} label="Tipo"
                        onChange={e => setBlancos(bs => bs.map((x, i) => i === idx ? { ...x, tipoPimu: e.target.value as TipoPimu } : x))}
                        sx={{ borderRadius: 2, background: "white", fontSize: 13 }}>
                        {TIPOS_PIMU.map(t => (
                          <MenuItem key={t.value} value={t.value} sx={{ fontSize: 13 }}>
                            {t.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      placeholder={hintBlanco || `Respuesta para [${b.blank_id}]`}
                      value={b.respuesta}
                      onChange={e => setBlancos(bs => bs.map((x, i) => i === idx ? { ...x, respuesta: e.target.value } : x))}
                      size="small" fullWidth
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, background: "white" } }}
                    />
                  </div>
                </div>
              );
            })}
            <Button size="small" startIcon={<AddIcon />}
              onClick={() => setBlancos(bs => [...bs, { blank_id: `blanco${bs.length + 1}`, respuesta: "", tipoPimu: "numero" }])}
              sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}>
              Agregar espacio en blanco
            </Button>
          </div>

          {/* Instrucción sobre los blanks */}
          <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
            {HINT_BLANK}
          </Alert>
        </div>
      )}

      {/* Enunciado */}
      <div>
        <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
          Enunciado{(esFib || tipo === "multiple_dropdowns") ? " — usa [blanco1], [blanco2], etc. donde corresponda" : ""}
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

      {/* ── Listas desplegables múltiples ── */}
      {tipo === "multiple_dropdowns" && (
        <div className="flex flex-col gap-3">
          <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
            Espacios en blanco — define las opciones de cada lista desplegable
          </Typography>
          <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
            Usa [blanco1], [blanco2], etc. en el enunciado. Cada blanco tendrá su propia lista desplegable.
          </Alert>
          {dropdownBlancos.map((b, bidx) => (
            <div key={bidx} style={{ background: "#f0f7ff", border: "1px solid #d9e4ee", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption"
                  sx={{ color: "#4A6D8C", fontWeight: 700, fontFamily: "monospace",
                    background: "#dbeafe", borderRadius: 1, px: 1, py: 0.5, fontSize: 12 }}>
                  [{b.blank_id}]
                </Typography>
                <IconButton size="small"
                  onClick={() => setDropdownBlancos((bs) => bs.filter((_, i) => i !== bidx))}
                  disabled={dropdownBlancos.length <= 1}
                  sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </div>
              {/* Opciones del blanco */}
              {b.opciones.map((op, oidx) => (
                <div key={oidx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio"
                    name={`dropdown-correcta-${bidx}`}
                    checked={op.es_correcta}
                    onChange={() => setDropdownBlancos((bs) => bs.map((x, i) => i !== bidx ? x : {
                      ...x, opciones: x.opciones.map((o, j) => ({ ...o, es_correcta: j === oidx })),
                    }))}
                    style={{ accentColor: "#4A6D8C", flexShrink: 0 }} />
                  <TextField
                    value={op.texto}
                    onChange={(e) => setDropdownBlancos((bs) => bs.map((x, i) => i !== bidx ? x : {
                      ...x, opciones: x.opciones.map((o, j) => j === oidx ? { ...o, texto: e.target.value } : o),
                    }))}
                    placeholder={`Opción ${oidx + 1}`}
                    size="small" fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, background: "white" } }} />
                  <IconButton size="small"
                    onClick={() => setDropdownBlancos((bs) => bs.map((x, i) => i !== bidx ? x : {
                      ...x, opciones: x.opciones.filter((_, j) => j !== oidx),
                    }))}
                    disabled={b.opciones.length <= 2}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" }, flexShrink: 0 }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </div>
              ))}
              <Button size="small" startIcon={<AddIcon />}
                onClick={() => setDropdownBlancos((bs) => bs.map((x, i) => i !== bidx ? x : {
                  ...x, opciones: [...x.opciones, { texto: "", es_correcta: false }],
                }))}
                sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none", fontSize: 12 }}>
                Agregar opción
              </Button>
            </div>
          ))}
          <Button size="small" startIcon={<AddIcon />}
            onClick={() => setDropdownBlancos((bs) => [...bs, {
              blank_id: `blanco${bs.length + 1}`,
              opciones: [{ texto: "", es_correcta: true }, { texto: "", es_correcta: false }],
            }])}
            sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}>
            Agregar blanco
          </Button>
        </div>
      )}

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
                <Typography variant="body2" sx={{ color: "#1e293b" }}>{op.texto}</Typography>
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
                  disabled={opciones.length <= 2}
                  sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </div>
          ))}

          {tipo !== "true_false" && (
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
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select value={respNum.tipo} label="Tipo"
              onChange={e => setRespNum(r => ({ ...r, tipo: e.target.value as "exact" | "range" | "precision" }))}
              sx={{ borderRadius: 2 }}>
              <MenuItem value="exact">Exacta (con margen)</MenuItem>
              <MenuItem value="range">Rango</MenuItem>
              <MenuItem value="precision">Precisión decimal</MenuItem>
            </Select>
          </FormControl>

          {respNum.tipo === "exact" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Valor exacto" type="number" value={respNum.exacto}
                onChange={e => setRespNum(r => ({ ...r, exacto: Number(e.target.value) }))}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Margen de error" type="number" value={respNum.margen}
                onChange={e => setRespNum(r => ({ ...r, margen: Number(e.target.value) }))}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
          {respNum.tipo === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Mínimo" type="number" value={respNum.minimo}
                onChange={e => setRespNum(r => ({ ...r, minimo: Number(e.target.value) }))}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Máximo" type="number" value={respNum.maximo}
                onChange={e => setRespNum(r => ({ ...r, maximo: Number(e.target.value) }))}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
          {respNum.tipo === "precision" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Valor" type="number" value={respNum.exacto}
                onChange={e => setRespNum(r => ({ ...r, exacto: Number(e.target.value) }))}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <TextField label="Decimales significativos" type="number" value={respNum.precision}
                onChange={e => setRespNum(r => ({ ...r, precision: Number(e.target.value) }))}
                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </div>
          )}
        </div>
      )}

      {/* ── Texto informativo para text_only_question ── */}
      {tipo === "text_only_question" && (
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>
          Este tipo solo muestra texto — no tiene respuesta. Útil como separador o instrucción entre preguntas.
        </Alert>
      )}

      {/* ── Botón guardar ── */}
      <Button
        variant="contained" onClick={handleGuardar} disabled={guardando}
        sx={{ alignSelf: "flex-end", borderRadius: 2, px: 4,
          bgcolor: "#2d5be3", "&:hover": { bgcolor: "#1a3cb0" } }}
      >
        {guardando ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Guardar pregunta"}
      </Button>
    </div>
  );
};

export default FormPregunta;

// import { useState } from "react";
// import {
//   Typography, TextField, Button,
//   Select, MenuItem, FormControl,
//   InputLabel, IconButton,
//   CircularProgress, Checkbox,
//   Divider,
// } from "@mui/material";
// import AddIcon    from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { crearPregunta }  from "../../store/slices/quiz";
// import type { TipoPregunta } from "../../store/slices/quiz";
// import MathTextEditor from "../../components/CKEditor/MathTextEditor";

// interface Props {
//   quiz_id:  string;
//   onCreada: () => void;
// }

// interface IOpcionForm      { texto: string; es_correcta: boolean; }
// interface IParForm         { izquierda: string; derecha: string; }
// interface IRespuestaNumForm {
//   tipo: "exact" | "range" | "precision";
//   exacto: number; margen: number;
//   minimo: number; maximo: number; precision: number;
// }

// const TIPOS: { value: TipoPregunta; label: string }[] = [
//   { value: "multiple_choice",  label: "Opción múltiple" },
//   { value: "multiple_answers", label: "Respuestas múltiples" },
//   { value: "true_false",       label: "Verdadero / Falso" },
//   { value: "short_answer",     label: "Respuesta corta" },
//   { value: "essay",            label: "Ensayo / Desarrollo" },
//   { value: "matching",         label: "Coincidencia" },
//   { value: "numerical",        label: "Respuesta numérica" },
// ];

// const enunciadoVacio = (html: string) =>
//   !html || html.replace(/<[^>]*>/g, "").trim() === "";

// const FormPregunta = ({ quiz_id, onCreada }: Props) => {
//   const dispatch   = useAppDispatch();
//   const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");

//   const [tipo,      setTipo]      = useState<TipoPregunta>("multiple_choice");
//   const [enunciado, setEnunciado] = useState("");
//   const [puntos,    setPuntos]    = useState(1);
//   const [guardando, setGuardando] = useState(false);
//   const [error,     setError]     = useState<string | null>(null);

//   const [opciones, setOpciones] = useState<IOpcionForm[]>([
//     { texto: "", es_correcta: false },
//     { texto: "", es_correcta: false },
//   ]);
//   const [pares, setPares] = useState<IParForm[]>([
//     { izquierda: "", derecha: "" },
//     { izquierda: "", derecha: "" },
//   ]);
//   const [respNum, setRespNum] = useState<IRespuestaNumForm>({
//     tipo: "exact", exacto: 0, margen: 0, minimo: 0, maximo: 10, precision: 2,
//   });

//   // ── Handlers opciones ─────────────────────────────────────────
//   const handleOpcionTexto    = (idx: number, texto: string) =>
//     setOpciones(ops => ops.map((op, i) => i === idx ? { ...op, texto } : op));
//   const handleOpcionCorrecta = (idx: number, multiple: boolean) => {
//     if (multiple) {
//       setOpciones(ops => ops.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op));
//     } else {
//       setOpciones(ops => ops.map((op, i) => ({ ...op, es_correcta: i === idx })));
//     }
//   };
//   const agregarOpcion  = () => setOpciones(ops => [...ops, { texto: "", es_correcta: false }]);
//   const eliminarOpcion = (idx: number) => setOpciones(ops => ops.filter((_, i) => i !== idx));

//   // ── Handlers pares ────────────────────────────────────────────
//   const handleParIzq = (idx: number, v: string) =>
//     setPares(ps => ps.map((p, i) => i === idx ? { ...p, izquierda: v } : p));
//   const handleParDer = (idx: number, v: string) =>
//     setPares(ps => ps.map((p, i) => i === idx ? { ...p, derecha: v } : p));
//   const agregarPar   = () => setPares(ps => [...ps, { izquierda: "", derecha: "" }]);
//   const eliminarPar  = (idx: number) => setPares(ps => ps.filter((_, i) => i !== idx));

//   const handleTipoChange = (t: TipoPregunta) => {
//     setTipo(t);
//     if (t === "true_false") {
//       setOpciones([{ texto: "Verdadero", es_correcta: false }, { texto: "Falso", es_correcta: false }]);
//     } else if (t === "multiple_choice" || t === "multiple_answers") {
//       setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
//     }
//   };

//   // ── Guardar ───────────────────────────────────────────────────
//   const handleGuardar = async () => {
//     if (enunciadoVacio(enunciado)) { setError("El enunciado es requerido."); return; }
//     setError(null);
//     setGuardando(true);

//     const payload: Parameters<typeof crearPregunta>[0] = {
//       quiz_id, enunciado, tipo, puntos,
//     };

//     switch (tipo) {
//       case "multiple_choice":
//       case "multiple_answers":
//         payload.opciones = opciones;
//         break;
//       case "true_false":
//         payload.opciones = [
//           { texto: "Verdadero", es_correcta: opciones[0]?.es_correcta ?? false },
//           { texto: "Falso",     es_correcta: opciones[1]?.es_correcta ?? false },
//         ];
//         break;
//       case "matching":
//         payload.pares = pares;
//         break;
//       case "numerical":
//         payload.respuesta_numerica = {
//           tipo:      respNum.tipo,
//           exacto:    respNum.exacto,
//           margen:    respNum.margen,
//           minimo:    respNum.minimo,
//           maximo:    respNum.maximo,
//           precision: respNum.precision,
//         };
//         break;
//     }

//     const result = await dispatch(crearPregunta(payload));
//     setGuardando(false);
//     if (result.ok) {
//       setEnunciado("");
//       setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
//       onCreada();
//     } else {
//       setError(result.msg ?? "Error al guardar");
//     }
//   };

//   const esMultiple = tipo === "multiple_answers";

//   return (
//     <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-[#d9e4ee]">
//       <Typography variant="subtitle2" sx={{ color: "#4A6D8C", fontWeight: 700 }}>
//         Nueva pregunta
//       </Typography>

//       {/* Tipo + Puntos */}
//       <div className="grid grid-cols-2 gap-3">
//         <FormControl size="small" fullWidth>
//           <InputLabel>Tipo de pregunta</InputLabel>
//           <Select value={tipo} label="Tipo de pregunta"
//             onChange={e => handleTipoChange(e.target.value as TipoPregunta)}
//             sx={{ borderRadius: 2 }}>
//             {TIPOS.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
//           </Select>
//         </FormControl>
//         <TextField
//           label="Puntos" type="number" value={puntos}
//           onChange={e => setPuntos(Number(e.target.value))}
//           size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
//         />
//       </div>

//       {/* Enunciado */}
//       <div>
//         <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}>
//           Enunciado
//         </Typography>
//         <MathTextEditor
//           initialData={enunciado}
//           onChange={setEnunciado}
//           siglaCurso={siglaCurso}
//         />
//         {error && (
//           <Typography variant="caption" sx={{ color: "#ef4444", mt: 0.5, display: "block" }}>
//             {error}
//           </Typography>
//         )}
//       </div>

//       <Divider />

//       {/* ── Opciones ── */}
//       {(tipo === "multiple_choice" || tipo === "multiple_answers" || tipo === "true_false") && (
//         <div className="flex flex-col gap-2">
//           <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
//             {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
//           </Typography>

//           {(tipo === "true_false"
//             ? [
//                 { texto: "Verdadero", es_correcta: opciones[0]?.es_correcta ?? false },
//                 { texto: "Falso",     es_correcta: opciones[1]?.es_correcta ?? false },
//               ]
//             : opciones
//           ).map((op, idx) => (
//             <div key={idx} className="flex items-center gap-2">
//               {esMultiple ? (
//                 <Checkbox checked={op.es_correcta} onChange={() => handleOpcionCorrecta(idx, true)}
//                   size="small" sx={{ color: "#4A6D8C" }} />
//               ) : (
//                 <input type="radio" name="correcta" checked={op.es_correcta}
//                   onChange={() => handleOpcionCorrecta(idx, false)}
//                   style={{ accentColor: "#4A6D8C", flexShrink: 0 }} />
//               )}

//               {tipo === "true_false" ? (
//                 <Typography variant="body2" sx={{ color: "#3c5770" }}>{op.texto}</Typography>
//               ) : (
//                 <TextField
//                   value={op.texto}
//                   onChange={e => handleOpcionTexto(idx, e.target.value)}
//                   placeholder={`Opción ${idx + 1}`}
//                   size="small" fullWidth
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
//                 />
//               )}

//               {tipo !== "true_false" && (
//                 <IconButton size="small" onClick={() => eliminarOpcion(idx)}
//                   sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}>
//                   <DeleteIcon fontSize="small" />
//                 </IconButton>
//               )}
//             </div>
//           ))}

//           {tipo !== "true_false" && (
//             <Button size="small" startIcon={<AddIcon />} onClick={agregarOpcion}
//               sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}>
//               Agregar opción
//             </Button>
//           )}
//         </div>
//       )}

//       {/* ── Pares ── */}
//       {tipo === "matching" && (
//         <div className="flex flex-col gap-2">
//           <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
//             Pares — término / definición
//           </Typography>
//           {pares.map((par, idx) => (
//             <div key={idx} className="flex items-center gap-2">
//               <TextField value={par.izquierda} onChange={e => handleParIzq(idx, e.target.value)}
//                 placeholder="Término" size="small" fullWidth
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//               <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>↔</Typography>
//               <TextField value={par.derecha} onChange={e => handleParDer(idx, e.target.value)}
//                 placeholder="Definición" size="small" fullWidth
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//               {pares.length > 2 && (
//                 <IconButton size="small" onClick={() => eliminarPar(idx)}
//                   sx={{ color: "#c9dae8", "&:hover": { color: "#ef4444" } }}>
//                   <DeleteIcon fontSize="small" />
//                 </IconButton>
//               )}
//             </div>
//           ))}
//           <Button size="small" startIcon={<AddIcon />} onClick={agregarPar}
//             sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}>
//             Agregar par
//           </Button>
//         </div>
//       )}

//       {/* ── Respuesta numérica ── */}
//       {tipo === "numerical" && (
//         <div className="flex flex-col gap-3">
//           <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
//             Respuesta numérica
//           </Typography>
//           <FormControl size="small" fullWidth>
//             <InputLabel>Tipo</InputLabel>
//             <Select value={respNum.tipo} label="Tipo"
//               onChange={e => setRespNum(r => ({ ...r, tipo: e.target.value as IRespuestaNumForm["tipo"] }))}
//               sx={{ borderRadius: 2 }}>
//               <MenuItem value="exact">Exacto (con margen)</MenuItem>
//               <MenuItem value="range">Rango</MenuItem>
//               <MenuItem value="precision">Precisión decimal</MenuItem>
//             </Select>
//           </FormControl>

//           {respNum.tipo === "exact" && (
//             <div className="grid grid-cols-2 gap-3">
//               <TextField label="Valor exacto" type="number" size="small" value={respNum.exacto}
//                 onChange={e => setRespNum(r => ({ ...r, exacto: Number(e.target.value) }))}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//               <TextField label="Margen ±" type="number" size="small" value={respNum.margen}
//                 onChange={e => setRespNum(r => ({ ...r, margen: Number(e.target.value) }))}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//             </div>
//           )}
//           {respNum.tipo === "range" && (
//             <div className="grid grid-cols-2 gap-3">
//               <TextField label="Mínimo" type="number" size="small" value={respNum.minimo}
//                 onChange={e => setRespNum(r => ({ ...r, minimo: Number(e.target.value) }))}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//               <TextField label="Máximo" type="number" size="small" value={respNum.maximo}
//                 onChange={e => setRespNum(r => ({ ...r, maximo: Number(e.target.value) }))}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//             </div>
//           )}
//           {respNum.tipo === "precision" && (
//             <TextField label="Decimales de precisión" type="number" size="small" value={respNum.precision}
//               onChange={e => setRespNum(r => ({ ...r, precision: Number(e.target.value) }))}
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
//           )}
//         </div>
//       )}

//       <Divider />

//       {/* ── Acciones ── */}
//       <div className="flex justify-end gap-2">
//         <Button onClick={handleGuardar} variant="contained" disabled={guardando}
//           startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
//           sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
//             boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
//           {guardando ? "Guardando..." : "Guardar pregunta"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default FormPregunta;