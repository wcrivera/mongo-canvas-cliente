// src/pages/quiz/components/tipos/FormDropdowns.tsx
import { Alert, Button, IconButton, TextField, Typography } from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export interface IDropdownOpcionForm {
  texto:       string;
  es_correcta: boolean;
}

export interface IDropdownBlancoForm {
  blank_id: string;
  opciones: IDropdownOpcionForm[];
}

interface Props {
  blancos:  IDropdownBlancoForm[];
  onChange: (blancos: IDropdownBlancoForm[]) => void;
}

const FormDropdowns = ({ blancos, onChange }: Props) => {

  const agregarBlanco = () => {
    const n = blancos.length + 1;
    onChange([
      ...blancos,
      {
        blank_id: `blanco${n}`,
        opciones: [
          { texto: "", es_correcta: true  },
          { texto: "", es_correcta: false },
        ],
      },
    ]);
  };

  const eliminarBlanco = (bidx: number) =>
    onChange(
      blancos
        .filter((_, i) => i !== bidx)
        .map((b, i) => ({ ...b, blank_id: `blanco${i + 1}` })),
    );

  const agregarOpcion = (bidx: number) =>
    onChange(
      blancos.map((b, i) =>
        i !== bidx ? b : { ...b, opciones: [...b.opciones, { texto: "", es_correcta: false }] },
      ),
    );

  const eliminarOpcion = (bidx: number, oidx: number) =>
    onChange(
      blancos.map((b, i) =>
        i !== bidx ? b : { ...b, opciones: b.opciones.filter((_, j) => j !== oidx) },
      ),
    );

  const handleTexto = (bidx: number, oidx: number, texto: string) =>
    onChange(
      blancos.map((b, i) =>
        i !== bidx
          ? b
          : { ...b, opciones: b.opciones.map((o, j) => (j === oidx ? { ...o, texto } : o)) },
      ),
    );

  const handleCorrecta = (bidx: number, oidx: number) =>
    onChange(
      blancos.map((b, i) =>
        i !== bidx
          ? b
          : { ...b, opciones: b.opciones.map((o, j) => ({ ...o, es_correcta: j === oidx })) },
      ),
    );

  return (
    <div className="flex flex-col gap-3">
      <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
        Espacios en blanco — define las opciones de cada lista desplegable
      </Typography>

      <Alert severity="info" sx={{ py: 0.5, fontSize: 12, borderRadius: 2 }}>
        Usa [blanco1], [blanco2], etc. en el enunciado. Cada blanco tendrá su propia lista desplegable.
      </Alert>

      {blancos.map((blanco, bidx) => (
        <div key={blanco.blank_id} className="flex flex-col gap-2 p-3 border border-[#e2e8f0] rounded-xl">
          <div className="flex items-center justify-between">
            <Typography variant="caption" sx={{ color: "#4A6D8C", fontWeight: 600 }}>
              [{blanco.blank_id}]
            </Typography>
            {blancos.length > 1 && (
              <IconButton size="small" onClick={() => eliminarBlanco(bidx)} sx={{ color: "#ef4444" }}>
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </div>

          {blanco.opciones.map((op, oidx) => (
            <div key={oidx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correcta-${blanco.blank_id}`}
                checked={op.es_correcta}
                onChange={() => handleCorrecta(bidx, oidx)}
                style={{ accentColor: "#4A6D8C", flexShrink: 0 }}
              />
              <TextField
                value={op.texto}
                onChange={(e) => handleTexto(bidx, oidx, e.target.value)}
                placeholder={`Opción ${oidx + 1}`}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              {blanco.opciones.length > 2 && (
                <IconButton
                  size="small"
                  onClick={() => eliminarOpcion(bidx, oidx)}
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
            onClick={() => agregarOpcion(bidx)}
            sx={{ color: "#4A6D8C", textTransform: "none", mt: 0.5 }}
          >
            Agregar opción
          </Button>
        </div>
      ))}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={agregarBlanco}
        sx={{ color: "#4A6D8C", alignSelf: "flex-start", textTransform: "none" }}
      >
        Agregar blanco
      </Button>
    </div>
  );
};

export default FormDropdowns;