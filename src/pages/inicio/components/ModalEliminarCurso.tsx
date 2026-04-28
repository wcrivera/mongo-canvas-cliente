// ─── Modal de confirmación de eliminación ─────────────────────────────────────

import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { eliminarMongoCurso, type IMongoCurso } from "../../../store/slices/mongoCurso";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface ModalEliminarProps {
  curso:   IMongoCurso;
  onClose: () => void;
}

export const ModalEliminarCurso = ({ curso, onClose }: ModalEliminarProps) => {
  const dispatch    = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleEliminar = async () => {
    setEliminando(true);
    setError(null);
    const resultado = await dispatch(
      eliminarMongoCurso({ curso_id: curso._id }),
    ) as unknown as { ok: boolean; msg?: string };
    setEliminando(false);
    if (resultado.ok) {
      onClose();
    } else {
      setError(resultado.msg ?? "Error al eliminar");
    }
  };

  const tieneCanvas = curso.canvas_cursos.length > 0;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#fef2f2",
          color: "#991b1b",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <WarningAmberIcon />
        <span>Eliminar curso</span>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Estás seguro de que quieres eliminar{" "}
          <strong>{curso.nombre}</strong>?
        </Typography>

        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
          Se eliminarán de forma permanente todos los capítulos, clases,
          temas, recursos, quizzes, ayudantías y ejercicios asociados.
          Esta acción no se puede deshacer.
        </Typography>

        {tieneCanvas && (
          <Alert severity="warning" sx={{ borderRadius: 2, mb: 1 }}>
            Este curso tiene {curso.canvas_cursos.length} curso
            {curso.canvas_cursos.length !== 1 ? "s" : ""} Canvas asociado
            {curso.canvas_cursos.length !== 1 ? "s" : ""}. El contenido
            en Canvas <strong>no se eliminará</strong> automáticamente.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleEliminar}
          variant="contained"
          disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: "#dc2626",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" },
          }}
        >
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};