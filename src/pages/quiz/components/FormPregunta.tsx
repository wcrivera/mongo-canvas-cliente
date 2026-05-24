// src/pages/quiz/FormPregunta.tsx
import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Checkbox,
  Divider,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { crearPregunta } from "../../../store/slices/quiz";
import type { TipoPregunta } from "../../../store/slices/quiz";
import MathTextEditor from "../../../components/CKEditor/MathTextEditor";
import SM from "./SM";

interface Props {
  quiz_id: string;
  onCreada: () => void;
}

interface IOpcionForm {
  texto: string;
  es_correcta: boolean;
}

interface IItemFIBForm {
  id: string;
  enunciado: string;
  respuesta: string;
  tipoPimu: TipoPimu;
}
interface IDropdownOpcionForm {
  texto: string;
  es_correcta: boolean;
}
interface IDropdownBlancoForm {
  blank_id: string;
  opciones: IDropdownOpcionForm[];
}
interface IParForm {
  izquierda: string;
  derecha: string;
}
interface IRespuestaNumForm {
  tipo: "exact" | "range" | "precision";
  exacto: number;
  margen: number;
  minimo: number;
  maximo: number;
  precision: number;
}

// ── Tipos Canvas ──────────────────────────────────────────────────────────────

const TIPOS: { value: TipoPregunta; label: string }[] = [
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "multiple_answers", label: "Respuestas múltiples" },
  { value: "true_false", label: "Verdadero / Falso" },
  { value: "fill_in_multiple_blanks", label: "Completar respuesta (LTI)" },
  { value: "multiple_dropdowns", label: "Listas desplegables múltiples" },
  { value: "short_answer", label: "Respuesta corta" },
  { value: "essay", label: "Ensayo / Desarrollo" },
  { value: "matching", label: "Coincidencia" },
  { value: "numerical", label: "Respuesta numérica" },
  { value: "text_only_question", label: "Solo texto (sin respuesta)" },
];

// ── Tipos PIMU ────────────────────────────────────────────────────────────────

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
  { value: "numero", label: "Número", hint: "Ej: 3, -1/3, e, pi" },
  { value: "formula", label: "Fórmula", hint: "Ej: -tan(x), x*e^x" },
  {
    value: "antiderivada",
    label: "Antiderivada",
    hint: "Ej: x^2/2+C, sin(x)+C",
  },
  { value: "conjunto", label: "Conjunto", hint: "Ej: {1}, {-pi/3,pi/3}" },
  { value: "intervalo", label: "Intervalo", hint: "Ej: (-inf,-2), [0,1)" },
  { value: "ecuacion", label: "Ecuación", hint: "Ej: y=x+1/2, y=-4x+30" },
  { value: "punto", label: "Punto", hint: "Ej: (-1,-1), (5/4,3/4)" },
  {
    value: "factorizacion",
    label: "Factorización",
    hint: "Ej: (x+3)(x+2)(x-1)",
  },
  { value: "formulaN", label: "Fórmula en n", hint: "Ej: n^3+4*n" },
  { value: "formulaT", label: "Fórmula en t", hint: "Ej: sin(t)/cos(t)" },
  { value: "vector", label: "Vector", hint: "Ej: (4,1), (1,0,2)" },
  {
    value: "conjunto-vectores",
    label: "Conjunto de vectores",
    hint: "Ej: {(0,0),(1,2)}",
  },
];

const enunciadoVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

// ── Componente ────────────────────────────────────────────────────────────────

const FormPregunta = ({ quiz_id, onCreada }: Props) => {
  const dispatch = useAppDispatch();
  const siglaCurso = useAppSelector(
    (s) => s.mongoCurso.cursoActivo?.codigo ?? "",
  );

  const [tipo, setTipo] = useState<TipoPregunta>("multiple_choice");
  const [enunciado, setEnunciado] = useState("");
  const [puntos, setPuntos] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Estado según tipo ─────────────────────────────────────────────────────

  const [opciones, setOpciones] = useState<IOpcionForm[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);
  const [pares, setPares] = useState<IParForm[]>([
    { izquierda: "", derecha: "" },
    { izquierda: "", derecha: "" },
  ]);
  const [respNum, setRespNum] = useState<IRespuestaNumForm>({
    tipo: "exact",
    exacto: 0,
    margen: 0,
    minimo: 0,
    maximo: 10,
    precision: 2,
  });

  // ── FIB nuevo schema: items[] + columnas + enunciado_contexto ─────────────
  const [items, setItems] = useState<IItemFIBForm[]>([
    { id: "blanco1", enunciado: "", respuesta: "", tipoPimu: "numero" },
  ]);
  const [columnas, setColumnas] = useState<1 | 2 | 3>(1);

  // ── Dropdown blancos ──────────────────────────────────────────────────────
  const [dropdownBlancos, setDropdownBlancos] = useState<IDropdownBlancoForm[]>(
    [
      {
        blank_id: "blanco1",
        opciones: [
          { texto: "", es_correcta: true },
          { texto: "", es_correcta: false },
        ],
      },
    ],
  );

  // ── Handlers opciones ─────────────────────────────────────────────────────


  const handleOpcionCorrecta = (idx: number, multiple: boolean) => {
    if (multiple) {
      setOpciones((ops) =>
        ops.map((op, i) =>
          i === idx ? { ...op, es_correcta: !op.es_correcta } : op,
        ),
      );
    } else {
      setOpciones((ops) =>
        ops.map((op, i) => ({ ...op, es_correcta: i === idx })),
      );
    }
  };


  // ── Handlers items FIB ────────────────────────────────────────────────────

  const agregarItem = () => {
    const n = items.length + 1;
    setItems((prev) => [
      ...prev,
      { id: `blanco${n}`, enunciado: "", respuesta: "", tipoPimu: "numero" },
    ]);
  };
  const eliminarItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((it, i) => ({ ...it, id: `blanco${i + 1}` })),
    );
  };
  const updateItem = (idx: number, field: keyof IItemFIBForm, val: string) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
    );

  // ── Handlers pares ────────────────────────────────────────────────────────

  const handleParIzq = (idx: number, v: string) =>
    setPares((ps) =>
      ps.map((p, i) => (i === idx ? { ...p, izquierda: v } : p)),
    );
  const handleParDer = (idx: number, v: string) =>
    setPares((ps) => ps.map((p, i) => (i === idx ? { ...p, derecha: v } : p)));
  const agregarPar = () =>
    setPares((ps) => [...ps, { izquierda: "", derecha: "" }]);
  const eliminarPar = (idx: number) =>
    setPares((ps) => ps.filter((_, i) => i !== idx));

  // ── Cambio de tipo ────────────────────────────────────────────────────────

  const handleTipoChange = (t: TipoPregunta) => {
    setTipo(t);
    setError(null);
    if (t === "true_false") {
      setOpciones([
        { texto: "Verdadero", es_correcta: false },
        { texto: "Falso", es_correcta: false },
      ]);
    } else if (t === "multiple_choice" || t === "multiple_answers") {
      setOpciones([
        { texto: "", es_correcta: false },
        { texto: "", es_correcta: false },
      ]);
    }
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (enunciadoVacio(enunciado)) {
      setError("El enunciado es requerido.");
      return;
    }

    // Validación FIB — items[]
    if (tipo === "fill_in_multiple_blanks") {
      if (items.some((it) => !it.respuesta.trim())) {
        setError("Todos los ítems deben tener una respuesta.");
        return;
      }
    }

    // Validación multiple_dropdowns
    if (tipo === "multiple_dropdowns") {
      for (const b of dropdownBlancos) {
        if (!enunciado.includes(`[${b.blank_id}]`)) {
          setError(`El enunciado debe contener [${b.blank_id}].`);
          return;
        }
        if (b.opciones.filter((o) => o.texto.trim()).length < 2) {
          setError(`El blanco [${b.blank_id}] debe tener al menos 2 opciones.`);
          return;
        }
        if (!b.opciones.some((o) => o.es_correcta && o.texto.trim())) {
          setError(`El blanco [${b.blank_id}] debe tener una opción correcta.`);
          return;
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
          {
            texto: "Verdadero",
            es_correcta: opciones[0]?.es_correcta ?? false,
          },
          { texto: "Falso", es_correcta: opciones[1]?.es_correcta ?? false },
        ];
        break;
      case "matching":
        payload.pares = pares;
        break;
      case "numerical":
        payload.respuesta_numerica = { ...respNum };
        break;

      case "fill_in_multiple_blanks":
        // ── NUEVO SCHEMA: items[] + columnas + enunciado_contexto ──────────
        payload.enunciado_contexto = enunciado;
        payload.items = items.map((it) => ({
          id: it.id,
          enunciado: it.enunciado.trim(),
          respuesta: it.respuesta.trim(),
          tipo_pimu: it.tipoPimu,
        }));
        payload.columnas = columnas;
        payload.tipo_pimu = items[0]?.tipoPimu ?? "numero";
        // Sincronizar opciones[] para compatibilidad Canvas
        payload.opciones = items.map((it) => ({
          texto: it.respuesta.trim(),
          es_correcta: true,
          blank_id: it.id,
          tipo_pimu: it.tipoPimu,
        }));
        break;

      case "multiple_dropdowns":
        payload.opciones = dropdownBlancos.flatMap((b) =>
          b.opciones
            .filter((o) => o.texto.trim())
            .map((o) => ({
              texto: o.texto.trim(),
              es_correcta: o.es_correcta,
              blank_id: b.blank_id,
            })),
        );
        break;
    }

    const result = (await dispatch(crearPregunta(payload))) as unknown as {
      ok: boolean;
      msg?: string;
    };
    setGuardando(false);

    if (result.ok) {
      // Resetear estado
      setEnunciado("");
      setOpciones([
        { texto: "", es_correcta: false },
        { texto: "", es_correcta: false },
      ]);
      setItems([
        { id: "blanco1", enunciado: "", respuesta: "", tipoPimu: "numero" },
      ]);
      setColumnas(1);
      onCreada();
    } else {
      setError(result.msg ?? "Error al guardar");
    }
  };

  const esMultiple = tipo === "multiple_answers";
  const esFib = tipo === "fill_in_multiple_blanks";

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-[#d9e4ee]">
      <Typography
        variant="subtitle2"
        sx={{ color: "#4A6D8C", fontWeight: 700 }}
      >
        Nueva pregunta
      </Typography>

      {/* Tipo + Puntos */}
      <div className="grid grid-cols-2 gap-3">
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de pregunta</InputLabel>
          <Select
            value={tipo}
            label="Tipo de pregunta"
            onChange={(e) => handleTipoChange(e.target.value as TipoPregunta)}
            sx={{ borderRadius: 2 }}
          >
            {TIPOS.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Puntos"
          type="number"
          value={puntos}
          onChange={(e) => setPuntos(Number(e.target.value))}
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </div>

      {/* ── Configuración FIB — nuevo schema items[] ── */}
      {esFib && (
        <div
          style={{
            background: "#f0f7ff",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#4A6D8C",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Configuración LTI — validación matemática
          </Typography>

          {/* Columnas del grid */}
          <div className="flex items-center gap-3">
            <Typography
              variant="caption"
              sx={{ color: "#4A6D8C", fontWeight: 600, minWidth: 60 }}
            >
              Columnas:
            </Typography>
            {([1, 2, 3] as (1 | 2 | 3)[]).map((n) => (
              <Button
                key={n}
                size="small"
                variant={columnas === n ? "contained" : "outlined"}
                onClick={() => setColumnas(n)}
                sx={{
                  minWidth: 36,
                  height: 28,
                  borderRadius: 1.5,
                  fontSize: 12,
                  ...(columnas === n
                    ? {
                        bgcolor: "#4A6D8C",
                        "&:hover": { bgcolor: "#3c5770" },
                        boxShadow: "none",
                      }
                    : { borderColor: "#8daecb", color: "#4A6D8C" }),
                }}
              >
                {n}
              </Button>
            ))}
          </div>

          {/* Lista de ítems */}
          <Typography
            variant="caption"
            sx={{ color: "#4A6D8C", fontWeight: 600 }}
          >
            Ítems y sus respuestas esperadas
          </Typography>

          {items.map((item, idx) => {
            const hint =
              TIPOS_PIMU.find((t) => t.value === item.tipoPimu)?.hint ?? "";
            return (
              <div
                key={item.id}
                style={{
                  background: "white",
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: "1px solid #d9e4ee",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <Typography
                    variant="caption"
                    sx={{ color: "#2d5be3", fontWeight: 700, fontSize: 12 }}
                  >
                    [{item.id}]
                  </Typography>
                  {items.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => eliminarItem(idx)}
                      sx={{ color: "#ef4444" }}
                    >
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                </div>

                {/* Enunciado del ítem */}
                <TextField
                  label="Enunciado del ítem (opcional, LaTeX permitido)"
                  value={item.enunciado}
                  onChange={(e) => updateItem(idx, "enunciado", e.target.value)}
                  size="small"
                  fullWidth
                  multiline
                  minRows={1}
                  placeholder="Dejar vacío para usar el enunciado general"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "white",
                    },
                  }}
                />

                {/* Tipo + respuesta */}
                <div className="flex gap-2">
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={item.tipoPimu}
                      label="Tipo"
                      onChange={(e) =>
                        updateItem(idx, "tipoPimu", e.target.value)
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      {TIPOS_PIMU.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Respuesta esperada"
                    value={item.respuesta}
                    onChange={(e) =>
                      updateItem(idx, "respuesta", e.target.value)
                    }
                    placeholder={hint}
                    size="small"
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "white",
                      },
                    }}
                  />
                </div>
              </div>
            );
          })}

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={agregarItem}
            sx={{
              color: "#4A6D8C",
              alignSelf: "flex-start",
              textTransform: "none",
            }}
          >
            Agregar ítem
          </Button>

          <Alert
            severity="info"
            sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}
          >
            El enunciado general va en el editor de abajo. Cada ítem puede tener
            su propio enunciado (si lo dejas vacío, se usa el general). Los
            ítems se muestran en un grid de {columnas} columna
            {columnas !== 1 ? "s" : ""}.
          </Alert>
        </div>
      )}

      {/* ── Enunciado general ── */}
      {/* <div>
        <Typography
          variant="caption"
          sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}
        >
          {esFib
            ? "Enunciado de contexto (texto introductorio sobre los ítems)"
            : "Enunciado"}
          {tipo === "multiple_dropdowns"
            ? " — usa [blanco1], [blanco2], etc. donde corresponda"
            : ""}
        </Typography>
        <MathTextEditor
          initialData={enunciado}
          onChange={setEnunciado}
          siglaCurso={siglaCurso}
        />
        {error && (
          <Typography
            variant="caption"
            sx={{ color: "#ef4444", mt: 0.5, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </div> */}

      <Divider />

      {/* ── Opciones (multiple_choice / multiple_answers / true_false) ── */}
      {(tipo === "multiple_choice" || tipo === "multiple_answers") && 
      <SM />
      // (
      //   <div className="flex flex-col gap-2">
      //     <Typography
      //       variant="caption"
      //       sx={{ color: "#6793ba", fontWeight: 600 }}
      //     >
      //       Opciones{" "}
      //       {esMultiple
      //         ? "(selecciona todas las correctas)"
      //         : "(selecciona la correcta)"}
      //     </Typography>
      //     {opciones.map((op, idx) => (
      //       <div key={idx} className="flex items-center gap-2">
      //         <Checkbox
      //           checked={op.es_correcta}
      //           size="small"
      //           onChange={() => handleOpcionCorrecta(idx, esMultiple)}
      //           sx={{ color: "#8daecb", "&.Mui-checked": { color: "#2d5be3" } }}
      //         />
      //         <TextField
      //           value={op.texto}
      //           onChange={(e) => handleOpcionTexto(idx, e.target.value)}
      //           placeholder={`Opción ${idx + 1}`}
      //           size="small"
      //           fullWidth
      //           sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
      //         />
      //         {opciones.length > 2 && (
      //           <IconButton
      //             size="small"
      //             onClick={() => eliminarOpcion(idx)}
      //             sx={{ color: "#ef4444" }}
      //           >
      //             <DeleteIcon fontSize="small" />
      //           </IconButton>
      //         )}
      //       </div>
      //     ))}
      //     <Button
      //       size="small"
      //       startIcon={<AddIcon />}
      //       onClick={agregarOpcion}
      //       sx={{
      //         color: "#4A6D8C",
      //         alignSelf: "flex-start",
      //         textTransform: "none",
      //       }}
      //     >
      //       Agregar opción
      //     </Button>
      //   </div>
      // )
      }

      {/* ── Verdadero / Falso ── */}
      {tipo === "true_false" && (
        <div className="flex flex-col gap-2">
          <Typography
            variant="caption"
            sx={{ color: "#6793ba", fontWeight: 600 }}
          >
            Respuesta correcta
          </Typography>
          {["Verdadero", "Falso"].map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <Checkbox
                checked={opciones[idx]?.es_correcta ?? false}
                size="small"
                onChange={() => handleOpcionCorrecta(idx, false)}
                sx={{ color: "#8daecb", "&.Mui-checked": { color: "#2d5be3" } }}
              />
              <Typography variant="body2" sx={{ color: "#374151" }}>
                {label}
              </Typography>
            </div>
          ))}
        </div>
      )}

      {/* ── Coincidencia ── */}
      {tipo === "matching" && (
        <div className="flex flex-col gap-2">
          <Typography
            variant="caption"
            sx={{ color: "#6793ba", fontWeight: 600 }}
          >
            Pares de coincidencia
          </Typography>
          {pares.map((par, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <TextField
                value={par.izquierda}
                onChange={(e) => handleParIzq(idx, e.target.value)}
                placeholder="Izquierda"
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>
                →
              </Typography>
              <TextField
                value={par.derecha}
                onChange={(e) => handleParDer(idx, e.target.value)}
                placeholder="Derecha"
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              {pares.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => eliminarPar(idx)}
                  sx={{ color: "#ef4444" }}
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
            sx={{
              color: "#4A6D8C",
              alignSelf: "flex-start",
              textTransform: "none",
            }}
          >
            Agregar par
          </Button>
        </div>
      )}

      {/* ── Respuesta numérica ── */}
      {tipo === "numerical" && (
        <div className="flex flex-col gap-3">
          <Typography
            variant="caption"
            sx={{ color: "#6793ba", fontWeight: 600 }}
          >
            Respuesta numérica
          </Typography>
          <FormControl size="small" sx={{ maxWidth: 200 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={respNum.tipo}
              label="Tipo"
              onChange={(e) =>
                setRespNum((r) => ({
                  ...r,
                  tipo: e.target.value as "exact" | "range" | "precision",
                }))
              }
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="exact">Exacto ± margen</MenuItem>
              <MenuItem value="range">Rango [min, max]</MenuItem>
              <MenuItem value="precision">Precisión decimal</MenuItem>
            </Select>
          </FormControl>
          {respNum.tipo === "exact" && (
            <div className="flex gap-3">
              <TextField
                label="Valor exacto"
                type="number"
                value={respNum.exacto}
                onChange={(e) =>
                  setRespNum((r) => ({ ...r, exacto: Number(e.target.value) }))
                }
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Margen error"
                type="number"
                value={respNum.margen}
                onChange={(e) =>
                  setRespNum((r) => ({ ...r, margen: Number(e.target.value) }))
                }
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </div>
          )}
          {respNum.tipo === "range" && (
            <div className="flex gap-3">
              <TextField
                label="Mínimo"
                type="number"
                value={respNum.minimo}
                onChange={(e) =>
                  setRespNum((r) => ({ ...r, minimo: Number(e.target.value) }))
                }
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Máximo"
                type="number"
                value={respNum.maximo}
                onChange={(e) =>
                  setRespNum((r) => ({ ...r, maximo: Number(e.target.value) }))
                }
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </div>
          )}
          {respNum.tipo === "precision" && (
            <div className="flex gap-3">
              <TextField
                label="Valor"
                type="number"
                value={respNum.exacto}
                onChange={(e) =>
                  setRespNum((r) => ({ ...r, exacto: Number(e.target.value) }))
                }
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Decimales"
                type="number"
                value={respNum.precision}
                onChange={(e) =>
                  setRespNum((r) => ({
                    ...r,
                    precision: Number(e.target.value),
                  }))
                }
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Listas desplegables múltiples ── */}
      {tipo === "multiple_dropdowns" && (
        <div className="flex flex-col gap-3">
          <Typography
            variant="caption"
            sx={{ color: "#6793ba", fontWeight: 600 }}
          >
            Espacios en blanco — define las opciones de cada lista desplegable
          </Typography>
          <Alert
            severity="info"
            sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}
          >
            Usa [blanco1], [blanco2], etc. en el enunciado. Cada blanco tendrá
            su propia lista desplegable.
          </Alert>
          {dropdownBlancos.map((blanco, bidx) => (
            <div
              key={blanco.blank_id}
              style={{
                background: "#f8fafc",
                borderRadius: 8,
                padding: "10px 12px",
                border: "1px solid #d9e4ee",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Typography
                  variant="caption"
                  sx={{ color: "#2d5be3", fontWeight: 700 }}
                >
                  [{blanco.blank_id}]
                </Typography>
                {dropdownBlancos.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() =>
                      setDropdownBlancos((bs) =>
                        bs.filter((_, i) => i !== bidx),
                      )
                    }
                    sx={{ color: "#ef4444" }}
                  >
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                )}
              </div>
              {blanco.opciones.map((op, oidx) => (
                <div key={oidx} className="flex items-center gap-2 mb-1">
                  <Checkbox
                    checked={op.es_correcta}
                    size="small"
                    onChange={() =>
                      setDropdownBlancos((bs) =>
                        bs.map((b, i) =>
                          i !== bidx
                            ? b
                            : {
                                ...b,
                                opciones: b.opciones.map((o, j) => ({
                                  ...o,
                                  es_correcta: j === oidx,
                                })),
                              },
                        ),
                      )
                    }
                    sx={{
                      color: "#8daecb",
                      "&.Mui-checked": { color: "#2d5be3" },
                    }}
                  />
                  <TextField
                    value={op.texto}
                    size="small"
                    fullWidth
                    placeholder={`Opción ${oidx + 1}`}
                    onChange={(e) =>
                      setDropdownBlancos((bs) =>
                        bs.map((b, i) =>
                          i !== bidx
                            ? b
                            : {
                                ...b,
                                opciones: b.opciones.map((o, j) =>
                                  j === oidx
                                    ? { ...o, texto: e.target.value }
                                    : o,
                                ),
                              },
                        ),
                      )
                    }
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  {blanco.opciones.length > 2 && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDropdownBlancos((bs) =>
                          bs.map((b, i) =>
                            i !== bidx
                              ? b
                              : {
                                  ...b,
                                  opciones: b.opciones.filter(
                                    (_, j) => j !== oidx,
                                  ),
                                },
                          ),
                        )
                      }
                      sx={{ color: "#ef4444" }}
                    >
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                </div>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  setDropdownBlancos((bs) =>
                    bs.map((b, i) =>
                      i !== bidx
                        ? b
                        : {
                            ...b,
                            opciones: [
                              ...b.opciones,
                              { texto: "", es_correcta: false },
                            ],
                          },
                    ),
                  )
                }
                sx={{ color: "#4A6D8C", textTransform: "none", mt: 0.5 }}
              >
                Agregar opción
              </Button>
            </div>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              const n = dropdownBlancos.length + 1;
              setDropdownBlancos((bs) => [
                ...bs,
                {
                  blank_id: `blanco${n}`,
                  opciones: [
                    { texto: "", es_correcta: true },
                    { texto: "", es_correcta: false },
                  ],
                },
              ]);
            }}
            sx={{
              color: "#4A6D8C",
              alignSelf: "flex-start",
              textTransform: "none",
            }}
          >
            Agregar blanco
          </Button>
        </div>
      )}

      {tipo === "text_only_question" && (
        <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
          Útil como separador o instrucción entre preguntas.
        </Alert>
      )}

      {/* ── Botón guardar ── */}
      {/* <Button
        variant="contained"
        onClick={handleGuardar}
        disabled={guardando}
        sx={{
          alignSelf: "flex-end",
          borderRadius: 2,
          px: 4,
          bgcolor: "#2d5be3",
          "&:hover": { bgcolor: "#1a3cb0" },
        }}
      >
        {guardando ? (
          <CircularProgress size={18} sx={{ color: "white" }} />
        ) : (
          "Guardar pregunta"
        )}
      </Button> */}
    </div>
  );
};

export default FormPregunta;
