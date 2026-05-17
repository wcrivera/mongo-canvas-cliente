// src/pages/inicio/components/ModalEliminarCurso.tsx
import { useState }       from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Typography, Alert,
} from "@mui/material";
import WarningAmberIcon   from "@mui/icons-material/WarningAmber";
import { useAppDispatch } from "../../../store/hooks";
import { eliminarMongoCurso, type IMongoCurso } from "../../../store/slices/mongoCurso";

interface Props {
  curso:   IMongoCurso;
  onClose: () => void;
}

export const ModalEliminarCurso = ({ curso, onClose }: Props) => {
  const dispatch = useAppDispatch();

  const [eliminando, setEliminando] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleEliminar = async () => {
    setEliminando(true);
    setError(null);
    const resultado = await dispatch(
      eliminarMongoCurso({ curso_id: curso._id }),
    ) as unknown as { ok: boolean; msg?: string };
    setEliminando(false);
    if (resultado.ok) {
      onClose();
    } else {
      setError(resultado.msg ?? "Error al eliminar");
    }
  };

  const tieneCanvas = curso.canvas_cursos.length > 0;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor:    "#1E293B",
          color:      "white",
          display:    "flex",
          alignItems: "center",
          gap:        1.5,
          py:         2,
          px:         3,
          fontFamily: "Georgia, serif",
          fontSize:   "17px",
          fontWeight: "normal",
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "#DC2626", border: "1px solid #EF4444",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <WarningAmberIcon sx={{ fontSize: 16, color: "white" }} />
        </div>
        Eliminar curso
      </DialogTitle>

      {/* Contenido */}
      <DialogContent sx={{ pt: 3, pb: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>

        <Typography variant="body2" sx={{ color: "#334155", mt: 2 }}>
          ¿Estás seguro de que quieres eliminar{" "}
          <strong style={{ color: "#0F172A" }}>{curso.nombre}</strong>?
        </Typography>

        <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.65 }}>
          Se eliminarán permanentemente todos los capítulos, clases, temas,
          recursos, quizzes, ayudantías y ejercicios asociados.
          Esta acción no se puede deshacer.
        </Typography>

        {tieneCanvas && (
          <Alert
            severity="warning"
            sx={{ borderRadius: "8px", fontSize: 13 }}
          >
            Este curso tiene{" "}
            <strong>{curso.canvas_cursos.length}</strong> curso
            {curso.canvas_cursos.length !== 1 ? "s" : ""} Canvas asociado
            {curso.canvas_cursos.length !== 1 ? "s" : ""}.
            El contenido en Canvas <strong>no se eliminará</strong> automáticamente.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: "8px", fontSize: 13 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      {/* Acciones */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#94A3B8", textTransform: "none", borderRadius: "8px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleEliminar}
          variant="contained"
          disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor:       "#DC2626",
            borderRadius:  "8px",
            px:            2.5,
            fontWeight:    500,
            fontSize:      "13px",
            textTransform: "none",
            boxShadow:     "none",
            "&:hover":     { bgcolor: "#B91C1C", boxShadow: "none" },
          }}
        >
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};