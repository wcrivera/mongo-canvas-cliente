import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  crearSolucionTexto,
  editarSolucionTexto,
  eliminarSolucionTexto,
} from "../../../store/slices/solucionTexto";
import type { ISolucionTexto } from "../../../store/slices/solucionTexto";
import MathTextEditor from "../../../components/CKEditor/MathTextEditor";
import { normalizeForEditor } from "../../../components/CKEditor/mathUtils";

interface Props {
  ayudantia_id: string;
  solucion?:    ISolucionTexto;
  onClose:      () => void;
}

const esVacio = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

const ModalSolucionTexto = ({ ayudantia_id, solucion, onClose }: Props) => {
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector((s) => s.mongoCurso.cursoActivo?.codigo ?? "");

  const [texto,     setTexto]     = useState("");
  const [guardando,  setGuardando]  = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const esEdicion = !!solucion;

  const handleGuardar = async () => {
    if (esVacio(texto)) { setError("El texto es requerido"); return; }
    setError(null);
    setGuardando(true);

    let resultado;
    if (esEdicion) {
      resultado = await dispatch(editarSolucionTexto({ solucion_id: solucion._id, texto }));
    } else {
      resultado = await dispatch(crearSolucionTexto({ ayudantia_id, texto }));
    }

    setGuardando(false);
    if ((resultado as { ok: boolean }).ok) { onClose(); }
    else { setError("Error al guardar la solución"); }
  };

  const handleEliminar = async () => {
    if (!solucion) return;
    setEliminando(true);
    await dispatch(eliminarSolucionTexto({ solucion_id: solucion._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
      <DialogTitle sx={{ bgcolor: "#4A6D8C", color: "white", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <DescriptionIcon />
        <span>{esEdicion ? "Editar solución" : "Agregar solución"}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <MathTextEditor initialData={normalizeForEditor(solucion?.texto ?? "")} onChange={setTexto} siglaCurso={siglaCurso} />
        {error && (
          <Typography variant="caption" sx={{ color: "#ef4444", mt: 1, display: "block" }}>
            {error}
          </Typography>
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
          <Button onClick={handleGuardar} variant="contained" disabled={guardando}
            startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
            {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSolucionTexto;