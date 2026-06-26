import { Button, CircularProgress, TextField, Typography } from "@mui/material";
import { BaseModal } from "@/components/BaseModal/BaseModal";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { crearMongoCurso } from "@/store/slices/mongoCurso";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

const CrearCurso = ({ onClose }: Props) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({ codigo: "", nombre: "", descripcion: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!form.codigo.trim() || !form.nombre.trim()) {
      setError("El código y el nombre son obligatorios");
      return;
    }
    setGuardando(true);
    setError(null);
    await dispatch(crearMongoCurso(form));
    setGuardando(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !guardando) handleGuardar();
    if (e.key === "Escape") onClose();
  };

  return (
    <BaseModal
      open
      title="Nuevo curso"
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
            disabled={guardando || !form.codigo.trim() || !form.nombre.trim()}
            startIcon={
              guardando ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={{
              bgcolor: "#2563EB",
              borderRadius: "8px",
              px: 2.5,
              fontWeight: 500,
              fontSize: "13px",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
            }}
          >
            {guardando ? "Creando..." : "Crear curso"}
          </Button>
        </>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 12,
          marginTop: 25,
        }}
      >
        <TextField
          label="Código *"
          value={form.codigo}
          onChange={(e) =>
            setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))
          }
          size="small"
          fullWidth
          autoFocus
          placeholder="MAT1220"
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            "& input": { fontFamily: "monospace", letterSpacing: "0.05em" },
          }}
        />
        <TextField
          label="Nombre *"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          size="small"
          fullWidth
          placeholder="Cálculo Diferencial"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
      </div>

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
        placeholder="Descripción opcional del curso"
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

export default CrearCurso;
