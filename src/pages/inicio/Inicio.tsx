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
import CloseIcon from "@mui/icons-material/Close";
import BookIcon from "@mui/icons-material/Book";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerMongoCursos,
  crearMongoCurso,
  type IMongoCurso,
} from "../../store/slices/mongoCurso";
import MongoCursoCard from "./components/MongoCursoCard";
import { ModalEditarCurso } from "./components/ModalEditarCurso";
import { ModalEliminarCurso } from "./components/ModalEliminarCurso";

import StatCard from "./components/StatCard";

// ─── Página principal ─────────────────────────────────────────────────────────

const Inicio = () => {
  const dispatch = useAppDispatch();
  const { cursos, isLoading, error } = useAppSelector((s) => s.mongoCurso);

  console.log(cursos)

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", nombre: "", descripcion: "" });
  const [guardando, setGuardando] = useState(false);

  const [modalEditar, setModalEditar] = useState<IMongoCurso | null>(null);
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
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="p-6">
        {/* ── Header de página ── */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center">
              <MenuBookIcon sx={{ color: "#2563EB", fontSize: 22 }} />
            </div>
            <div>
              <Typography
                variant="h5"
                sx={{
                  color: "#1E293B",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  fontSize: "22px",
                }}
              >
                Mis cursos
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontSize: "13px" }}
              >
                {cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado
                {cursos.length !== 1 ? "s" : ""}
              </Typography>
            </div>
          </div>

          <Button
            variant="contained"
            startIcon={mostrarForm ? <CloseIcon /> : <AddIcon />}
            onClick={() => setMostrarForm((v) => !v)}
            sx={{
              bgcolor: mostrarForm ? "#64748B" : "#2563EB",
              borderRadius: "10px",
              px: 2.5,
              py: 1.2,
              fontWeight: 500,
              fontSize: "13px",
              boxShadow: "none",
              textTransform: "none",
              "&:hover": {
                bgcolor: mostrarForm ? "#475569" : "#1D4ED8",
                boxShadow: "none",
              },
            }}
          >
            {mostrarForm ? "Cancelar" : "Nuevo curso"}
          </Button>
        </div>

        {/* ── Stats ── */}
        {!isLoading && cursos.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Cursos totales"
              value={cursos.length}
              icon={<BookIcon sx={{ fontSize: 20 }} />}
              iconColor="#2563EB"
              iconBg="#EFF6FF"
            />
            <StatCard
              label="Activos"
              value={cursos.filter((c) => c.published_api).length}
              icon={<ToggleOnIcon sx={{ fontSize: 20 }} />}
              iconColor="#16A34A"
              iconBg="#F0FDF4"
            />
            <StatCard
              label="Con Canvas"
              value={cursos.filter((c) => c.canvas_cursos.length > 0).length}
              icon={<LinkIcon sx={{ fontSize: 20 }} />}
              iconColor="#9333EA"
              iconBg="#FAF5FF"
            />
            <StatCard
              label="Sin asociar"
              value={cursos.filter((c) => c.canvas_cursos.length === 0).length}
              icon={<LinkOffIcon sx={{ fontSize: 20 }} />}
              iconColor="#EA580C"
              iconBg="#FFF7ED"
            />
          </div>
        )}

        {/* ── Formulario de creación ── */}
        {mostrarForm && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6">
            <p className="text-sm font-medium text-[#1E293B] mb-4">
              Nuevo curso
            </p>
            <form onSubmit={handleCrear}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <TextField
                  label="Código *"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, codigo: e.target.value }))
                  }
                  size="small"
                  fullWidth
                  placeholder="MAT1220"
                />
                <TextField
                  label="Nombre *"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  size="small"
                  fullWidth
                  className="sm:col-span-2"
                  placeholder="Cálculo II"
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
                sx={{ mb: 3 }}
                placeholder="Descripción opcional del curso"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    guardando || !form.codigo.trim() || !form.nombre.trim()
                  }
                  startIcon={
                    guardando ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <AddIcon />
                    )
                  }
                  sx={{
                    bgcolor: "#2563EB",
                    borderRadius: "8px",
                    px: 3,
                    fontWeight: 500,
                    fontSize: "13px",
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
                  }}
                >
                  {guardando ? "Guardando..." : "Crear curso"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <CircularProgress sx={{ color: "#2563EB" }} />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {/* ── Empty state ── */}
        {!isLoading && cursos.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <MenuBookIcon sx={{ fontSize: 32, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">
              No hay cursos registrados
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Crea tu primer curso con el botón "Nuevo curso"
            </p>
          </div>
        )}

        {/* ── Grid de cards ── */}
        {!isLoading && cursos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <MongoCursoCard
                key={curso._id}
                curso={curso}
                onEditar={(c) => setModalEditar(c)}
                onEliminar={(c) => setModalEliminar(c)}
              />
            ))}
          </div>
        )}
      </div>

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