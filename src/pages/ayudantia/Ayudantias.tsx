// src/pages/ayudantia/Ayudantias.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, TextField, Typography,
  CircularProgress, Alert,
} from "@mui/material";
import AddIcon       from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon    from "@mui/icons-material/Groups";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerAyudantiasPorCapitulo,
  crearAyudantia,
  limpiarAyudantias,
} from "../../store/slices/ayudantia";
import { obtenerSolucionesPorCapitulo, limpiarSoluciones } from "../../store/slices/solucionTexto";
import { obtenerVideosPorCapitulo, limpiarVideos } from "../../store/slices/video";
import { obtenerQuizzesPorCapitulo, limpiarQuizzes } from "../../store/slices/quiz";
import { obtenerMongoCurso } from "../../store/slices/mongoCurso";
import { obtenerCapitulos }  from "../../store/slices/capitulo";
import { generarHtmlAyudantias } from "./generarHtmlAyudantias";
import { desplegarPagina }       from "../../helpers/desplegarPagina";
import AyudantiaCard             from "./AyudantiaCard";

const Ayudantias = () => {
  const { curso_id, capitulo_id } = useParams<{ curso_id: string; capitulo_id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { ayudantias, isLoading, error } = useAppSelector((s) => s.ayudantiaMongo);
  const { capitulos }   = useAppSelector((s) => s.capituloMongo);
  const { cursoActivo } = useAppSelector((s) => s.mongoCurso);
  const { soluciones }  = useAppSelector((s) => s.solucionTextoMongo);
  const { videos }      = useAppSelector((s) => s.videoMongo);
  const { quizzes }     = useAppSelector((s) => s.quizMongo);

  const capituloActivo = capitulos.find((c) => c._id === capitulo_id);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre]           = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [desplegando, setDesplegando] = useState(false);
  const [msgDeploy, setMsgDeploy]     = useState<string | null>(null);

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    // Limpiar estado previo antes de cargar
    dispatch(limpiarQuizzes());
    dispatch(limpiarVideos());
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
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
    await dispatch(crearAyudantia({
      capitulo_id,
      nombre:    nombreTrim,
      enunciado: "",
      // published: false,
    }));
    setGuardando(false);
    setNombre("");
    setMostrarForm(false);
  };

  const handleDesplegarPagina = async () => {
    if (!cursoActivo || !capituloActivo) return;
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
        generarHtmlAyudantias({
          curso:           cursoActivo,
          capitulo:        capituloActivo,
          ayudantias,
          soluciones,
          videos,
          quizzes,
          canvas_curso_id: canvas_id,
        }),
      titulo: `Capitulo ${capituloActivo.position} Ayudantias`,
      slug:   `capitulo-${capituloActivo.position}-ayudantias`,
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
        <div className="flex items-center gap-2 mb-1">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/cursos/${curso_id}/capitulos`)}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.7)", fontSize: "0.75rem",
              p: 0, minWidth: 0,
              "&:hover": { color: "white", bgcolor: "transparent" },
            }}
          >
            {cursoActivo?.codigo ?? "Volver"}
          </Button>
        </div>

        <Typography variant="h6" sx={{ color: "white", fontWeight: 500, mb: 2, lineHeight: 1.3 }}>
          {capituloActivo
            ? `${capituloActivo.position}. ${capituloActivo.nombre}`
            : "Cargando..."}
        </Typography>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { label: "Clases",     ruta: `/cursos/${curso_id}/capitulos/${capitulo_id}/clases`,     activo: false },
            { label: "Ayudantías", ruta: null,                                                       activo: true  },
            { label: "Ejercicios", ruta: `/cursos/${curso_id}/capitulos/${capitulo_id}/ejercicios`, activo: false },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => tab.ruta && navigate(tab.ruta)}
              style={{
                padding: "6px 16px", borderRadius: 20,
                background:  tab.activo ? "rgba(255,255,255,0.2)" : "transparent",
                border:      "1px solid rgba(255,255,255,0.3)",
                fontSize:    13, color: "white",
                fontWeight:  tab.activo ? 500 : 400,
                opacity:     tab.activo ? 1 : 0.7,
                cursor:      tab.ruta ? "pointer" : "default",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <GroupsIcon sx={{ color: "#8daecb", fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: "#6793ba", fontWeight: 500 }}>
            {ayudantias.length} ayudantía{ayudantias.length !== 1 ? "s" : ""}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || ayudantias.length === 0}
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
            {mostrarForm ? "Cancelar" : "Nueva ayudantía"}
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

      {/* ── Formulario nueva ayudantía ── */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="mb-6 rounded-2xl p-5 animate-slideDown"
          style={{ background: "white", border: "1px solid #d9e4ee" }}
        >
          <Typography variant="subtitle2" sx={{ color: "#2e4154", mb: 2, fontWeight: 600 }}>
            Nueva ayudantía
          </Typography>
          <div className="flex gap-3 items-start">
            <TextField
              label="Nombre *"
              placeholder="ej: Ayudantía 1 — Límites"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required size="small" fullWidth autoFocus
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
            Se creará como borrador. Puedes publicarla y agregar el enunciado desde la card.
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

      {!isLoading && ayudantias.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <GroupsIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>
            No hay ayudantías
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea la primera con el botón "Nueva ayudantía"
          </Typography>
        </div>
      )}

      {/* ── Lista ── */}
      {!isLoading && ayudantias.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {ayudantias.map((ay, idx) => (
            <AyudantiaCard
              key={ay._id}
              ayudantia={ay}
              curso_id={curso_id!}
              capitulo_id={capitulo_id!}
              esPrimero={idx === 0}
              esUltimo={idx === ayudantias.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Ayudantias;