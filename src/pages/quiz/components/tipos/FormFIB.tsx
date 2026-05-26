// src/pages/quiz/components/tipos/FormFIB.tsx
import {
  Alert, Button, FormControl, IconButton,
  InputLabel, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// ── Tipos PIMU ────────────────────────────────────────────────────────────────

export type TipoPimu =
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
  { value: "numero",            label: "Número",              hint: "Ej: 3, -1/3, e, pi" },
  { value: "formula",           label: "Fórmula",             hint: "Ej: -tan(x), x*e^x" },
  { value: "antiderivada",      label: "Antiderivada",        hint: "Ej: x^2/2+C, sin(x)+C" },
  { value: "conjunto",          label: "Conjunto",            hint: "Ej: {1}, {-pi/3,pi/3}" },
  { value: "intervalo",         label: "Intervalo",           hint: "Ej: (-inf,-2), [0,1)" },
  { value: "ecuacion",          label: "Ecuación",            hint: "Ej: y=x+1/2, y=-4x+30" },
  { value: "punto",             label: "Punto",               hint: "Ej: (-1,-1), (5/4,3/4)" },
  { value: "factorizacion",     label: "Factorización",       hint: "Ej: (x+3)(x+2)(x-1)" },
  { value: "formulaN",          label: "Fórmula en n",        hint: "Ej: n^3+4*n" },
  { value: "formulaT",          label: "Fórmula en t",        hint: "Ej: sin(t)/cos(t)" },
  { value: "vector",            label: "Vector",              hint: "Ej: (4,1), (1,0,2)" },
  { value: "conjunto-vectores", label: "Conjunto de vectores",hint: "Ej: {(0,0),(1,2)}" },
];

// ── Tipos exportados ──────────────────────────────────────────────────────────

export interface IItemFIBForm {
  id:        string;
  enunciado: string;
  respuesta: string;
  tipoPimu:  TipoPimu;
}

interface Props {
  items:    IItemFIBForm[];
  columnas: 1 | 2 | 3;
  onChange: (items: IItemFIBForm[], columnas: 1 | 2 | 3) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

const colClass: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

const FormFIB = ({ items, columnas: columnasProp, onChange }: Props) => {
  // Normalizar: Mongoose puede devolver number que no hace strict match con literal types
  const columnas = (Number(columnasProp) || 1) as 1 | 2 | 3;


  const setItems    = (next: IItemFIBForm[]) => onChange(next, columnas);
  const setColumnas = (next: 1 | 2 | 3)      => onChange(items, next);

  const agregarItem = () => {
    const n = items.length + 1;
    setItems([...items, { id: `blanco${n}`, enunciado: "", respuesta: "", tipoPimu: "numero" }]);
  };

  const eliminarItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(
      items
        .filter((_, i) => i !== idx)
        .map((it, i) => ({ ...it, id: `blanco${i + 1}` })),
    );
  };

  const updateItem = (idx: number, field: keyof IItemFIBForm, val: string) =>
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));

  return (
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

      {/* ── Selector de columnas ── */}
      <div className="flex items-center gap-3">
        <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 600, minWidth: 60 }}>
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
                ? { bgcolor: "#4A6D8C", "&:hover": { bgcolor: "#3c5770" }, boxShadow: "none" }
                : { borderColor: "#8daecb", color: "#4A6D8C" }),
            }}
          >
            {n}
          </Button>
        ))}
      </div>

      {/* ── Grid de ítems ── */}
      <div className={`grid ${colClass[columnas]} gap-3`}>
        {items.map((item, idx) => {
          const hint = TIPOS_PIMU.find((t) => t.value === item.tipoPimu)?.hint ?? "";
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
              {/* Número + eliminar */}
              <div className="flex items-center justify-between">
                <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 700 }}>
                  Ítem {idx + 1}
                </Typography>
                {items.length > 1 && (
                  <IconButton size="small" onClick={() => eliminarItem(idx)} sx={{ color: "#ef4444" }}>
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                )}
              </div>

              {/* Enunciado del ítem */}
              <TextField
                label="Enunciado (opcional)"
                value={item.enunciado}
                onChange={(e) => updateItem(idx, "enunciado", e.target.value)}
                size="small"
                fullWidth
                multiline
                minRows={1}
                placeholder="Vacío → usa el enunciado de contexto"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, background: "white" } }}
              />

              {/* Tipo validación */}
              <FormControl size="small" fullWidth>
                <InputLabel>Tipo de validación</InputLabel>
                <Select
                  value={item.tipoPimu}
                  label="Tipo de validación"
                  onChange={(e) => updateItem(idx, "tipoPimu", e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {TIPOS_PIMU.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Respuesta esperada */}
              <TextField
                label="Respuesta esperada"
                value={item.respuesta}
                onChange={(e) => updateItem(idx, "respuesta", e.target.value)}
                placeholder={hint}
                size="small"
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, background: "white" } }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Agregar ítem ── */}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={agregarItem}
        sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}
      >
        Agregar ítem
      </Button>

      <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
        Cada ítem puede tener su propio enunciado. Si lo dejas vacío, se usa el enunciado de contexto.
        Los ítems se muestran en un grid de {columnas} columna{columnas !== 1 ? "s" : ""}.
      </Alert>
    </div>
  );
};

export default FormFIB;