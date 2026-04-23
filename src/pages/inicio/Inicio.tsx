import { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerMongoCursos,
  crearMongoCurso,
  type IMongoCurso,
} from "../../store/slices/mongoCurso";
import MongoCursoCard from "./MongoCursoCard";

const Inicio = () => {
  const dispatch = useAppDispatch();
  const { cursos, isLoading, error } = useAppSelector((s) => s.mongoCurso);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", nombre: "", descripcion: "" });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    dispatch(obtenerMongoCursos());
  }, [dispatch]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim()) return;
    setGuardando(true);
    await dispatch(crearMongoCurso(form));
    setGuardando(false);
    setForm({ codigo: "", nombre: "", descripcion: "" });
    setMostrarForm(false);
  };

  const handleEditar = (curso: IMongoCurso) => {
    console.log("Editar", curso._id); // TODO
  };

  const handleEliminar = (curso_id: string) => {
    console.log("Eliminar", curso_id); // TODO
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: "#4A6D8C" }}>
            <MenuBookIcon sx={{ color: "white", fontSize: 22 }} />
          </div>
          <div>
            <Typography variant="h5" sx={{ color: "#1f2c38", lineHeight: 1.2, fontWeight: 700 }}>
              Mis cursos
            </Typography>
            <Typography variant="caption" sx={{ color: "#6793ba" }}>
              {cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado{cursos.length !== 1 ? "s" : ""}
            </Typography>
          </div>
        </div>

        <Button
          variant="contained"
          startIcon={mostrarForm ? undefined : <AddIcon />}
          onClick={() => setMostrarForm((v) => !v)}
          sx={{
            bgcolor: mostrarForm ? "#6793ba" : "#4A6D8C",
            borderRadius: 2.5,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
          }}
        >
          {mostrarForm ? "Cancelar" : "Nuevo curso"}
        </Button>
      </div>

      {/* ── Formulario de creación ── */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="mb-8 rounded-2xl p-6 animate-slideDown"
          style={{
            background: "white",
            border: "1px solid #d9e4ee",
            boxShadow: "0 4px 16px rgba(74,109,140,0.08)",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#2e4154", mb: 3, fontWeight: 600 }}>
            Nuevo curso
          </Typography>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <TextField
              label="Código"
              placeholder="MAT1220"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              required
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Nombre"
              placeholder="Cálculo 2"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </div>

          <TextField
            label="Descripción (opcional)"
            placeholder="Descripción breve del curso"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            fullWidth
            size="small"
            sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="text"
              onClick={() => setMostrarForm(false)}
              sx={{ color: "#6793ba", borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
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
              {guardando ? "Guardando..." : "Crear curso"}
            </Button>
          </div>
        </form>
      )}

      {/* ── Estados ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <CircularProgress sx={{ color: "#4A6D8C" }} />
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Empty state ── */}
      {!isLoading && cursos.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <MenuBookIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>
            No hay cursos registrados
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea tu primer curso con el botón "Nuevo curso"
          </Typography>
        </div>
      )}

      {/* ── Grid de cards ── */}
      {!isLoading && cursos.length > 0 && (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
          {cursos.map((curso) => (
            <li key={curso._id}>
              <MongoCursoCard
                curso={curso}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inicio;