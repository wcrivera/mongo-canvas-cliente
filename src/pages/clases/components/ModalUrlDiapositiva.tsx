import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, CircularProgress,
} from "@mui/material";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { useAppDispatch } from "../../../store/hooks";
import { crearDiapositiva, editarUrlDiapositiva, eliminarDiapositiva } from "../../../store/slices/diapositiva";
import type { IDiapositiva } from "../../../store/slices/diapositiva";

interface Props {
  contexto:      "clase" | "ayudantia";
  tema_id?:      string;
  ayudantia_id?: string;
  capitulo_id:   string;
  curso_id:      string;
  titulo:        string;
  diapositiva?:  IDiapositiva;
  onClose:       () => void;
}

const ModalUrlDiapositiva = ({ contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, diapositiva, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [url,        setUrl]        = useState(diapositiva?.url ?? "");
  const [guardando,  setGuardando]  = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const esEdicion = !!diapositiva;

  const handleGuardar = async () => {
    if (!url.trim()) { setError("La URL es requerida"); return; }
    setError(null);
    setGuardando(true);
    let resultado;
    if (esEdicion) {
      resultado = await dispatch(editarUrlDiapositiva({ diapositiva_id: diapositiva._id, url }));
    } else {
      resultado = await dispatch(crearDiapositiva({ contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, url }));
    }
    setGuardando(false);
    if ((resultado as { ok: boolean }).ok) { onClose(); }
    else { setError("Error al guardar la diapositiva"); }
  };

  const handleEliminar = async () => {
    if (!diapositiva) return;
    setEliminando(true);
    await dispatch(eliminarDiapositiva({ diapositiva_id: diapositiva._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
      <DialogTitle sx={{ bgcolor: "#f47c3c", color: "white", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <SlideshowIcon />
        <span>{esEdicion ? "Editar diapositiva" : "Agregar diapositiva"}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#6793ba", mb: 2 }}>
          Ingresa la URL de la diapositiva (Google Slides, Canva, etc.)
        </Typography>
        <TextField
          label="URL de la diapositiva"
          placeholder="https://docs.google.com/presentation/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth size="small" autoFocus
          error={!!error} helperText={error ?? ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        {url.trim() && (
          <div className="mt-4 rounded-xl overflow-hidden animate-fadeIn"
            style={{ border: "1px solid #d9e4ee" }}>
            <div style={{ padding: "8px 12px", background: "#f0f4f8", fontSize: 11, color: "#6793ba", fontWeight: 500 }}>
              Preview
            </div>
            <iframe src={url} style={{ width: "100%", height: 200, border: "none", display: "block" }} title="Preview diapositiva" />
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <div>
          {esEdicion && (
            <Button onClick={handleEliminar} variant="text" disabled={eliminando}
              startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ color: "#dc2626", borderRadius: 2, "&:hover": { bgcolor: "#fef2f2" } }}>
              {eliminando ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={onClose} variant="text" sx={{ color: "#6793ba", borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} variant="contained"
            disabled={guardando || !url.trim()}
            startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ bgcolor: "#f47c3c", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#e06020", boxShadow: "none" },
              "&:disabled": { bgcolor: "#fad3b8" } }}>
            {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ModalUrlDiapositiva;