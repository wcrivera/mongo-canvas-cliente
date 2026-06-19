import { useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, CircularProgress,
} from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import { useAppDispatch } from "../../../store/hooks";
import { crearCapitulo } from "../../../store/slices/capitulo";
import { chapter } from "../../../db/db";

const ModalCrearCapitulo = ({
  curso_id,
  onClose,
}: {
  curso_id: string;
  onClose:  () => void;
}) => {
  const dispatch = useAppDispatch();

  const [nombre,   setNombre]   = useState("");
  const [creando,  setCreando]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleCrear = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim) { setError("El nombre es requerido"); return; }
    setError(null);
    setCreando(true);
    await dispatch(crearCapitulo({ curso_id, nombre: nombreTrim }));
    setCreando(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCrear();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{
        bgcolor: "#1E293B", color: "white",
        display: "flex", alignItems: "center", gap: 1.5, py: 2,
      }}>
        <LayersIcon />
        <span>Nuevo {chapter.name}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: "20px !important", pb: 1, overflow: "visible" }}>
        <TextField
          label={`Nombre del ${chapter.name}`}
          placeholder="ej: Límites y continuidad"
          value={nombre}
          onChange={(e) => { setNombre(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          error={!!error}
          helperText={error ?? ""}
          required
          size="small"
          fullWidth
          autoFocus
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
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
          onClick={handleCrear}
          variant="contained"
          disabled={creando || !nombre.trim()}
          startIcon={creando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: "#1E293B", borderRadius: 2, px: 3, fontWeight: 600,
            boxShadow: "none",
            "&:hover":    { bgcolor: "#334155", boxShadow: "none" },
            "&:disabled": { bgcolor: "#94a3b8" },
          }}
        >
          {creando ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCrearCapitulo;