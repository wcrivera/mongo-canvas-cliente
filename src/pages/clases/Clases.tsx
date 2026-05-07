// src/pages/clases/Clases.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, TextField, Typography,
  CircularProgress, Alert,
} from "@mui/material";
import AddIcon       from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon    from "@mui/icons-material/School";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerClases,
  crearClase,
  limpiarClases,
} from "../../store/slices/clase";
import { obtenerTemasPorCapitulo, limpiarTemas }           from "../../store/slices/tema";
import { obtenerDiapositivasPorCapitulo, limpiarDiapositivas } from "../../store/slices/diapositiva";
import { obtenerVideosPorCapitulo, limpiarVideos } from "../../store/slices/video";
import { obtenerQuizzesPorCapitulo, limpiarQuizzes } from "../../store/slices/quiz";
import { obtenerMongoCurso } from "../../store/slices/mongoCurso";
import { obtenerCapitulos }  from "../../store/slices/capitulo";
import { generarHtmlClases } from "./generarHtmlClases";
import { desplegarPagina }   from "../../helpers/desplegarPagina";
import ClaseCard             from "./ClaseCard";

const Clases = () => {
  const { curso_id, capitulo_id } = useParams<{ curso_id: string; capitulo_id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const { clases, isLoading, error } = useAppSelector((s) => s.claseMongo);
  const { cursoActivo }              = useAppSelector((s) => s.mongoCurso);
  const { capitulos }                = useAppSelector((s) => s.capituloMongo);
  const { temas }                    = useAppSelector((s) => s.temaMongo);
  const { diapositivas }             = useAppSelector((s) => s.diapositivaMongo);
  const { videos }                   = useAppSelector((s) => s.videoMongo);
  const { quizzes }                  = useAppSelector((s) => s.quizMongo);

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
    dispatch(limpiarDiapositivas());
    dispatch(limpiarVideos());
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerClases({ capitulo_id }));
    dispatch(obtenerTemasPorCapitulo({ capitulo_id }));
    dispatch(obtenerDiapositivasPorCapitulo({ capitulo_id }));
    dispatch(obtenerVideosPorCapitulo({ capitulo_id }));
    dispatch(obtenerQuizzesPorCapitulo({ capitulo_id }));
    return () => {
      dispatch(limpiarClases());
      dispatch(limpiarTemas());
      dispatch(limpiarDiapositivas());
      dispatch(limpiarVideos());
      dispatch(limpiarQuizzes());
    };
  }, [curso_id, capitulo_id, dispatch]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim || !capitulo_id) return;
    setGuardando(true);
    await dispatch(crearClase({ capitulo_id, nombre: nombreTrim }));
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
        generarHtmlClases({
          curso:           cursoActivo,
          capitulo:        capituloActivo,
          clases,
          temas,
          diapositivas,
          videos,
          quizzes,
          canvas_curso_id: canvas_id,
        }),
      titulo: `Capitulo ${capituloActivo.position} Clases`,
      slug:   `capitulo-${capituloActivo.position}-clases`,
    });
    setDesplegando(false);
    setMsgDeploy("✓ Página de clases publicada en todos los cursos Canvas");
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
            { label: "Clases",     ruta: null,                                                       activo: true  },
            { label: "Ayudantías", ruta: `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias`, activo: false },
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
          <SchoolIcon sx={{ color: "#8daecb", fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: "#6793ba", fontWeight: 500 }}>
            {clases.length} clase{clases.length !== 1 ? "s" : ""}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || clases.length === 0}
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
            {mostrarForm ? "Cancelar" : "Nueva clase"}
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

      {/* ── Formulario nueva clase ── */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="mb-6 rounded-2xl p-5 animate-slideDown"
          style={{ background: "white", border: "1px solid #d9e4ee" }}
        >
          <Typography variant="subtitle2" sx={{ color: "#2e4154", mb: 2, fontWeight: 600 }}>
            Nueva clase
          </Typography>
          <div className="flex gap-3 items-start">
            <TextField
              label="Nombre de la clase"
              placeholder="ej: Introducción a los límites"
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
            La clase se creará como borrador. Puedes publicarla desde la card.
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

      {!isLoading && clases.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <SchoolIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>
            No hay clases
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea la primera con el botón "Nueva clase"
          </Typography>
        </div>
      )}

      {/* ── Lista ── */}
      {!isLoading && clases.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {clases.map((clase, idx) => (
            <ClaseCard
              key={clase._id}
              clase={clase}
              esPrimero={idx === 0}
              esUltimo={idx === clases.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Clases;