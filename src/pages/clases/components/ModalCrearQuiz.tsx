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
import { useAppDispatch } from "../../../store/hooks";
import {
  crearQuiz,
  editarQuiz,
  eliminarQuiz,
} from "../../../store/slices/quiz";
import type { IQuiz } from "../../../store/slices/quiz";

interface Props {
  contexto: "clase" | "ayudantia" | "ejercicio";
  tema_id?: string;
  ayudantia_id?: string;
  capitulo_id: string;
  curso_id: string;
  quiz?: IQuiz; // si viene → modo edición
  onClose: () => void;
  onCreado?: (quiz: IQuiz) => void;
}

const ModalCrearQuiz = ({
  contexto,
  tema_id,
  ayudantia_id,
  capitulo_id,
  curso_id,
  quiz,
  onClose,
  onCreado,
}: Props) => {
  const dispatch = useAppDispatch();
  const esEdicion = !!quiz;

  const [form, setForm] = useState({
    titulo: quiz?.titulo ?? "",
    descripcion: quiz?.descripcion ?? "",
    tiempo_limite: quiz?.tiempo_limite ?? ("" as string | number),
    intentos: quiz?.intentos ?? 1,
    umbral_aprobacion: quiz?.umbral_aprobacion ?? 60,
    sin_limite:
      quiz?.tiempo_limite === null || quiz?.tiempo_limite === undefined,
  });
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!form.titulo.trim()) {
      setError("El título es requerido");
      return;
    }
    setError(null);
    setGuardando(true);

    const tiempo_limite = form.sin_limite
      ? null
      : Number(form.tiempo_limite) || null;

    let resultado;
    if (esEdicion) {
      resultado = (await dispatch(
        editarQuiz({
          quiz_id: quiz._id,
          titulo: form.titulo,
          descripcion: form.descripcion,
          tiempo_limite,
          intentos: form.intentos,
          umbral_aprobacion: form.umbral_aprobacion,
        }),
      )) as unknown as { ok: boolean; data?: IQuiz };
    } else {
      resultado = (await dispatch(
        crearQuiz({
          contexto,
          tema_id,
          ayudantia_id,
          capitulo_id,
          curso_id,
          titulo: form.titulo,
          descripcion: form.descripcion,
          tiempo_limite,
          intentos: form.intentos,
          umbral_aprobacion: form.umbral_aprobacion,
        }),
      )) as unknown as { ok: boolean; data?: IQuiz };
    }

    setGuardando(false);
    if (resultado.ok) {
      if (!esEdicion && resultado.data && onCreado) onCreado(resultado.data);
      else onClose();
    } else {
      setError("Error al guardar el quiz");
    }
  };

  const handleEliminar = async () => {
    if (!quiz) return;
    setEliminando(true);
    await dispatch(eliminarQuiz({ quiz_id: quiz._id }));
    setEliminando(false);
    onClose();
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
          bgcolor: "#1E293B",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <QuizIcon />
        <span>{esEdicion ? "Editar quiz" : "Crear quiz"}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <div className="flex flex-col gap-4 py-5">
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
          <div className="flex items-center gap-3">
            <TextField
              label="Tiempo límite (minutos)"
              type="number"
              value={form.sin_limite ? "" : form.tiempo_limite}
              onChange={(e) =>
                setForm((f) => ({ ...f, tiempo_limite: e.target.value }))
              }
              size="small"
              disabled={form.sin_limite}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={form.sin_limite}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sin_limite: e.target.checked }))
                  }
                  sx={{
                    "& .MuiSwitch-thumb": {
                      bgcolor: form.sin_limite ? "#2d5be3" : "#ccc",
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
          <div className="flex gap-3">
            <TextField
              label="Intentos (0=ilimitados)"
              type="number"
              value={form.intentos}
              onChange={(e) =>
                setForm((f) => ({ ...f, intentos: Number(e.target.value) }))
              }
              size="small"
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Umbral aprobación (%)"
              type="number"
              value={form.umbral_aprobacion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  umbral_aprobacion: Number(e.target.value),
                }))
              }
              size="small"
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <div>
          {esEdicion && (
            <Button
              onClick={handleEliminar}
              variant="text"
              disabled={eliminando}
              startIcon={
                eliminando ? (
                  <CircularProgress size={14} color="inherit" />
                ) : undefined
              }
              sx={{
                color: "#dc2626",
                borderRadius: 2,
                "&:hover": { bgcolor: "#fef2f2" },
              }}
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
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
            {guardando
              ? "Guardando..."
              : esEdicion
                ? "Actualizar"
                : "Crear quiz"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCrearQuiz;
