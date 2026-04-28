import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import type { IMongoCurso } from "../../../types/mongo.types";
import { editarMongoCurso } from "../../../store/slices/mongoCurso";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";

interface ModalEditarProps {
  curso:   IMongoCurso;
  onClose: () => void;
}

export const ModalEditarCurso = ({ curso, onClose }: ModalEditarProps) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    nombre:      curso.nombre,
    descripcion: curso.descripcion ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setGuardando(true);
    setError(null);
    const resultado = await dispatch(
      editarMongoCurso({ curso_id: curso._id, ...form }),
    ) as unknown as { ok: boolean; msg?: string };
    setGuardando(false);
    if (resultado.ok) {
      onClose();
    } else {
      setError(resultado.msg ?? "Error al guardar");
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#4A6D8C",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <MenuBookIcon />
        <span>Editar curso</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Código — solo lectura */}
        <TextField
            sx={{ mt: 3, "& .MuiInputBase-root": { bgcolor: "#f5f7fa" } }}
          label="Código"
          value={curso.codigo}
          disabled
          size="small"
          fullWidth
        //   sx={{ "& .MuiInputBase-root": { bgcolor: "#f5f7fa" } }}
          helperText="El código no se puede modificar"
        />

        <TextField
          label="Nombre *"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          size="small"
          fullWidth
          autoFocus
          error={!!error && !form.nombre.trim()}
        />

        <TextField
          label="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          size="small"
          fullWidth
          multiline
          rows={2}
        />

        {error && (
          <Typography variant="caption" sx={{ color: "#ef4444" }}>
            {error}
          </Typography>
        )}
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
          disabled={guardando}
          startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: "#4A6D8C",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
          }}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};