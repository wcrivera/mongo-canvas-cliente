import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import { useAppDispatch } from "../../store/hooks";
import { crearQuiz } from "../../store/slices/quiz";
import type { IQuiz } from "../../store/slices/quiz";

interface Props {
  recurso_id: string;
  onClose: () => void;
  onCreado: (quiz: IQuiz) => void;
}

const ModalCrearQuiz = ({ recurso_id, onClose, onCreado }: Props) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tiempo_limite: "" as string | number,
    intentos: 1,
    sin_limite_tiempo: false,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!form.titulo.trim()) {
      setError("El título es requerido");
      return;
    }
    setError(null);
    setGuardando(true);

    const resultado = (await dispatch(
      crearQuiz({
        recurso_id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        tiempo_limite: form.sin_limite_tiempo
          ? null
          : Number(form.tiempo_limite) || null,
        intentos: form.intentos,
      }),
    )) as unknown as { ok: boolean; data?: IQuiz };

    setGuardando(false);

    if (resultado.ok && resultado.data) {
      onCreado(resultado.data);
    } else {
      setError("Error al crear el quiz");
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
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
        <span>Crear quiz</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <div className="flex flex-col gap-4">
          <TextField
            label="Título del quiz"
            placeholder="ej: Quiz · Plano cartesiano"
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

          {/* Tiempo límite */}
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
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              //   inputProps={{ min: 1 }}
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

          {/* Intentos */}
          <div className="flex items-center gap-3">
            <TextField
              label="Intentos permitidos"
              type="number"
              value={form.intentos}
              onChange={(e) =>
                setForm((f) => ({ ...f, intentos: Number(e.target.value) }))
              }
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              //   inputProps={{ min: 0 }}
              helperText="0 = ilimitados"
            />
          </div>
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
          disabled={guardando || !form.titulo.trim()}
          startIcon={
            guardando ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
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
          {guardando ? "Creando..." : "Crear quiz"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCrearQuiz;
