// src/pages/quiz/components/tipos/FormOpciones.tsx
import { Button, Checkbox, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import MathTextEditorInline from "../../../../components/CKEditor/MathTextEditorInline";

export interface IOpcionForm {
  texto: string;
  es_correcta: boolean;
}

interface Props {
  tipo: "multiple_choice" | "multiple_answers" | "true_false";
  opciones: IOpcionForm[];
  onChange: (opciones: IOpcionForm[]) => void;
}

const FormOpciones = ({ tipo, opciones, onChange }: Props) => {
  const esMultiple = tipo === "multiple_answers";
  const esTrueFalse = tipo === "true_false";

  const handleCorrecta = (idx: number) => {
    if (esMultiple) {
      onChange(
        opciones.map((op, i) =>
          i === idx ? { ...op, es_correcta: !op.es_correcta } : op,
        ),
      );
    } else {
      onChange(opciones.map((op, i) => ({ ...op, es_correcta: i === idx })));
    }
  };

  const handleTexto = (idx: number, texto: string) =>
    onChange(opciones.map((op, i) => (i === idx ? { ...op, texto } : op)));

  const agregar = () =>
    onChange([...opciones, { texto: "", es_correcta: false }]);

  const eliminar = (idx: number) =>
    onChange(opciones.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
        {esMultiple
          ? "Opciones — marca todas las correctas"
          : "Opciones — marca la correcta"}
      </Typography>

      {opciones.map((op, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {/* ── Selector correcto/incorrecto ── */}
          {esMultiple ? (
            <Checkbox
              checked={op.es_correcta}
              onChange={() => handleCorrecta(idx)}
              size="small"
              sx={{ color: "#8daecb", "&.Mui-checked": { color: "#2d5be3" } }}
            />
          ) : (
            <Checkbox
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<RadioButtonCheckedIcon />}
              checked={op.es_correcta}
              onChange={() => handleCorrecta(idx)}
              size="small"
              sx={{ color: "#8daecb", "&.Mui-checked": { color: "#2d5be3" } }}
            />
          )}

          {/* ── Texto de la opción ── */}
          {esTrueFalse ? (
            // true_false: etiquetas fijas, sin editor
            <Typography variant="body2" sx={{ color: "#3c5770", flex: 1 }}>
              {op.texto}
            </Typography>
          ) : (
            // multiple_choice / multiple_answers: editor con soporte LaTeX
            <MathTextEditorInline
              initialData={op.texto}
              onChange={(html) => handleTexto(idx, html)}
              placeholder={`Opción ${idx + 1}`}
            />
          )}

          {/* ── Botón eliminar (solo en opciones variables) ── */}
          {!esTrueFalse && (
            <IconButton
              size="small"
              onClick={() => eliminar(idx)}
              disabled={opciones.length <= 2}
              sx={{
                color: "#c9dae8",
                "&:hover": { color: "#ef4444" },
                flexShrink: 0,
              }}
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
          onClick={agregar}
          sx={{ color: "#4A6D8C", alignSelf: "flex-start", mt: 1 }}
        >
          Agregar opción
        </Button>
      )}
    </div>
  );
};

export default FormOpciones;
