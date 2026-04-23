import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAppDispatch } from "../../store/hooks";
import { crearEjercicio } from "../../store/slices/ejercicio";
import type {
  TipoPreguntaEjercicio,
  IOpcionEjercicio,
} from "../../store/slices/ejercicio";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  capitulo_id: string;
  onCreado: () => void;
  onCancelar: () => void;
}

const FormEjercicio = ({ capitulo_id, onCreado, onCancelar }: Props) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    nombre: "",
    enunciado: "",
    tipo_pregunta: "multiple_choice" as TipoPreguntaEjercicio,
    puntos: 1,
    published: false,
  });
  const [opciones, setOpciones] = useState<IOpcionEjercicio[]>([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);
  const [guardando, setGuardando] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTipoChange = (tipo: TipoPreguntaEjercicio) => {
    setForm((f) => ({ ...f, tipo_pregunta: tipo }));
    if (tipo === "true_false") {
      setOpciones([
        { texto: "Verdadero", es_correcta: false },
        { texto: "Falso", es_correcta: false },
      ]);
    } else if (tipo === "multiple_choice") {
      setOpciones([
        { texto: "", es_correcta: false },
        { texto: "", es_correcta: false },
      ]);
    } else {
      setOpciones([]);
    }
  };

  const handleOpcionCorrecta = (idx: number) => {
    setOpciones((ops) =>
      ops.map((op, i) => ({
        ...op,
        es_correcta: i === idx,
      })),
    );
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.enunciado.trim()) {
      setError("Nombre y enunciado son requeridos");
      return;
    }
    if (
      (form.tipo_pregunta === "multiple_choice" ||
        form.tipo_pregunta === "true_false") &&
      !opciones.some((op) => op.es_correcta)
    ) {
      setError("Debes marcar una opción como correcta");
      return;
    }
    if (
      form.tipo_pregunta === "multiple_choice" &&
      opciones.some((op) => !op.texto.trim())
    ) {
      setError("Todas las opciones deben tener texto");
      return;
    }

    setError(null);
    setGuardando(true);
    await dispatch(
      crearEjercicio({
        capitulo_id,
        ...form,
        opciones,
      }),
    );
    setGuardando(false);
    onCreado();
  };

  const mostrarOpciones =
    form.tipo_pregunta === "multiple_choice" ||
    form.tipo_pregunta === "true_false";

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
        Nuevo ejercicio
      </Typography>

      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <TextField
          label="Nombre del ejercicio"
          placeholder="ej: Ejercicio 1"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          size="small"
          fullWidth
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        {/* Tipo + Puntos */}
        <div className="grid grid-cols-2 gap-3">
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de pregunta</InputLabel>
            <Select
              value={form.tipo_pregunta}
              label="Tipo de pregunta"
              onChange={(e) =>
                handleTipoChange(e.target.value as TipoPreguntaEjercicio)
              }
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
            onChange={(e) =>
              setForm((f) => ({ ...f, puntos: Number(e.target.value) }))
            }
            size="small"
            // slotProps={{ input: { min: 1 } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </div>

        {/* Enunciado con preview */}
        <div>
          <div className="flex gap-2 mb-2">
            {["Editar", "Preview"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPreview(tab === "Preview")}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  border: "1px solid #d9e4ee",
                  background:
                    (tab === "Preview") === preview ? "#4A6D8C" : "white",
                  color: (tab === "Preview") === preview ? "white" : "#4A6D8C",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {!preview ? (
            <textarea
              value={form.enunciado}
              onChange={(e) =>
                setForm((f) => ({ ...f, enunciado: e.target.value }))
              }
              placeholder="Enunciado con LaTeX... ej: Dado \(f(x) = x^2\), calcule \(f'(x)\)"
              style={{
                width: "100%",
                minHeight: 120,
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #d9e4ee",
                fontSize: 13,
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none",
              }}
            />
          ) : (
            <div
              style={{
                minHeight: 80,
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #d9e4ee",
                fontSize: 14,
                lineHeight: 1.8,
                background: "#fafafa",
              }}
            >
              {form.enunciado.trim() ? (
                <LatexRenderer>{form.enunciado}</LatexRenderer>
              ) : (
                <span style={{ color: "#8daecb", fontStyle: "italic" }}>
                  El preview aparecerá aquí...
                </span>
              )}
            </div>
          )}
          <Typography
            variant="caption"
            sx={{ color: "#8daecb", mt: 0.5, display: "block" }}
          >
            Usa \(...\) para LaTeX inline y \[...\] para bloques
          </Typography>
        </div>

        {/* Opciones */}
        {mostrarOpciones && (
          <div className="flex flex-col gap-2">
            <Typography
              variant="caption"
              sx={{ color: "#6793ba", fontWeight: 600 }}
            >
              Opciones — marca la correcta
            </Typography>
            {opciones.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correcta"
                  checked={op.es_correcta}
                  onChange={() => handleOpcionCorrecta(idx)}
                  style={{ accentColor: "#4A6D8C", flexShrink: 0 }}
                />
                {form.tipo_pregunta === "true_false" ? (
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, color: "#3d3d3d" }}
                  >
                    {op.texto}
                  </Typography>
                ) : (
                  <TextField
                    value={op.texto}
                    onChange={(e) =>
                      setOpciones((ops) =>
                        ops.map((o, i) =>
                          i === idx ? { ...o, texto: e.target.value } : o,
                        ),
                      )
                    }
                    placeholder={`Opción ${idx + 1}`}
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: 13,
                      },
                    }}
                  />
                )}
                {form.tipo_pregunta === "multiple_choice" &&
                  opciones.length > 2 && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        setOpciones((ops) => ops.filter((_, i) => i !== idx))
                      }
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
              </div>
            ))}
            {form.tipo_pregunta === "multiple_choice" && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  setOpciones((ops) => [
                    ...ops,
                    { texto: "", es_correcta: false },
                  ])
                }
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

        {/* Publicado */}
        <FormControlLabel
          control={
            <Switch
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
              sx={{
                "& .MuiSwitch-thumb": {
                  bgcolor: form.published ? "#4A6D8C" : "#ccc",
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "#3c5770" }}>
              {form.published ? "Publicado" : "No publicado"}
            </Typography>
          }
        />

        {error && (
          <Typography variant="caption" sx={{ color: "#ef4444" }}>
            {error}
          </Typography>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          variant="text"
          onClick={onCancelar}
          sx={{ color: "#6793ba", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={guardando}
          startIcon={
            guardando ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
          sx={{
            bgcolor: "#4A6D8C",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
          }}
        >
          {guardando ? "Creando..." : "Crear ejercicio"}
        </Button>
      </div>
    </div>
  );
};

export default FormEjercicio;
