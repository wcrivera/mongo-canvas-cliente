// src/pages/ayudantia/ModalCrearQuizAyudantia.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";

interface QuizConfig {
  titulo: string;
  descripcion: string;
  tiempo_limite: number | null;
  intentos: number;
}

interface Props {
  onClose: () => void;
  onCreado: (config: QuizConfig) => void;
}

// Este modal solo recoge la configuración del quiz.
// El Recurso y el Quiz se crean en Mongo solo cuando el usuario confirma.
// Esto evita crear registros huérfanos si el usuario cancela.

const ModalCrearQuizAyudantia = ({ onClose, onCreado }: Props) => {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tiempo_limite: "" as string | number,
    intentos: 1,
    sin_limite_tiempo: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = () => {
    if (!form.titulo.trim()) {
      setError("El título es requerido");
      return;
    }
    setError(null);
    onCreado({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      tiempo_limite: form.sin_limite_tiempo
        ? null
        : Number(form.tiempo_limite) || null,
      intentos: form.intentos,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#2d5be3",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <QuizIcon />
        <span>Configurar quiz</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <div className="flex flex-col gap-4">
          <TextField
            label="Título del quiz"
            placeholder="ej: Quiz · Límites"
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            fullWidth
            size="small"
            autoFocus
            error={!!error}
            helperText={error ?? ""}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <TextField
            label="Descripción (opcional)"
            placeholder="Instrucciones para el estudiante"
            value={form.descripcion}
            onChange={(e) =>
              setForm((f) => ({ ...f, descripcion: e.target.value }))
            }
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <div className="flex items-center gap-3">
            <TextField
              label="Tiempo límite (minutos)"
              type="number"
              value={form.sin_limite_tiempo ? "" : form.tiempo_limite}
              onChange={(e) =>
                setForm((f) => ({ ...f, tiempo_limite: e.target.value }))
              }
              size="small"
              disabled={form.sin_limite_tiempo}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.sin_limite_tiempo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sin_limite_tiempo: e.target.checked,
                    }))
                  }
                  size="small"
                  sx={{
                    "& .MuiSwitch-thumb": {
                      bgcolor: form.sin_limite_tiempo ? "#2d5be3" : "#ccc",
                    },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: "#6793ba" }}>
                  Sin límite
                </Typography>
              }
            />
          </div>

          <TextField
            label="Intentos permitidos"
            type="number"
            value={form.intentos}
            onChange={(e) =>
              setForm((f) => ({ ...f, intentos: Number(e.target.value) }))
            }
            size="small"
            helperText="0 = ilimitados"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{ color: "#6793ba", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={!form.titulo.trim()}
          sx={{
            bgcolor: "#2d5be3",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" },
            "&:disabled": { bgcolor: "#b0c0f5" },
          }}
        >
          Crear quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCrearQuizAyudantia;
