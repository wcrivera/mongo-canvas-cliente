// src/components/quiz/PreguntaEditor.tsx
// Componente de edición inline para una pregunta existente.
// Usado en: PreguntaCard (quiz), EjercicioCard (ejercicios)
import { Typography, TextField, Divider, Alert } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import MathTextEditor from "../CKEditor/MathTextEditor";

import FormOpciones, {
  type IOpcionForm,
} from "@/pages/quiz/components/tipos/FormOpciones";
import FormFIB, {
  type IItemFIBForm,
} from "@/pages/quiz/components/tipos/FormFIB";
import FormDropdowns, {
  type IDropdownBlancoForm,
} from "@/pages/quiz/components/tipos/FormDropdowns";
import FormMatching, {
  type IParForm,
} from "@/pages/quiz/components/tipos/FormMatching";
import FormNumerical, {
  type IRespuestaNumForm,
} from "@/pages/quiz/components/tipos/FormNumerical";
export type { TipoPimu } from "@/pages/quiz/components/tipos/FormFIB";

// ── Tipos re-exportados para compatibilidad con PreguntaCard / EjercicioCard ─
export type IOpcionEditor = IOpcionForm;
export type IParEditor = IParForm;
export type IRespuestaNumEditor = IRespuestaNumForm;
export type IItemFIBEditor = IItemFIBForm;
export type IDropdownBlancoEditorForm = IDropdownBlancoForm;

// IBlancoEditor se mantiene por si hay otros usos legacy
export interface IBlancoEditor {
  blank_id: string;
  respuesta: string;
  tipoPimu: string;
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

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  tipo: TipoPreguntaEditor;
  enunciado: string;
  onEnunciadoChange: (html: string) => void;
  puntos: number;
  onPuntosChange: (n: number) => void;

  // multiple_choice / multiple_answers / true_false
  opciones: IOpcionEditor[];
  onOpcionesChange: (ops: IOpcionEditor[]) => void;

  // matching
  pares: IParEditor[];
  onParesChange: (pares: IParEditor[]) => void;

  // numerical
  respNum: IRespuestaNumEditor;
  onRespNumChange: (r: IRespuestaNumEditor) => void;

  // fill_in_multiple_blanks — nuevo schema items[]
  items?: IItemFIBEditor[];
  columnas?: 1 | 2 | 3;
  onItemsChange?: (items: IItemFIBEditor[], columnas: 1 | 2 | 3) => void;

  // multiple_dropdowns
  dropdownBlancos?: IDropdownBlancoForm[];
  onDropdownBlancosChange?: (bs: IDropdownBlancoForm[]) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

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
  items = [],
  columnas = 1,
  onItemsChange,
  dropdownBlancos = [],
  onDropdownBlancosChange,
}: Props) => {
  const siglaCurso = useAppSelector(
    (s) => s.mongoCurso.cursoActivo?.codigo ?? "",
  );

  const esFib = tipo === "fill_in_multiple_blanks";
  const esDropdown = tipo === "multiple_dropdowns";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Puntos ── */}
      <TextField
        label="Puntos"
        type="number"
        value={puntos}
        onChange={(e) => onPuntosChange(Number(e.target.value))}
        size="small"
        sx={{ maxWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
      />

      {/* ── Enunciado ── */}
      <div>
        <Typography
          variant="caption"
          sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}
        >
          {esFib
            ? "Enunciado de contexto (texto introductorio sobre los ítems)"
            : esDropdown
              ? "Enunciado — usa [blanco1], [blanco2], etc. donde corresponda"
              : "Enunciado"}
        </Typography>
        <MathTextEditor
          initialData={enunciado}
          onChange={onEnunciadoChange}
          siglaCurso={siglaCurso}
        />
      </div>

      <Divider />

      {/* ── Subcomponente según tipo ── */}
      {(tipo === "multiple_choice" ||
        tipo === "multiple_answers" ||
        tipo === "true_false") && (
        <FormOpciones
          tipo={tipo}
          opciones={opciones}
          onChange={onOpcionesChange}
        />
      )}

      {esFib && (
        <FormFIB
          items={items}
          columnas={columnas}
          onChange={(nextItems, nextColumnas) =>
            onItemsChange?.(nextItems, nextColumnas)
          }
        />
      )}

      {esDropdown && (
        <FormDropdowns
          blancos={dropdownBlancos}
          onChange={(bs) => onDropdownBlancosChange?.(bs)}
        />
      )}

      {tipo === "matching" && (
        <FormMatching pares={pares} onChange={onParesChange} />
      )}

      {tipo === "numerical" && (
        <FormNumerical respNum={respNum} onChange={onRespNumChange} />
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
    </div>
  );
};

export default PreguntaEditor;
