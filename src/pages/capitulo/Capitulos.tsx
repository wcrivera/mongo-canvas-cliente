// src/pages/capitulo/Capitulos.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, TextField, Typography,
  CircularProgress, Alert,
} from "@mui/material";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import LayersIcon     from "@mui/icons-material/Layers";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import LabelIcon      from "@mui/icons-material/Label";
import UploadIcon     from "@mui/icons-material/Upload";
import AddIcon        from "@mui/icons-material/Add";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerCapitulos,
  crearCapitulo,
  limpiarCapitulos,
  cambiarPositionCapitulo,
} from "../../store/slices/capitulo";
import { obtenerClasesPorCurso, limpiarClases } from "../../store/slices/clase";
import { obtenerTemasPorCurso, limpiarTemas }   from "../../store/slices/tema";
import { obtenerMongoCurso }                    from "../../store/slices/mongoCurso";
import { fetchConToken }                        from "../../helpers/fetch";
import SortableCapituloCard                     from "./components/SortableCapituloCard";

const Capitulos = () => {
  const { curso_id } = useParams<{ curso_id: string }>();
  const navigate     = useNavigate();
  const dispatch     = useAppDispatch();

  const { capitulos, isLoading, error } = useAppSelector((s) => s.capituloMongo);
  const { cursoActivo }                 = useAppSelector((s) => s.mongoCurso);
  const { clases }                      = useAppSelector((s) => s.claseMongo);
  const { temas }                       = useAppSelector((s) => s.temaMongo);

  const [nombre, setNombre]           = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [mostrarInline, setMostrarInline] = useState(false);
  const [desplegando, setDesplegando] = useState(false);
  const [msgDeploy, setMsgDeploy]     = useState<string | null>(null);

  // ── Métricas derivadas ────────────────────────────────────────────────────
  const totalClases = clases.length;
  const totalTemas  = temas.length;

  // ── dnd-kit sensors ───────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!curso_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerClasesPorCurso({ curso_id }));
    dispatch(obtenerTemasPorCurso({ curso_id }));
    return () => {
      dispatch(limpiarCapitulos());
      dispatch(limpiarClases());
      dispatch(limpiarTemas());
    };
  }, [curso_id, dispatch]);

  // ── Crear capítulo desde inline ───────────────────────────────────────────
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim || !curso_id) return;
    setGuardando(true);
    await dispatch(crearCapitulo({ curso_id, nombre: nombreTrim }));
    setGuardando(false);
    setNombre("");
    setMostrarInline(false);
  };

  const handleCancelarInline = () => {
    setNombre("");
    setMostrarInline(false);
  };

  // ── Publicar en Canvas ────────────────────────────────────────────────────
  const handleDesplegarPagina = async () => {
    if (!curso_id) return;
    setDesplegando(true);
    setMsgDeploy(null);
    try {
      const resp = await fetchConToken(
        `api/admin/publicar-pagina/capitulos/${curso_id}`, {}, "POST"
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

  // ── Drag end ──────────────────────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = capitulos.findIndex((c) => c._id === active.id);
    const newIndex = capitulos.findIndex((c) => c._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const direction = newIndex < oldIndex ? "up" : "down";
    const steps     = Math.abs(newIndex - oldIndex);

    for (let i = 0; i < steps; i++) {
      await dispatch(
        cambiarPositionCapitulo({ capitulo_id: String(active.id), direction })
      );
    }
  };

  const capituloCIds = capitulos.map((c) => c._id);

  return (
    <div className="min-h-screen bg-[#F4F5F7] pt-4">

      {/* ── Header del curso ── */}
      <div className="bg-[#243447] mx-4 rounded-xl px-6 pt-5 pb-5">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/inicio")}
          className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-[11px] mb-4 transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 13 }} />
          Mis cursos
        </button>

        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">
              {cursoActivo?.codigo}
            </p>
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: 500,
                lineHeight: 1.2,
                fontSize: "20px",
                mb: "10px",
              }}
            >
              {cursoActivo?.nombre ?? "Cargando..."}
            </Typography>

            {/* Métricas del curso — consistencia con nivel anterior */}
            {!isLoading && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <LayersIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }} />
                  <span className="text-white/35 text-[11px]">
                    {capitulos.length} capítulo{capitulos.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <VideoLibraryIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }} />
                  <span className="text-white/35 text-[11px]">
                    {totalClases} clase{totalClases !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LabelIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }} />
                  <span className="text-white/35 text-[11px]">
                    {totalTemas} tema{totalTemas !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Única acción global del curso */}
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || capitulos.length === 0}
            startIcon={
              desplegando
                ? <CircularProgress size={13} color="inherit" />
                : <UploadIcon sx={{ fontSize: 16 }} />
            }
            sx={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.75)",
              borderRadius: "8px",
              px: 2,
              py: 0.9,
              fontSize: "12px",
              fontWeight: 500,
              textTransform: "none",
              flexShrink: 0,
              "&:hover": {
                borderColor: "rgba(255,255,255,0.4)",
                bgcolor: "rgba(255,255,255,0.06)",
              },
              "&.Mui-disabled": {
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.25)",
              },
            }}
          >
            {desplegando ? "Publicando..." : "Publicar en Canvas"}
          </Button>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="px-4 py-5">

        {/* Mensaje deploy */}
        {msgDeploy && (
          <Alert
            severity={msgDeploy.startsWith("✓") ? "success" : "warning"}
            onClose={() => setMsgDeploy(null)}
            sx={{ mb: 4, borderRadius: "10px" }}
          >
            {msgDeploy}
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <CircularProgress sx={{ color: "#2563EB" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && capitulos.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <LayersIcon sx={{ fontSize: 32, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">No hay capítulos</p>
            <p className="text-[13px] text-[#94A3B8]">
              Agrega el primero con el botón al final de la lista
            </p>
            {/* Primer capítulo inline cuando está vacío */}
            <div className="mt-4 w-full max-w-lg">
              {mostrarInline ? (
                <form onSubmit={handleCrear} className="flex gap-2 items-start">
                  <TextField
                    label="Nombre del capítulo"
                    placeholder="ej: Límites y continuidad"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required size="small" fullWidth autoFocus
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" } }}
                  />
                  <Button type="submit" variant="contained" disabled={guardando || !nombre.trim()}
                    startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
                    sx={{ bgcolor: "#2563EB", borderRadius: "8px", px: 2.5, fontWeight: 500,
                      fontSize: "13px", textTransform: "none", boxShadow: "none", whiteSpace: "nowrap",
                      "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" } }}>
                    {guardando ? "Creando..." : "Crear"}
                  </Button>
                  <Button onClick={handleCancelarInline} size="small"
                    sx={{ color: "#94A3B8", textTransform: "none", borderRadius: "8px", minWidth: 0, px: 1.5 }}>
                    Cancelar
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => setMostrarInline(true)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-[#CBD5E1] rounded-xl py-3 text-[13px] text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                  Agregar primer capítulo
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Timeline con drag & drop ── */}
        {!isLoading && capitulos.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={capituloCIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="relative pl-10">
                {/* Línea vertical — centrada con los dots (28px, -left-[29px], pl-10=40px → centro=25px)
                    top/bottom = 14px (radio del dot) para que parta y termine en el centro exacto */}
                <div className="absolute left-[25px] top-[35px] bottom-[38px] w-px bg-gray-300" style={{ zIndex: 0 }} />

                <div className="flex flex-col gap-3">
                  {capitulos.map((cap) => (
                    <SortableCapituloCard
                      key={cap._id}
                      capitulo={cap}
                      curso_id={curso_id!}
                    />
                  ))}

                  {/* ── Agregar capítulo inline al final del timeline ── */}
                  <div className="relative">
                    {/* Dot punteado — 28px igual que los dots de capítulo, z-index sobre la línea */}
                    <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-white border-2 border-dashed border-[#CBD5E1] flex items-center justify-center" style={{ zIndex: 1 }}>
                      <AddIcon sx={{ fontSize: 13, color: "#CBD5E1" }} />
                    </div>

                    {mostrarInline ? (
                      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4" style={{marginLeft: "16px"}}>
                        <form onSubmit={handleCrear} className="flex gap-2 items-start">
                          <TextField
                            label="Nombre del capítulo"
                            placeholder="ej: Límites y continuidad"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required size="small" fullWidth autoFocus
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                          />
                          <Button
                            type="submit"
                            variant="contained"
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
                            onClick={handleCancelarInline}
                            size="small"
                            sx={{
                              color: "#94A3B8", textTransform: "none",
                              borderRadius: "8px", minWidth: 0, px: 1.5,
                            }}
                          >
                            Cancelar
                          </Button>
                        </form>
                        <p className="text-[11px] text-[#94A3B8] mt-2">
                          El capítulo se creará como borrador. Puedes publicarlo desde la card.
                        </p>
                      </div>
                    ) : (
                      <div style={{marginLeft: "16px"}}>
                      <button
                        onClick={() => setMostrarInline(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 border border-dashed border-[#E2E8F0] rounded-xl text-[13px] text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors group"
                      >
                        <AddIcon sx={{ fontSize: 16, color: "inherit" }} />
                        Agregar capítulo
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default Capitulos;