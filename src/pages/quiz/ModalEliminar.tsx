import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { eliminarPregunta } from "../../store/slices/quiz";
import { useAppDispatch } from "../../store/hooks";
import type { IPregunta } from "../../store/slices/quiz";

interface Props {
  pregunta: IPregunta;
  onClose: () => void;
}

const ModalEliminar = ({ pregunta, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarPregunta({ pregunta_id: pregunta._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#1e293b" }}>
        ¿Eliminar pregunta?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Esta acción no se puede deshacer.
        </Typography>
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
          startIcon={
            eliminando ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
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

export default ModalEliminar;
