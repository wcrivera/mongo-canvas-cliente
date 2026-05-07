// src/pages/capitulo/Capitulos.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, TextField, Typography,
  CircularProgress, Alert,
} from "@mui/material";
import AddIcon       from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayersIcon    from "@mui/icons-material/Layers";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerCapitulos,
  crearCapitulo,
  limpiarCapitulos,
} from "../../store/slices/capitulo";
import { obtenerClasesPorCurso, limpiarClases } from "../../store/slices/clase";
import { obtenerTemasPorCurso, limpiarTemas }   from "../../store/slices/tema";
import { obtenerMongoCurso }                    from "../../store/slices/mongoCurso";
import { generarHtmlCapitulos }                 from "./components/generarHtmlCapitulos";
import { desplegarPagina }                      from "../../helpers/desplegarPagina";
import CapituloCard                             from "./components/CapituloCard";

const Capitulos = () => {
  const { curso_id } = useParams<{ curso_id: string }>();
  const navigate     = useNavigate();
  const dispatch     = useAppDispatch();

  const { capitulos, isLoading, error } = useAppSelector((s) => s.capituloMongo);
  const { cursoActivo }                 = useAppSelector((s) => s.mongoCurso);
  const { clases }                      = useAppSelector((s) => s.claseMongo);
  const { temas }                       = useAppSelector((s) => s.temaMongo);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre]           = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [desplegando, setDesplegando] = useState(false);
  const [msgDeploy, setMsgDeploy]     = useState<string | null>(null);

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

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim || !curso_id) return;
    setGuardando(true);
    await dispatch(crearCapitulo({ curso_id, nombre: nombreTrim }));
    setGuardando(false);
    setNombre("");
    setMostrarForm(false);
  };

  const handleDesplegarPagina = async () => {
    if (!cursoActivo || capitulos.length === 0) return;
    const canvasActivos = cursoActivo.canvas_cursos.filter((c) => c.activo);
    if (canvasActivos.length === 0) {
      setMsgDeploy("No hay cursos Canvas activos asociados.");
      return;
    }
    setDesplegando(true);
    setMsgDeploy(null);
    await desplegarPagina({
      canvasActivos,
      generarBody: (canvas_id) =>
        generarHtmlCapitulos({ curso: cursoActivo, capitulos, clases, temas, canvas_curso_id: canvas_id }),
      titulo: `${cursoActivo.codigo} Capitulos`,
      slug:   `${cursoActivo.codigo.toLowerCase()}-capitulos`,
    });
    setDesplegando(false);
    setMsgDeploy("✓ Página publicada en todos los cursos Canvas");
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">

      {/* ── Header azul ── */}
      <div
        className="rounded-2xl px-6 pt-5 pb-4 mb-6 animate-fadeIn"
        style={{ backgroundColor: "#4A6D8C" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-1">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/inicio")}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.7)", fontSize: "0.75rem",
              p: 0, minWidth: 0,
              "&:hover": { color: "white", bgcolor: "transparent" },
            }}
          >
            {cursoActivo?.codigo ?? "Mis cursos"}
          </Button>
        </div>

        {/* Título */}
        <Typography variant="h6" sx={{ color: "white", fontWeight: 500, lineHeight: 1.3 }}>
          {cursoActivo?.nombre ?? "Cargando..."}
        </Typography>
      </div>

      {/* ── Acciones ── */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <LayersIcon sx={{ color: "#8daecb", fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: "#6793ba", fontWeight: 500 }}>
            {capitulos.length} capítulo{capitulos.length !== 1 ? "s" : ""}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || capitulos.length === 0}
            startIcon={desplegando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              borderColor: "#4A6D8C", color: "#4A6D8C",
              borderRadius: 2.5, px: 3, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#f0f4f8", borderColor: "#3c5770" },
            }}
          >
            {desplegando ? "Publicando..." : "Publicar en Canvas"}
          </Button>

          <Button
            variant="contained"
            startIcon={mostrarForm ? undefined : <AddIcon />}
            onClick={() => { setMostrarForm((v) => !v); setNombre(""); }}
            sx={{
              bgcolor: mostrarForm ? "#6793ba" : "#4A6D8C",
              borderRadius: 2.5, px: 3, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
            }}
          >
            {mostrarForm ? "Cancelar" : "Nuevo capítulo"}
          </Button>
        </div>
      </div>

      {/* ── Mensaje deploy ── */}
      {msgDeploy && (
        <Alert
          severity={msgDeploy.startsWith("✓") ? "success" : "warning"}
          onClose={() => setMsgDeploy(null)}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {msgDeploy}
        </Alert>
      )}

      {/* ── Formulario nuevo capítulo ── */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="mb-6 rounded-2xl p-5 animate-slideDown"
          style={{ background: "white", border: "1px solid #d9e4ee" }}
        >
          <Typography variant="subtitle2" sx={{ color: "#2e4154", mb: 2, fontWeight: 600 }}>
            Nuevo capítulo
          </Typography>
          <div className="flex gap-3 items-start">
            <TextField
              label="Nombre del capítulo"
              placeholder="ej: Límites y continuidad"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              size="small"
              fullWidth
              autoFocus
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={guardando || !nombre.trim()}
              startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{
                bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
                boxShadow: "none", whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
              }}
            >
              {guardando ? "Creando..." : "Crear"}
            </Button>
          </div>
          <Typography variant="caption" sx={{ color: "#8daecb", mt: 1.5, display: "block" }}>
            El capítulo se creará como borrador. Puedes publicarlo desde la card.
          </Typography>
        </form>
      )}

      {/* ── Estados ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <CircularProgress sx={{ color: "#4A6D8C" }} />
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      )}

      {!isLoading && capitulos.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <LayersIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>
            No hay capítulos
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea el primero con el botón "Nuevo capítulo"
          </Typography>
        </div>
      )}

      {/* ── Lista de capítulos ── */}
      {!isLoading && capitulos.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {capitulos.map((cap, idx) => (
            <CapituloCard
              key={cap._id}
              capitulo={cap}
              curso_id={curso_id!}
              esPrimero={idx === 0}
              esUltimo={idx === capitulos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Capitulos;