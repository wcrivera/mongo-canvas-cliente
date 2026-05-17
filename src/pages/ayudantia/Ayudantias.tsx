// src/pages/ayudantia/Ayudantias.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, TextField, Typography,
  CircularProgress, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon    from "@mui/icons-material/Upload";
import AddIcon       from "@mui/icons-material/Add";
import GroupsIcon    from "@mui/icons-material/Groups";

import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { obtenerMongoCurso }              from "../../store/slices/mongoCurso";
import { obtenerCapituloActivo }          from "../../store/slices/capitulo";
import {
  obtenerAyudantiasPorCapitulo, crearAyudantia,
  limpiarAyudantias, cambiarPositionAyudantia,
} from "../../store/slices/ayudantia";
import { obtenerSolucionesPorCapitulo, limpiarSoluciones } from "../../store/slices/solucionTexto";
import { obtenerVideosPorCapitulo, limpiarVideos }         from "../../store/slices/video";
import { obtenerQuizzesPorCapitulo, limpiarQuizzes }       from "../../store/slices/quiz";
import { fetchConToken }       from "../../helpers/fetch";
import SortableAyudantiaCard   from "./components/SortableAyudantiaCard";

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { label: "Clases",     key: "clases"     },
  { label: "Ayudantías", key: "ayudantias" },
  { label: "Ejercicios", key: "ejercicios" },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────
const Ayudantias = () => {
  const { curso_id, capitulo_id } = useParams<{ curso_id: string; capitulo_id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const { cursoActivo }   = useAppSelector((s) => s.mongoCurso);
  const { capituloActivo } = useAppSelector((s) => s.capituloMongo);
  const { ayudantias, isLoading, error } = useAppSelector((s) => s.ayudantiaMongo);

  const [nombre,      setNombre]      = useState("");
  const [guardando,   setGuardando]   = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [desplegando, setDesplegando] = useState(false);
  const [msgDeploy,   setMsgDeploy]   = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapituloActivo({ capitulo_id }));
    dispatch(obtenerAyudantiasPorCapitulo({ capitulo_id }));
    dispatch(obtenerSolucionesPorCapitulo({ capitulo_id }));
    dispatch(obtenerVideosPorCapitulo({ capitulo_id }));
    dispatch(obtenerQuizzesPorCapitulo({ capitulo_id }));
    return () => {
      dispatch(limpiarAyudantias());
      dispatch(limpiarSoluciones());
      dispatch(limpiarVideos());
      dispatch(limpiarQuizzes());
    };
  }, [curso_id, capitulo_id, dispatch]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim || !capitulo_id) return;
    setGuardando(true);
    await dispatch(crearAyudantia({ capitulo_id, nombre: nombreTrim, enunciado: "" }));
    setGuardando(false);
    setNombre("");
    setMostrarForm(false);
  };

  const handleDesplegarPagina = async () => {
    if (!capitulo_id) return;
    setDesplegando(true);
    setMsgDeploy(null);
    try {
      const resp = await fetchConToken(
        `api/admin/publicar-pagina/ayudantias/${capitulo_id}`, {}, "POST"
      );
      const body = await resp.json();
      const errores = (body.data ?? []).filter((r: { ok: boolean }) => !r.ok);
      if (errores.length > 0)
        setMsgDeploy(`⚠ Error al publicar en ${errores.length} curso(s) Canvas`);
      else
        setMsgDeploy("✓ Página publicada correctamente en Canvas");
    } catch {
      setMsgDeploy("⚠ Error de conexión");
    }
    setDesplegando(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ayudantias.findIndex((a) => a._id === active.id);
    const newIndex = ayudantias.findIndex((a) => a._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const direction = newIndex < oldIndex ? "up" : "down";
    const steps     = Math.abs(newIndex - oldIndex);
    for (let i = 0; i < steps; i++) {
      await dispatch(cambiarPositionAyudantia({ ayudantia_id: String(active.id), direction }));
    }
  };

  const handleTabNav = (key: string) => {
    if (key === "ayudantias") return;
    if (key === "clases")     navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/clases`);
    if (key === "ejercicios") navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/ejercicios`);
  };

  const ayudantiaIds = ayudantias.map((a) => a._id);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Header ── */}
      <div
        className="mx-4 mt-4 rounded-xl px-6 py-4"
        style={{ background: "#1E293B" }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">

            {/* Línea 1: breadcrumb */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={() => navigate("/inicio")}
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >
                <ArrowBackIcon sx={{ fontSize: 11 }} /> Mis cursos
              </button>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>/</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {cursoActivo?.codigo}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>/</span>
              <button
                onClick={() => navigate(`/cursos/${curso_id}/capitulos`)}
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >
                Capítulos
              </button>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>/</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                Cap. {capituloActivo?.position}
              </span>
            </div>

            {/* Línea 2: título */}
            <Typography
              sx={{
                color: "white", fontFamily: "Georgia, serif",
                fontSize: "19px", fontWeight: 600,
                lineHeight: 1.2, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", mb: "12px",
              }}
            >
              {capituloActivo?.nombre ?? "Cargando..."}
            </Typography>

            {/* Tabs */}
            <div className="flex gap-1.5">
              {TABS.map((tab) => {
                const activo = tab.key === "ayudantias";
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabNav(tab.key)}
                    style={{
                      padding: "5px 14px", borderRadius: 20, border: "none",
                      fontSize: 12, fontWeight: activo ? 500 : 400, cursor: "pointer",
                      background: activo ? "white" : "rgba(255,255,255,0.08)",
                      color: activo ? "#1E293B" : "rgba(255,255,255,0.5)",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!activo) {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!activo) {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publicar en Canvas */}
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || ayudantias.length === 0}
            startIcon={
              desplegando
                ? <CircularProgress size={13} color="inherit" />
                : <UploadIcon sx={{ fontSize: 15 }} />
            }
            sx={{
              borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)",
              borderRadius: "8px", px: 2, py: 0.85, fontSize: "12px", fontWeight: 500,
              textTransform: "none", flexShrink: 0, whiteSpace: "nowrap",
              bgcolor: "rgba(255,255,255,0.05)", mt: 0.5,
              "&:hover": { borderColor: "rgba(255,255,255,0.35)", bgcolor: "rgba(255,255,255,0.1)" },
              "&.Mui-disabled": { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" },
            }}
          >
            {desplegando ? "Publicando..." : "Publicar en Canvas"}
          </Button>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="px-4 py-5">

        {msgDeploy && (
          <Alert
            severity={msgDeploy.startsWith("✓") ? "success" : "warning"}
            onClose={() => setMsgDeploy(null)}
            sx={{ mb: 4, borderRadius: "10px" }}
          >
            {msgDeploy}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>{error}</Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <CircularProgress sx={{ color: "#2563EB" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && ayudantias.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <GroupsIcon sx={{ fontSize: 28, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">No hay ayudantías en este capítulo</p>
            <p className="text-[13px] text-[#94A3B8]">Crea la primera con el botón de abajo</p>
          </div>
        )}

        {/* Lista con DnD */}
        {!isLoading && (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={ayudantiaIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3">
                  {ayudantias.map((ay) => (
                    <SortableAyudantiaCard
                      key={ay._id}
                      ayudantia={ay}
                      curso_id={curso_id!}
                      capitulo_id={capitulo_id!}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Agregar ayudantía */}
            <div className="mt-3">
              {mostrarForm ? (
                <form onSubmit={handleCrear} className="flex gap-2 items-start">
                  <TextField
                    label="Nombre de la ayudantía"
                    placeholder="ej: Ayudantía 1 — Vectores"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required size="small" fullWidth autoFocus
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" } }}
                  />
                  <Button
                    type="submit" variant="contained"
                    disabled={guardando || !nombre.trim()}
                    startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
                    sx={{
                      bgcolor: "#2563EB", borderRadius: "8px", px: 2.5,
                      fontWeight: 500, fontSize: "13px", textTransform: "none",
                      boxShadow: "none", whiteSpace: "nowrap",
                      "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
                    }}
                  >
                    {guardando ? "Creando..." : "Crear"}
                  </Button>
                  <Button
                    onClick={() => { setMostrarForm(false); setNombre(""); }} size="small"
                    sx={{ color: "#94A3B8", textTransform: "none", borderRadius: "8px", minWidth: 0, px: 1.5 }}
                  >
                    Cancelar
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => setMostrarForm(true)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-[#E2E8F0] rounded-xl py-3 text-[13px] text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                >
                  <AddIcon sx={{ fontSize: 17 }} />
                  Agregar ayudantía
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ayudantias;