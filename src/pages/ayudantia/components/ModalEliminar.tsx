// ─── Modal eliminar ───────────────────────────────────────────────────────────

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  eliminarAyudantia,
  type IAyudantia,
} from "@/store/slices/ayudantia";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";

export const ModalEliminar = ({
  ayudantia,
  onClose,
}: {
  ayudantia: IAyudantia;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarAyudantia({ ayudantia_id: ayudantia._id }));
    setEliminando(false);
    onClose();
  };

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
        <WarningAmber />
        <span>Eliminar ayudantía</span>
      </DialogTitle>
      <DialogContent sx={{ mt: 3, pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Eliminarrr <strong>{ayudantia.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Se eliminarán todos los recursos asociados (solución, video, quiz).
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
