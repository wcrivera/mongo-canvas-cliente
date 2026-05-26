// src/pages/quiz/components/tipos/FormMatching.tsx
import { IconButton, TextField, Typography, Button } from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export interface IParForm {
  izquierda: string;
  derecha:   string;
}

interface Props {
  pares:    IParForm[];
  onChange: (pares: IParForm[]) => void;
}

const FormMatching = ({ pares, onChange }: Props) => {

  const handleIzq = (idx: number, v: string) =>
    onChange(pares.map((p, i) => (i === idx ? { ...p, izquierda: v } : p)));

  const handleDer = (idx: number, v: string) =>
    onChange(pares.map((p, i) => (i === idx ? { ...p, derecha: v } : p)));

  const agregar = () =>
    onChange([...pares, { izquierda: "", derecha: "" }]);

  const eliminar = (idx: number) =>
    onChange(pares.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
        Pares de coincidencia
      </Typography>

      {pares.map((par, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <TextField
            value={par.izquierda}
            onChange={(e) => handleIzq(idx, e.target.value)}
            placeholder="Izquierda"
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Typography sx={{ color: "#8daecb", flexShrink: 0 }}>→</Typography>
          <TextField
            value={par.derecha}
            onChange={(e) => handleDer(idx, e.target.value)}
            placeholder="Derecha"
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {pares.length > 1 && (
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

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={agregar}
        sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}
      >
        Agregar par
      </Button>
    </div>
  );
};

export default FormMatching;