import type { IMongoCurso } from "../../../types/mongo.types";
import { BaseModal } from "../../../components/BaseModal/BaseModal";
import { Button, CircularProgress, TextField, Typography } from "@mui/material";
import { editarMongoCurso } from "../../../store/slices/mongoCurso";
import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import MenuBookIcon from "@mui/icons-material/MenuBook";

interface Props {
  curso: IMongoCurso;
  onClose: () => void;
}

const EditarCurso = ({ curso, onClose }: Props) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    nombre: curso.nombre,
    descripcion: curso.descripcion ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setGuardando(true);
    setError(null);
    const resultado = (await dispatch(
      editarMongoCurso({ curso_id: curso._id, ...form }),
    )) as unknown as { ok: boolean; msg?: string };
    setGuardando(false);
    if (resultado.ok) {
      onClose();
    } else {
      setError(resultado.msg ?? "Error al guardar");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !guardando) handleGuardar();
    if (e.key === "Escape") onClose();
  };
  return (
    <BaseModal
      open
      title="Editar curso"
      icon={<MenuBookIcon sx={{ fontSize: 16, color: "white" }} />}
      iconBg="#2563EB"
      iconBorder="#3B82F6"
      onClose={onClose}
      onKeyDown={handleKeyDown}
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
            onClick={handleGuardar}
            variant="contained"
            disabled={guardando || !form.nombre.trim()}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            {guardando ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Guardar"
            )}
          </Button>
        </>
      }
    >
      {/* Código — solo lectura */}
      <TextField
        label="Código"
        value={curso.codigo}
        disabled
        size="small"
        fullWidth
        helperText="El código no se puede modificar"
        sx={{
          mt: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            bgcolor: "#F8FAFC",
          },
          "& input": { fontFamily: "monospace", letterSpacing: "0.05em" },
        }}
      />

      <TextField
        label="Nombre *"
        value={form.nombre}
        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
        size="small"
        fullWidth
        autoFocus
        error={!form.nombre.trim()}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
      />

      <TextField
        label="Descripción"
        value={form.descripcion}
        onChange={(e) =>
          setForm((f) => ({ ...f, descripcion: e.target.value }))
        }
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="Descripción opcional"
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
      />

      {error && (
        <Typography variant="caption" sx={{ color: "#EF4444" }}>
          {error}
        </Typography>
      )}
    </BaseModal>
  );
};

export default EditarCurso;
