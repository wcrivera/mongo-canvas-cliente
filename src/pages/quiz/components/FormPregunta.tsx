// src/pages/quiz/components/FormPregunta.tsx
import { useState } from "react";
import {
  Alert, Button, CircularProgress, Divider,
  FormControl, InputLabel, MenuItem, Select,
  TextField, Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { crearPregunta }                  from "../../../store/slices/quiz";
import type { TipoPregunta }              from "../../../store/slices/quiz";
import MathTextEditor                     from "../../../components/CKEditor/MathTextEditor";

import FormOpciones from "./tipos/FormOpciones";
import type { IOpcionForm } from "./tipos/FormOpciones";
import FormFIB from "./tipos/FormFIB";
import type { IItemFIBForm } from "./tipos/FormFIB";
import FormDropdowns from "./tipos/FormDropdowns";
import type { IDropdownBlancoForm } from "./tipos/FormDropdowns";
import FormMatching from "./tipos/FormMatching";
import type { IParForm } from "./tipos/FormMatching";
import FormNumerical from "./tipos/FormNumerical";
import type { IRespuestaNumForm } from "./tipos/FormNumerical";
import { normalizeForEditor } from "../../../components/CKEditor/mathUtils";

// ── Tipos de pregunta Canvas ──────────────────────────────────────────────────

const TIPOS: { value: TipoPregunta; label: string }[] = [
  { value: "multiple_choice",          label: "Opción múltiple" },
  { value: "multiple_answers",         label: "Respuestas múltiples" },
  { value: "true_false",               label: "Verdadero / Falso" },
  { value: "fill_in_multiple_blanks",  label: "Completar respuesta (LTI)" },
  { value: "multiple_dropdowns",       label: "Listas desplegables múltiples" },
  { value: "short_answer",             label: "Respuesta corta" },
  { value: "essay",                    label: "Ensayo / Desarrollo" },
  { value: "matching",                 label: "Coincidencia" },
  { value: "numerical",                label: "Respuesta numérica" },
  { value: "text_only_question",       label: "Solo texto (sin respuesta)" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const enunciadoVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  quiz_id:  string;
  onCreada: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

const FormPregunta = ({ quiz_id, onCreada }: Props) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector((s) => s.mongoCurso.cursoActivo?.codigo ?? "");

  // ── Estado compartido ─────────────────────────────────────────────────────
  const [tipo,      setTipo]      = useState<TipoPregunta>("multiple_choice");
  const [enunciado, setEnunciado] = useState("");
  const [puntos,    setPuntos]    = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── Estado por tipo (levantado aquí para que handleGuardar lo lea) ────────
  const [opciones, setOpciones] = useState<IOpcionForm[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);

  const [items,    setItems]    = useState<IItemFIBForm[]>([
    { id: "blanco1", enunciado: "", respuesta: "", tipoPimu: "numero" },
  ]);
  const [columnas, setColumnas] = useState<1 | 2 | 3>(1);

  const [dropdownBlancos, setDropdownBlancos] = useState<IDropdownBlancoForm[]>([
    {
      blank_id: "blanco1",
      opciones: [
        { texto: "", es_correcta: true  },
        { texto: "", es_correcta: false },
      ],
    },
  ]);

  const [pares, setPares] = useState<IParForm[]>([
    { izquierda: "", derecha: "" },
    { izquierda: "", derecha: "" },
  ]);

  const [respNum, setRespNum] = useState<IRespuestaNumForm>({
    tipo: "exact", exacto: 0, margen: 0, minimo: 0, maximo: 10, precision: 2,
  });

  // ── Cambio de tipo ────────────────────────────────────────────────────────
  const handleTipoChange = (t: TipoPregunta) => {
    setTipo(t);
    setError(null);
    if (t === "true_false") {
      setOpciones([
        { texto: "Verdadero", es_correcta: false },
        { texto: "Falso",     es_correcta: false },
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

    if (tipo === "fill_in_multiple_blanks") {
      if (items.some((it) => !it.respuesta.trim())) {
        setError("Todos los ítems deben tener una respuesta.");
        return;
      }
    }

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
          { texto: "Verdadero", es_correcta: opciones[0]?.es_correcta ?? false },
          { texto: "Falso",     es_correcta: opciones[1]?.es_correcta ?? false },
        ];
        break;
      case "matching":
        payload.pares = pares;
        break;
      case "numerical":
        payload.respuesta_numerica = { ...respNum };
        break;
      case "fill_in_multiple_blanks":
        payload.enunciado_contexto = enunciado;
        payload.items    = items.map((it) => ({
          id:        it.id,
          enunciado: it.enunciado.trim(),
          respuesta: it.respuesta.trim(),
          tipo_pimu: it.tipoPimu,
        }));
        payload.columnas  = columnas;
        payload.tipo_pimu = items[0]?.tipoPimu ?? "numero";
        payload.opciones  = items.map((it) => ({
          texto:       it.respuesta.trim(),
          es_correcta: true,
          blank_id:    it.id,
          tipo_pimu:   it.tipoPimu,
        }));
        break;
      case "multiple_dropdowns":
        payload.opciones = dropdownBlancos.flatMap((b) =>
          b.opciones
            .filter((o) => o.texto.trim())
            .map((o) => ({
              texto:       o.texto.trim(),
              es_correcta: o.es_correcta,
              blank_id:    b.blank_id,
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
      setOpciones([{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]);
      setItems([{ id: "blanco1", enunciado: "", respuesta: "", tipoPimu: "numero" }]);
      setColumnas(1);
      onCreada();
    } else {
      setError(result.msg ?? "Error al guardar");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-[#d9e4ee]">
      <Typography variant="subtitle2" sx={{ color: "#4A6D8C", fontWeight: 700 }}>
        Nueva pregunta
      </Typography>

      {/* ── Tipo + Puntos ── */}
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
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
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

      {/* ── Enunciado ── */}
      <div>
        <Typography
          variant="caption"
          sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}
        >
          {tipo === "fill_in_multiple_blanks"
            ? "Enunciado de contexto (texto introductorio sobre los ítems)"
            : tipo === "multiple_dropdowns"
            ? "Enunciado — usa [blanco1], [blanco2], etc. donde corresponda"
            : "Enunciado"}
        </Typography>
        <MathTextEditor
          initialData={normalizeForEditor(enunciado)}
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

      {/* ── Subcomponente según tipo ── */}
      {(tipo === "multiple_choice" || tipo === "multiple_answers" || tipo === "true_false") && (
        <FormOpciones tipo={tipo} opciones={opciones} onChange={setOpciones} />
      )}

      {tipo === "fill_in_multiple_blanks" && (
        <FormFIB
          items={items}
          columnas={columnas}
          onChange={(nextItems, nextColumnas) => {
            setItems(nextItems);
            setColumnas(nextColumnas);
          }}
        />
      )}

      {tipo === "multiple_dropdowns" && (
        <FormDropdowns blancos={dropdownBlancos} onChange={setDropdownBlancos} />
      )}

      {tipo === "matching" && (
        <FormMatching pares={pares} onChange={setPares} />
      )}

      {tipo === "numerical" && (
        <FormNumerical respNum={respNum} onChange={setRespNum} />
      )}

      {(tipo === "short_answer" || tipo === "essay") && (
        <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
          {tipo === "essay"
            ? "El estudiante verá un campo de texto largo para su respuesta."
            : "El estudiante verá un campo de texto corto para su respuesta."}
        </Alert>
      )}

      {tipo === "text_only_question" && (
        <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
          Útil como separador o instrucción entre preguntas.
        </Alert>
      )}

      {/* ── Botón guardar ── */}
      <Button
        variant="contained"
        onClick={handleGuardar}
        disabled={guardando}
        sx={{
          alignSelf: "flex-end",
          borderRadius: 2,
          px: 4,
          bgcolor: "#2d5be3",
          "&:hover": { bgcolor: "#1a3cb0" },
          boxShadow: "none",
        }}
      >
        {guardando
          ? <CircularProgress size={18} sx={{ color: "white" }} />
          : "Guardar pregunta"
        }
      </Button>
    </div>
  );
};

export default FormPregunta;