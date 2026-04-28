import { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon      from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerMongoCursos,
  crearMongoCurso,
  type IMongoCurso,
} from "../../store/slices/mongoCurso";
import MongoCursoCard from "./components/MongoCursoCard";

import { ModalEditarCurso } from "./components/ModalEditarCurso";
import { ModalEliminarCurso } from "./components/ModalEliminarCurso";

// ─── Página principal ─────────────────────────────────────────────────────────

const Inicio = () => {
  const dispatch = useAppDispatch();
  const { cursos, isLoading, error } = useAppSelector((s) => s.mongoCurso);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState({ codigo: "", nombre: "", descripcion: "" });
  const [guardando, setGuardando]     = useState(false);

  const [modalEditar,   setModalEditar]   = useState<IMongoCurso | null>(null);
  const [modalEliminar, setModalEliminar] = useState<IMongoCurso | null>(null);

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

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: "#4A6D8C" }}
          >
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
          className="bg-white rounded-2xl border border-[#d9e4ee] p-5 mb-6 animate-fadeIn"
        >
          <Typography variant="subtitle2" sx={{ color: "#4A6D8C", fontWeight: 600, mb: 2 }}>
            Nuevo curso
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <TextField
              label="Código *"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              size="small"
              fullWidth
              placeholder="MAT1220"
            />
            <TextField
              label="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              size="small"
              fullWidth
              className="sm:col-span-2"
              placeholder="Cálculo II"
            />
          </div>
          <TextField
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            size="small"
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 3 }}
            placeholder="Descripción opcional del curso"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="contained"
              disabled={guardando || !form.codigo.trim() || !form.nombre.trim()}
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
          {cursos.map((curso) => (
            <div key={curso._id}>
              <MongoCursoCard
                curso={curso}
                onEditar={(c) => setModalEditar(c)}
                onEliminar={(c) => setModalEliminar(c)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Modales ── */}
      {modalEditar && (
        <ModalEditarCurso
          curso={modalEditar}
          onClose={() => setModalEditar(null)}
        />
      )}

      {modalEliminar && (
        <ModalEliminarCurso
          curso={modalEliminar}
          onClose={() => setModalEliminar(null)}
        />
      )}
    </div>
  );
};

export default Inicio;