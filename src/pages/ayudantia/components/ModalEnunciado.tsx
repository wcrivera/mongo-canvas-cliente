import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { editarAyudantia, type IAyudantia } from "../../../store/slices/ayudantia";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import MathTextEditor from "../../../components/CKEditor/MathTextEditor";

export const ModalEnunciado = ({
  ayudantia,
  onClose,
}: {
  ayudantia: IAyudantia;
  onClose:   () => void;
}) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");

  const [enunciado, setEnunciado] = useState(ayudantia.enunciado);
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarAyudantia({ ayudantia_id: ayudantia._id, enunciado }));
    setGuardando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{
        bgcolor: "#4A6D8C", color: "white",
        display: "flex", alignItems: "center", gap: 1.5, py: 2,
      }}>
        <EditOutlined />
        <span>Enunciado — {ayudantia.nombre}</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <MathTextEditor
          initialData={enunciado}
          onChange={setEnunciado}
          siglaCurso={siglaCurso}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="text" sx={{ color: "#6793ba", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={guardando}
          startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
            boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
          }}
        >
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};