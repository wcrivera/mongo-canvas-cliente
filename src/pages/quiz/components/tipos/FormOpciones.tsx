// src/pages/quiz/components/tipos/FormOpciones.tsx
import { Button, Checkbox, IconButton, TextField, Typography } from "@mui/material";
import AddIcon                  from "@mui/icons-material/Add";
import DeleteIcon               from "@mui/icons-material/Delete";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon   from "@mui/icons-material/RadioButtonChecked";

export interface IOpcionForm {
  texto:       string;
  es_correcta: boolean;
}

interface Props {
  tipo:     "multiple_choice" | "multiple_answers" | "true_false";
  opciones: IOpcionForm[];
  onChange: (opciones: IOpcionForm[]) => void;
}

const FormOpciones = ({ tipo, opciones, onChange }: Props) => {
  const esMultiple  = tipo === "multiple_answers";
  const esTrueFalse = tipo === "true_false";

  const handleCorrecta = (idx: number) => {
    if (esMultiple) {
      onChange(opciones.map((op, i) => i === idx ? { ...op, es_correcta: !op.es_correcta } : op));
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
        {esMultiple ? "Opciones — marca todas las correctas" : "Opciones — marca la correcta"}
      </Typography>

      {opciones.map((op, idx) => (
        <div key={idx} className="flex items-center gap-2">
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

          {esTrueFalse ? (
            <Typography variant="body2" sx={{ color: "#374151" }}>
              {op.texto}
            </Typography>
          ) : (
            <TextField
              value={op.texto}
              onChange={(e) => handleTexto(idx, e.target.value)}
              placeholder={`Opción ${idx + 1}`}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          )}

          {!esTrueFalse && opciones.length > 2 && (
            <IconButton
              size="small"
              onClick={() => eliminar(idx)}
              sx={{ color: "#ef4444" }}
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
          sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}
        >
          Agregar opción
        </Button>
      )}
    </div>
  );
};

export default FormOpciones;