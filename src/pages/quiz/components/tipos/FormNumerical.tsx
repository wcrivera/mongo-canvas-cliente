// src/pages/quiz/components/tipos/FormNumerical.tsx
import { FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";

export interface IRespuestaNumForm {
  tipo:      "exact" | "range" | "precision";
  exacto:    number;
  margen:    number;
  minimo:    number;
  maximo:    number;
  precision: number;
}

interface Props {
  respNum:  IRespuestaNumForm;
  onChange: (respNum: IRespuestaNumForm) => void;
}

const FormNumerical = ({ respNum, onChange }: Props) => {

  const set = (fields: Partial<IRespuestaNumForm>) =>
    onChange({ ...respNum, ...fields });

  return (
    <div className="flex flex-col gap-3">
      <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
        Respuesta numérica
      </Typography>

      <FormControl size="small" sx={{ maxWidth: 200 }}>
        <InputLabel>Tipo</InputLabel>
        <Select
          value={respNum.tipo}
          label="Tipo"
          onChange={(e) => set({ tipo: e.target.value as IRespuestaNumForm["tipo"] })}
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
            onChange={(e) => set({ exacto: Number(e.target.value) })}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Margen error"
            type="number"
            value={respNum.margen}
            onChange={(e) => set({ margen: Number(e.target.value) })}
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
            onChange={(e) => set({ minimo: Number(e.target.value) })}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Máximo"
            type="number"
            value={respNum.maximo}
            onChange={(e) => set({ maximo: Number(e.target.value) })}
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
            onChange={(e) => set({ exacto: Number(e.target.value) })}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Decimales"
            type="number"
            value={respNum.precision}
            onChange={(e) => set({ precision: Number(e.target.value) })}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </div>
      )}
    </div>
  );
};

export default FormNumerical;