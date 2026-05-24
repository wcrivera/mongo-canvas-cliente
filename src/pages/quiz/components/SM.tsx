import {
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import { MathTextEditor } from "../../../components/CKEditor";

interface IOpcionForm {
  texto: string;
  es_correcta: boolean;
}

const enunciadoVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

const SM = () => {

  const [error, setError] = useState<string | null>(null);
  const [opciones, setOpciones] = useState<IOpcionForm[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);

  const [guardando, setGuardando] = useState(false);

  const handleOpcionTexto = (idx: number, texto: string) =>
    setOpciones((ops) =>
      ops.map((op, i) => (i === idx ? { ...op, texto } : op)),
    );

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

  const agregarOpcion = () =>
    setOpciones((ops) => [...ops, { texto: "", es_correcta: false }]);
  const eliminarOpcion = (idx: number) =>
    setOpciones((ops) => ops.filter((_, i) => i !== idx));

  const esMultiple = true;

  const [enunciado, setEnunciado] = useState("");
  const siglaCurso = "CURSO123"; // Placeholder para la sigla del curso}

  const handleGuardar = async () => {

    if (enunciadoVacio(enunciado)) {
      setError("El enunciado es requerido.");
      return;
    }
    // Aquí iría la lógica para guardar la pregunta, por ejemplo, enviarla a un API
    const preguntaData = {
      enunciado,
      opciones,
    };
    console.log("Guardando pregunta:", preguntaData);

    setGuardando(true);
  };

  return (
    <>
      <div>
        <Typography
          variant="caption"
          sx={{ color: "#6793ba", fontWeight: 600, display: "block", mb: 1 }}
        >
          Enunciado
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
      </div>

      <Divider />

      <div className="flex flex-col gap-2">
        <Typography
          variant="caption"
          sx={{ color: "#6793ba", fontWeight: 600 }}
        >
          Opciones (selecciona la correcta)
        </Typography>
        {opciones.map((op, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Checkbox
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<RadioButtonCheckedIcon />}
              checked={op.es_correcta}
              size="small"
              onChange={() => handleOpcionCorrecta(idx, esMultiple)}
              sx={{ color: "#8daecb", "&.Mui-checked": { color: "#2d5be3" } }}
            />
            <TextField
              value={op.texto}
              onChange={(e) => handleOpcionTexto(idx, e.target.value)}
              placeholder={`Opción ${idx + 1}`}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            {opciones.length > 2 && (
              <IconButton
                size="small"
                onClick={() => eliminarOpcion(idx)}
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
          onClick={agregarOpcion}
          sx={{
            color: "#4A6D8C",
            alignSelf: "flex-start",
            textTransform: "none",
          }}
        >
          Agregar opción
        </Button>
      </div>

      <Button
        variant="contained"
        onClick={() => {
          handleGuardar();
          setGuardando(true);
        }}
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
      </Button>
    </>
  );
};

export default SM;
