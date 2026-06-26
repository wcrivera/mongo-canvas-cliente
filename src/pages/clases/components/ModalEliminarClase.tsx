import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { eliminarClase, type IClase } from "@/store/slices/clase";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { WarningAmber } from "@mui/icons-material";

export const ModalEliminarClase = ({
  clase,
  onClose,
}: {
  clase:   IClase;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarClase({ clase_id: clase._id }));
    setEliminando(false);
    onClose();
  };

  const tieneSynced = clase.canvas_deployments.some((d) => d.status === "synced");

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{
        bgcolor: "#fef2f2", color: "#991b1b",
        display: "flex", alignItems: "center", gap: 1.5, py: 2,
      }}>
        <WarningAmber />
        <span>Eliminar clase</span>
      </DialogTitle>
      <DialogContent sx={{ mt: 3, pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Eliminar la clase <strong>{clase.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: tieneSynced ? 2 : 0 }}>
          Se eliminarán todos los temas y recursos asociados.
          Esta acción no se puede deshacer.
        </Typography>
        {tieneSynced && (
          <Typography variant="caption" sx={{
            color: "#854d0e", bgcolor: "#fef9c3",
            borderRadius: 1.5, px: 1.5, py: 0.75, display: "block",
          }}>
            ⚠️ El item también se eliminará de Canvas.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleEliminar}
          variant="contained"
          disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: "#dc2626", borderRadius: 2, px: 3, fontWeight: 600,
            boxShadow: "none", "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" },
          }}
        >
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};