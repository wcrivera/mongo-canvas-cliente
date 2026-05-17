import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAppDispatch } from "../../../store/hooks";
import type { ITema } from "../../../store/slices/tema";

const ModalEliminarTema = ({
  tema,
  onClose,
}: {
  tema: ITema;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    const { eliminarTema } = await import("../../../store/slices/tema");
    await dispatch(eliminarTema({ tema_id: tema._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1E293B",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
          px: 3,
          fontFamily: "Georgia, serif",
          fontSize: "17px",
          fontWeight: "normal",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#DC2626",
            border: "1px solid #EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 16, color: "white" }} />
        </div>
        Eliminar tema
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#334155", mb: 1.5 }}>
          ¿Eliminar el tema{" "}
          <strong style={{ color: "#0F172A" }}>{tema.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Se eliminarán todas las diapositivas, videos y quizzes asociados. Esta
          acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#94A3B8",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
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
            bgcolor: "#DC2626",
            borderRadius: "8px",
            px: 2.5,
            fontWeight: 500,
            fontSize: "13px",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
          }}
        >
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ModalEliminarTema;
