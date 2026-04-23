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
import DescriptionIcon from "@mui/icons-material/Description";
import { useAppDispatch } from "../../store/hooks";
import {
  crearSolucionTexto,
  editarSolucionTexto,
} from "../../store/slices/solucionTexto";
import type { ISolucionTexto } from "../../store/slices/solucionTexto";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  ayudantia_id: string;
  solucion?: ISolucionTexto;
  onClose: () => void;
}

const ModalSolucionTexto = ({ ayudantia_id, solucion, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [texto, setTexto] = useState(solucion?.texto ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const esEdicion = !!solucion;

  const handleGuardar = async () => {
    if (!texto.trim()) {
      setError("El texto es requerido");
      return;
    }
    setError(null);
    setGuardando(true);

    let resultado;
    if (esEdicion) {
      resultado = await dispatch(
        editarSolucionTexto({ solucion_id: solucion._id, texto }),
      );
    } else {
      resultado = await dispatch(crearSolucionTexto({ ayudantia_id, texto }));
    }

    setGuardando(false);
    if ((resultado as { ok: boolean }).ok) {
      onClose();
    } else {
      setError("Error al guardar la solución");
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
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
        <DescriptionIcon />
        <span>{esEdicion ? "Editar solución" : "Agregar solución"}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {/* Tabs texto / preview */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPreview(false)}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid #d9e4ee",
              background: !preview ? "#4A6D8C" : "white",
              color: !preview ? "white" : "#4A6D8C",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Editar
          </button>
          <button
            onClick={() => setPreview(true)}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid #d9e4ee",
              background: preview ? "#4A6D8C" : "white",
              color: preview ? "white" : "#4A6D8C",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Preview LaTeX
          </button>
        </div>

        {!preview ? (
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe la solución con LaTeX... ej: La solución es $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$"
            autoFocus
            style={{
              width: "100%",
              minHeight: 260,
              padding: "12px",
              borderRadius: 8,
              border: "1px solid #d9e4ee",
              fontSize: 14,
              fontFamily: "monospace",
              resize: "vertical",
              outline: "none",
              lineHeight: 1.6,
            }}
          />
        ) : (
          <div
            style={{
              minHeight: 260,
              padding: "16px",
              borderRadius: 8,
              border: "1px solid #d9e4ee",
              fontSize: 15,
              lineHeight: 1.8,
              color: "#1f2c38",
              background: "#fafafa",
            }}
          >
            {texto.trim() ? (
              <LatexRenderer>{texto}</LatexRenderer>
            ) : (
              <span style={{ color: "#8daecb", fontStyle: "italic" }}>
                El preview aparecerá aquí...
              </span>
            )}
          </div>
        )}

        {error && (
          <Typography
            variant="caption"
            sx={{ color: "#ef4444", mt: 1, display: "block" }}
          >
            {error}
          </Typography>
        )}

        <Typography
          variant="caption"
          sx={{ color: "#8daecb", mt: 1, display: "block" }}
        >
          Usa $...$ para LaTeX inline y $$...$$ para bloques
        </Typography>
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
          disabled={guardando || !texto.trim()}
          startIcon={
            guardando ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
          sx={{
            bgcolor: "#4A6D8C",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
          }}
        >
          {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSolucionTexto;
