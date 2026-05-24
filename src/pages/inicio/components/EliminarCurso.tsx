import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import { BaseModal } from "../../../components/BaseModal/BaseModal";
import type { IMongoCurso } from "../../../types/mongo.types";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAppDispatch } from "../../../store/hooks";
import { eliminarMongoCurso } from "../../../store/slices/mongoCurso";
import { useState } from "react";

interface Props {
  curso: IMongoCurso;
  onClose: () => void;
}

const EliminarCurso = ({ curso, onClose }: Props) => {
  const dispatch = useAppDispatch();

  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleEliminar = async () => {
    setEliminando(true);
    setError(null);
    const resultado = (await dispatch(
      eliminarMongoCurso({ curso_id: curso._id }),
    )) as unknown as { ok: boolean; msg?: string };
    setEliminando(false);
    if (resultado.ok) {
      onClose();
    } else {
      setError(resultado.msg ?? "Error al eliminar");
    }
  };
  return (
    <BaseModal
      open
      title="Eliminar curso"
      icon={<WarningAmberIcon sx={{ fontSize: 16, color: "white" }} />}
      iconBg="#991b1b"
      iconBorder="#991b1b"
      onClose={onClose}
      actions={
        <>
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
              bgcolor: "#991b1b",
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
        </>
      }
    >
      <Typography variant="body2" sx={{ color: "#334155", mt: 2 }}>
        ¿Estás seguro de que quieres eliminar{" "}
        <strong style={{ color: "#0F172A" }}>{curso.nombre}</strong>?
      </Typography>

      <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.65 }}>
        Se eliminarán permanentemente todos los capítulos, clases, temas,
        recursos, quizzes, ayudantías y ejercicios asociados. Esta acción no se
        puede deshacer.
      </Typography>

      {curso.canvas_cursos.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: "8px", fontSize: 13 }}>
          Este curso tiene <strong>{curso.canvas_cursos.length}</strong> curso
          {curso.canvas_cursos.length !== 1 ? "s" : ""} Canvas asociado
          {curso.canvas_cursos.length !== 1 ? "s" : ""}. El contenido en Canvas{" "}
          <strong>no se eliminará</strong> automáticamente.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: "8px", fontSize: 13 }}>
          {error}
        </Alert>
      )}
    </BaseModal>
  );
};

export default EliminarCurso;
