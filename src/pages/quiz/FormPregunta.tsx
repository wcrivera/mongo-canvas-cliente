import { useState } from "react";
import {
  Typography, TextField, Button,
  Select, MenuItem, FormControl,
  InputLabel, IconButton, Tooltip,
  CircularProgress,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch } from "../../store/hooks";
import { crearPregunta }  from "../../store/slices/quiz";
import type { TipoPregunta } from "../../store/slices/quiz";

interface Props {
  quiz_id:  string;
  onCreada: () => void;
}

interface IOpcionForm {
  texto:       string;
  es_correcta: boolean;
}

const FormPregunta = ({ quiz_id, onCreada }: Props) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    enunciado: "",
    tipo:      'multiple_choice' as TipoPregunta,
    puntos:    1,
  });
  const [opciones, setOpciones]   = useState<IOpcionForm[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const opcionesPorTipo = () => {
    if (form.tipo === 'true_false') {
      return [
        { texto: "Verdadero", es_correcta: false },
        { texto: "Falso",     es_correcta: false },
      ];
    }
    return opciones;
  };

  const handleTipoChange = (tipo: TipoPregunta) => {
    setForm(f => ({ ...f, tipo }));
    if (tipo === 'true_false') {
      setOpciones([
        { texto: "Verdadero", es_correcta: false },
        { texto: "Falso",     es_correcta: false },
      ]);
    } else if (tipo === 'multiple_choice') {
      setOpciones([
        { texto: "", es_correcta: false },
        { texto: "", es_correcta: false },
      ]);
    }
  };

  const handleOpcionTexto = (idx: number, texto: string) => {
    setOpciones(ops => ops.map((op, i) => i === idx ? { ...op, texto } : op));
  };

  const handleOpcionCorrecta = (idx: number) => {
    setOpciones(ops => ops.map((op, i) => ({
      ...op,
      es_correcta: i === idx,
    })));
  };

  const handleAgregarOpcion = () => {
    setOpciones(ops => [...ops, { texto: "", es_correcta: false }]);
  };

  const handleEliminarOpcion = (idx: number) => {
    setOpciones(ops => ops.filter((_, i) => i !== idx));
  };

  const handleGuardar = async () => {
    if (!form.enunciado.trim()) {
      setError("El enunciado es requerido");
      return;
    }

    const ops = opcionesPorTipo();

    if (form.tipo === 'multiple_choice' || form.tipo === 'true_false') {
      if (!ops.some(op => op.es_correcta)) {
        setError("Debes marcar al menos una opción como correcta");
        return;
      }
      if (ops.some(op => !op.texto.trim())) {
        setError("Todas las opciones deben tener texto");
        return;
      }
    }

    setError(null);
    setGuardando(true);

    await dispatch(crearPregunta({
      quiz_id,
      enunciado: form.enunciado,
      tipo:      form.tipo,
      puntos:    form.puntos,
      opciones:  ops,
    }));

    setGuardando(false);
    setForm({ enunciado: "", tipo: 'multiple_choice', puntos: 1 });
    setOpciones([
      { texto: "", es_correcta: false },
      { texto: "", es_correcta: false },
    ]);
    onCreada();
  };

  const mostrarOpciones =
    form.tipo === 'multiple_choice' || form.tipo === 'true_false';

  return (
    <div
      className="rounded-2xl p-5 animate-slideDown"
      style={{
        background: "white",
        border: "1px solid #d9e4ee",
        boxShadow: "0 4px 16px rgba(74,109,140,0.08)",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: "#2e4154", mb: 3, fontWeight: 600 }}
      >
        Nueva pregunta
      </Typography>

      <div className="flex flex-col gap-4">

        {/* Enunciado */}
        <TextField
          label="Enunciado"
          placeholder="Escribe la pregunta..."
          value={form.enunciado}
          onChange={(e) => setForm(f => ({ ...f, enunciado: e.target.value }))}
          fullWidth
          multiline
          rows={2}
          size="small"
          autoFocus
          error={!!error}
          helperText={error ?? ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        {/* Tipo + Puntos */}
        <div className="grid grid-cols-2 gap-3">
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de pregunta</InputLabel>
            <Select
              value={form.tipo}
              label="Tipo de pregunta"
              onChange={(e) => handleTipoChange(e.target.value as TipoPregunta)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="multiple_choice">Opción múltiple</MenuItem>
              <MenuItem value="true_false">Verdadero / Falso</MenuItem>
              <MenuItem value="short_answer">Respuesta corta</MenuItem>
              <MenuItem value="essay">Ensayo</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Puntos"
            type="number"
            value={form.puntos}
            onChange={(e) => setForm(f => ({ ...f, puntos: Number(e.target.value) }))}
            size="small"
            // inputProps={{ min: 1 }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </div>

        {/* Opciones */}
        {mostrarOpciones && (
          <div className="flex flex-col gap-2">
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
              Opciones — marca la correcta
            </Typography>

            {opcionesPorTipo().map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {/* Radio correcta */}
                <input
                  type="radio"
                  name="correcta"
                  checked={op.es_correcta}
                  onChange={() => handleOpcionCorrecta(idx)}
                  style={{ accentColor: "#4A6D8C", flexShrink: 0 }}
                />

                {/* Texto opción */}
                {form.tipo === 'true_false' ? (
                  <Typography variant="body2" sx={{ flex: 1, color: "#3d3d3d" }}>
                    {op.texto}
                  </Typography>
                ) : (
                  <TextField
                    value={op.texto}
                    onChange={(e) => handleOpcionTexto(idx, e.target.value)}
                    placeholder={`Opción ${idx + 1}`}
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                  />
                )}

                {/* Eliminar opción */}
                {form.tipo === 'multiple_choice' && opciones.length > 2 && (
                  <Tooltip title="Eliminar opción">
                    <IconButton
                      size="small"
                      onClick={() => handleEliminarOpcion(idx)}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            ))}

            {/* Agregar opción */}
            {form.tipo === 'multiple_choice' && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAgregarOpcion}
                sx={{
                  color: "#8daecb",
                  alignSelf: "flex-start",
                  "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                }}
              >
                Agregar opción
              </Button>
            )}
          </div>
        )}

      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 mt-5">
        <Button
          onClick={onCreada}
          variant="text"
          sx={{ color: "#6793ba", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={guardando}
          startIcon={
            guardando
              ? <CircularProgress size={14} color="inherit" />
              : undefined
          }
          sx={{
            bgcolor: "#2d5be3",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" },
          }}
        >
          {guardando ? "Guardando..." : "Agregar pregunta"}
        </Button>
      </div>
    </div>
  );
};

export default FormPregunta;