// src/pages/ejercicios/Ejercicios.tsx
import { useEffect, useState }    from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, Typography, CircularProgress, Alert,
} from "@mui/material";
import AddIcon       from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditNoteIcon  from "@mui/icons-material/EditNote";
import SchoolIcon    from "@mui/icons-material/School";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerEjerciciosPorCapitulo,
  limpiarEjercicios,
} from "../../store/slices/ejercicio";
import { obtenerMongoCurso }     from "../../store/slices/mongoCurso";
import { obtenerCapitulos }      from "../../store/slices/capitulo";
import { generarHtmlEjercicios } from "./generarHtmlEjercicios";
import EjercicioCard             from "./EjercicioCard";
import FormEjercicio             from "./FormEjercicio";
import ModalBanco                from "../../components/banco/ModalBanco";
import { fetchConToken } from "../../helpers/fetch";

const Ejercicios = () => {
  const { curso_id, capitulo_id } = useParams<{
    curso_id:    string;
    capitulo_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { ejercicios, isLoading, error } = useAppSelector((s) => s.ejercicioMongo);
  const { capitulos }   = useAppSelector((s) => s.capituloMongo);
  const { cursoActivo } = useAppSelector((s) => s.mongoCurso);

  const capituloActivo = capitulos.find((c) => c._id === capitulo_id);

  const [mostrarForm,  setMostrarForm]  = useState(false);
  const [mostrarBanco, setMostrarBanco] = useState(false);
  const [desplegando,  setDesplegando]  = useState(false);
  const [msgDeploy,    setMsgDeploy]    = useState<string | null>(null);

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerEjerciciosPorCapitulo({ capitulo_id }));
    return () => { dispatch(limpiarEjercicios()); };
  }, [curso_id, capitulo_id, dispatch]);

  const handleDesplegarPagina = async () => {
    if (!cursoActivo || !capituloActivo) return;
 
    const canvas_activos = cursoActivo.canvas_cursos.filter((c) => c.activo);
    if (canvas_activos.length === 0) {
      setMsgDeploy("No hay cursos Canvas activos asociados.");
      return;
    }
 
    setDesplegando(true);
    setMsgDeploy(null);
 
    await Promise.allSettled(
      canvas_activos.map(async ({ canvas_id }) => {
        const body = generarHtmlEjercicios({
          curso:           cursoActivo,
          capitulo:        capituloActivo,
          ejercicios,
          canvas_curso_id: canvas_id,
        });
 
        const titulo = `Capitulo ${capituloActivo.position} Ejercicios`;
        const slug   = `capitulo-${capituloActivo.position}-ejercicios`;
 
        await fetchConToken(
          `api/capitulos/deploy-pagina/${canvas_id}`,
          { titulo, slug, body },
          "POST",
        );
      }),
    );
 
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
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.75rem",
              p: 0, minWidth: 0,
              "&:hover": { color: "white", bgcolor: "transparent" },
            }}
          >
            {cursoActivo?.codigo ?? "Volver"}
          </Button>
        </div>

        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: 500, mb: 2, lineHeight: 1.3 }}
        >
          {capituloActivo?.nombre ?? "Cargando..."}
        </Typography>

        <div className="flex gap-2">
          {[
            {
              label: "Clases",
              ruta:  `/cursos/${curso_id}/capitulos/${capitulo_id}/clases`,
              activo: false,
            },
            {
              label: "Ayudantías",
              ruta:  `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias`,
              activo: false,
            },
            { label: "Ejercicios", ruta: null, activo: true },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => tab.ruta && navigate(tab.ruta)}
              style={{
                padding:    "6px 16px",
                borderRadius: 20,
                background: tab.activo ? "rgba(255,255,255,0.2)" : "transparent",
                border:     "1px solid rgba(255,255,255,0.3)",
                fontSize:   13,
                color:      "white",
                fontWeight: tab.activo ? 500 : 400,
                opacity:    tab.activo ? 1 : 0.7,
                cursor:     tab.ruta ? "pointer" : "default",
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
          <EditNoteIcon sx={{ color: "#8daecb", fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: "#6793ba", fontWeight: 500 }}>
            {ejercicios.length} ejercicio{ejercicios.length !== 1 ? "s" : ""}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {/* Publicar en Canvas */}
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || ejercicios.length === 0}
            startIcon={
              desplegando
                ? <CircularProgress size={14} color="inherit" />
                : undefined
            }
            sx={{
              borderColor: "#4A6D8C",
              color:       "#4A6D8C",
              borderRadius: 2.5,
              px: 3,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#f0f4f8", borderColor: "#3c5770" },
            }}
          >
            {desplegando ? "Publicando..." : "Publicar en Canvas"}
          </Button>

          {/* Copiar del banco */}
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => { setMostrarBanco(true); setMostrarForm(false); }}
            sx={{
              borderColor: "#6b46c1",
              color:       "#6b46c1",
              borderRadius: 2.5,
              px: 2.5,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#f5f0ff", borderColor: "#553c9a" },
            }}
          >
            Del banco
          </Button>

          {/* Nuevo ejercicio */}
          <Button
            variant="contained"
            startIcon={mostrarForm ? undefined : <AddIcon />}
            onClick={() => { setMostrarForm((v) => !v); setMostrarBanco(false); }}
            sx={{
              bgcolor: mostrarForm ? "#6793ba" : "#4A6D8C",
              borderRadius: 2.5,
              px: 3,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
            }}
          >
            {mostrarForm ? "Cancelar" : "Nuevo ejercicio"}
          </Button>
        </div>
      </div>

      {/* ── Mensaje deploy ── */}
      {msgDeploy && (
        <Alert
          severity={msgDeploy.startsWith("✓") ? "success" : "error"}
          onClose={() => setMsgDeploy(null)}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {msgDeploy}
        </Alert>
      )}

      {/* ── Formulario nuevo ejercicio ── */}
      {mostrarForm && capitulo_id && (
        <div className="mb-6">
          <FormEjercicio
            capitulo_id={capitulo_id}
            onCreado={() => setMostrarForm(false)}
            onCancelar={() => setMostrarForm(false)}
          />
        </div>
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

      {!isLoading && ejercicios.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <EditNoteIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>
            No hay ejercicios
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea el primero con "Nuevo ejercicio" o copia desde el banco
          </Typography>
        </div>
      )}

      {/* ── Lista ── */}
      {!isLoading && ejercicios.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {ejercicios.map((ej, idx) => (
            <EjercicioCard
              key={ej._id}
              ejercicio={ej}
              esPrimero={idx === 0}
              esUltimo={idx === ejercicios.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Modal banco ── */}
      {mostrarBanco && capitulo_id && curso_id && (
        <ModalBanco
          modo="ejercicio"
          capitulo_id={capitulo_id}
          curso_id={curso_id}
          onCopiado={() => dispatch(obtenerEjerciciosPorCapitulo({ capitulo_id }))}
          onClose={() => setMostrarBanco(false)}
        />
      )}

    </div>
  );
};

export default Ejercicios;