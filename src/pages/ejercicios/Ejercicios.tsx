// src/pages/ejercicios/Ejercicios.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, Typography, CircularProgress, Alert,
  Card, CardContent, IconButton, Tooltip, Switch, Chip,
} from "@mui/material";
import ArrowBackIcon        from "@mui/icons-material/ArrowBack";
import EditNoteIcon         from "@mui/icons-material/EditNote";
import AddIcon              from "@mui/icons-material/Add";
import EditOutlinedIcon     from "@mui/icons-material/EditOutlined";
import SchoolIcon           from "@mui/icons-material/School";
import PublicIcon           from "@mui/icons-material/Public";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerEjercicios,
  obtenerPreguntas,
  editarQuiz,
} from "../../store/slices/quiz";
import type { IQuiz } from "../../store/slices/quiz";
import { obtenerMongoCurso } from "../../store/slices/mongoCurso";
import { obtenerCapitulos }  from "../../store/slices/capitulo";
import { generarHtmlEjercicios } from "./generarHtmlEjercicios";
import { desplegarPagina }       from "../../helpers/desplegarPagina";
import ModalCrearQuiz            from "../clases/ModalCrearQuiz";
import FormPregunta              from "../quiz/FormPregunta";
import ModalBanco                from "../../components/banco/ModalBanco";
import PreguntaCard              from "../quiz/PreguntaCard";

const Ejercicios = () => {
  const { curso_id, capitulo_id } = useParams<{ curso_id: string; capitulo_id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const { quizzes, preguntas, isLoading, error } = useAppSelector((s) => s.quizMongo);
  const { capitulos }   = useAppSelector((s) => s.capituloMongo);
  const { cursoActivo } = useAppSelector((s) => s.mongoCurso);

  const ejercicios = quizzes.filter(
    (q) => q.contexto === "ejercicio" && q.capitulo_id === capitulo_id,
  );

  const capituloActivo = capitulos.find((c) => c._id === capitulo_id);

  const [modalQuiz,       setModalQuiz]       = useState(false);
  const [quizEditar,      setQuizEditar]       = useState<IQuiz | undefined>(undefined);
  const [quizExpandido,   setQuizExpandido]    = useState<string | null>(null); // card expandido mostrando opciones
  const [quizFormPregunta,setQuizFormPregunta] = useState<string | null>(null); // FormPregunta inline
  const [quizModalBanco,  setQuizModalBanco]   = useState<string | null>(null); // ModalBanco
  const [togglingCanvas,  setTogglingCanvas]   = useState<string | null>(null);
  const [togglingApi,     setTogglingApi]      = useState<string | null>(null);
  const [desplegando,     setDesplegando]      = useState(false);
  const [msgDeploy,       setMsgDeploy]        = useState<string | null>(null);

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerEjercicios({ capitulo_id }));
  }, [curso_id, capitulo_id, dispatch]);

  // Cuando se selecciona un ejercicio, cargar sus preguntas
  useEffect(() => {
    if (quizExpandido) {
      dispatch(obtenerPreguntas({ quiz_id: quizExpandido }));
    }
  }, [quizExpandido, dispatch]);

  const handleCreado = (quiz: IQuiz) => {
    setModalQuiz(false);
    setQuizEditar(undefined);
    // Solo expandir el card — el usuario elige crear o banco
    setQuizExpandido(quiz._id);
  };

  const handleToggleCanvas = async (ej: IQuiz) => {
    setTogglingCanvas(ej._id);
    await dispatch(editarQuiz({ quiz_id: ej._id, published_canvas: !ej.published_canvas }));
    setTogglingCanvas(null);
  };

  const handleToggleApi = async (ej: IQuiz) => {
    setTogglingApi(ej._id);
    await dispatch(editarQuiz({ quiz_id: ej._id, published_api: !ej.published_api }));
    setTogglingApi(null);
  };

  const handleDesplegarPagina = async () => {
    if (!cursoActivo || !capituloActivo) return;
    const canvasActivos = cursoActivo.canvas_cursos.filter((c) => c.activo);
    if (canvasActivos.length === 0) { setMsgDeploy("No hay cursos Canvas activos."); return; }
    setDesplegando(true);
    setMsgDeploy(null);
    await desplegarPagina({
      canvasActivos,
      generarBody: (canvas_id) => generarHtmlEjercicios({
        curso: cursoActivo, capitulo: capituloActivo,
        ejercicios, canvas_curso_id: canvas_id,
      }),
      titulo: `Capitulo ${capituloActivo.position} Ejercicios`,
      slug:   `capitulo-${capituloActivo.position}-ejercicios`,
    });
    setDesplegando(false);
    setMsgDeploy("✓ Página publicada en Canvas");
  };

  // Preguntas del ejercicio actualmente expandido
  const preguntasEjercicio = (quiz_id: string) =>
    preguntas.filter((p) => p.quiz_id === quiz_id);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">

      {/* ── Header ── */}
      <div className="rounded-2xl px-6 pt-5 pb-4 mb-6 animate-fadeIn"
        style={{ backgroundColor: "#4A6D8C" }}>
        <Button startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/cursos/${curso_id}/capitulos`)}
          size="small"
          sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", p: 0, minWidth: 0, mb: 1,
            "&:hover": { color: "white", bgcolor: "transparent" } }}>
          {cursoActivo?.codigo ?? "Volver"}
        </Button>
        <Typography variant="h6" sx={{ color: "white", fontWeight: 500, mb: 2, lineHeight: 1.3 }}>
          {capituloActivo ? `${capituloActivo.position}. ${capituloActivo.nombre}` : "Cargando..."}
        </Typography>
        <div className="flex gap-2">
          {[
            { label: "Clases",     ruta: `/cursos/${curso_id}/capitulos/${capitulo_id}/clases` },
            { label: "Ayudantías", ruta: `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias` },
            { label: "Ejercicios", ruta: null },
          ].map((tab) => (
            <button key={tab.label} onClick={() => tab.ruta && navigate(tab.ruta)}
              style={{
                padding: "6px 16px", borderRadius: 20,
                background: !tab.ruta ? "rgba(255,255,255,0.2)" : "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                fontSize: 13, color: "white",
                fontWeight: !tab.ruta ? 500 : 400,
                opacity: !tab.ruta ? 1 : 0.7,
                cursor: tab.ruta ? "pointer" : "default",
              }}>
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
          <Button variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || ejercicios.length === 0}
            startIcon={desplegando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ borderColor: "#4A6D8C", color: "#4A6D8C", borderRadius: 2.5, px: 3,
              fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#f0f4f8" } }}>
            {desplegando ? "Publicando..." : "Publicar en Canvas"}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setQuizEditar(undefined); setModalQuiz(true); }}
            sx={{ bgcolor: "#4A6D8C", borderRadius: 2.5, px: 3, fontWeight: 600,
              boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
            Nuevo ejercicio
          </Button>
        </div>
      </div>

      {msgDeploy && (
        <Alert severity={msgDeploy.startsWith("✓") ? "success" : "warning"}
          onClose={() => setMsgDeploy(null)} sx={{ mb: 4, borderRadius: 2 }}>
          {msgDeploy}
        </Alert>
      )}

      {isLoading && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      {!isLoading && ejercicios.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <EditNoteIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>No hay ejercicios</Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>Crea el primero con "Nuevo ejercicio"</Typography>
        </div>
      )}

      {/* ── Lista de ejercicios ── */}
      {!isLoading && ejercicios.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {ejercicios.map((ej, idx) => {
            const pqs = preguntasEjercicio(ej._id);
            const expandido = quizExpandido === ej._id;

            return (
              <Card key={ej._id} elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #d9e4ee" }}>
                <CardContent sx={{ p: 0 }}>

                  {/* ── Header del ejercicio ── */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex items-center justify-center shrink-0"
                      style={{ width: 38, height: 38, borderRadius: "50%",
                        background: "#4A6D8C", color: "white", fontSize: 14, fontWeight: 600 }}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Typography variant="subtitle2" sx={{ color: "#1f2c38", fontWeight: 600 }} noWrap>
                        {ej.titulo}
                      </Typography>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Typography variant="caption" sx={{ color: "#8daecb" }}>
                          {ej.intentos} intento{ej.intentos !== 1 ? "s" : ""} · {ej.umbral_aprobacion}%
                        </Typography>
                        {ej.canvas_deployments.some((d) => d.status === "synced") && (
                          <Chip label="Canvas ✓" size="small"
                            sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#d1fae5", color: "#065f46" }} />
                        )}
                        {pqs.length > 0 && (
                          <Chip label={`${pqs.length} pregunta${pqs.length !== 1 ? "s" : ""}`} size="small"
                            sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#e8f0fe", color: "#1a3cb0" }} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Toggle Canvas */}
                      <Tooltip title={`Canvas: ${ej.published_canvas ? "publicado" : "oculto"}`}>
                        <span className="flex items-center gap-0.5">
                          <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                          {togglingCanvas === ej._id
                            ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                            : <Switch size="small" checked={ej.published_canvas}
                                onChange={() => handleToggleCanvas(ej)}
                                disabled={togglingApi === ej._id}
                                sx={{ "& .MuiSwitch-thumb": { bgcolor: ej.published_canvas ? "#4A6D8C" : "#ccc" },
                                  "& .MuiSwitch-track": { bgcolor: ej.published_canvas ? "#6793ba !important" : "#d9e4ee !important" } }} />
                          }
                        </span>
                      </Tooltip>

                      {/* Toggle API */}
                      <Tooltip title={`Plataforma: ${ej.published_api ? "publicado" : "oculto"}`}>
                        <span className="flex items-center gap-0.5">
                          <PublicIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                          {togglingApi === ej._id
                            ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                            : <Switch size="small" checked={ej.published_api}
                                onChange={() => handleToggleApi(ej)}
                                disabled={togglingCanvas === ej._id}
                                sx={{ "& .MuiSwitch-thumb": { bgcolor: ej.published_api ? "#4A6D8C" : "#ccc" },
                                  "& .MuiSwitch-track": { bgcolor: ej.published_api ? "#6793ba !important" : "#d9e4ee !important" } }} />
                          }
                        </span>
                      </Tooltip>

                      {/* Editar config */}
                      <Tooltip title="Editar configuración">
                        <IconButton size="small" onClick={() => { setQuizEditar(ej); setModalQuiz(true); }}
                          sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Agregar/ver pregunta */}
                      <Tooltip title={expandido ? "Cerrar" : pqs.length > 0 ? "Ver / editar pregunta" : "Agregar pregunta"}>
                        <Button size="small"
                          onClick={() => {
                            if (expandido) {
                              setQuizExpandido(null);
                              setQuizFormPregunta(null);
                            } else {
                              dispatch(obtenerPreguntas({ quiz_id: ej._id }));
                              setQuizExpandido(ej._id);
                            }
                          }}
                          sx={{ fontSize: "0.65rem", color: expandido ? "#8daecb" : "#2d5be3",
                            borderRadius: 2, px: 1.5, minWidth: 0,
                            "&:hover": { bgcolor: "#f0f3ff" } }}>
                          {expandido ? "Cerrar" : pqs.length > 0 ? "Pregunta" : "+ Pregunta"}
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* ── Pregunta existente / opciones agregar ── */}
                  {expandido && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#f0f0f0]">
                      {pqs.length > 0 ? (
                        // Ya tiene pregunta — mostrar con PreguntaCard
                        <div className="flex flex-col gap-3">
                          {pqs.map((p, pidx) => (
                            <PreguntaCard key={p._id} pregunta={p}
                              esPrimero={pidx === 0} esUltimo={pidx === pqs.length - 1} />
                          ))}
                        </div>
                      ) : quizFormPregunta === ej._id ? (
                        // Mostrar FormPregunta
                        <FormPregunta quiz_id={ej._id}
                          onCreada={() => {
                            dispatch(obtenerPreguntas({ quiz_id: ej._id }));
                            setQuizFormPregunta(null);
                          }} />
                      ) : (
                        // Sin pregunta — mostrar dos opciones
                        <div className="flex gap-3 py-2">
                          <Button variant="outlined" startIcon={<AddIcon />}
                            onClick={() => setQuizFormPregunta(ej._id)}
                            sx={{ borderColor: "#4A6D8C", color: "#4A6D8C", borderRadius: 2,
                              fontWeight: 600, fontSize: "0.75rem",
                              "&:hover": { bgcolor: "#f0f4f8" } }}>
                            Nueva pregunta
                          </Button>
                          <Button variant="outlined"
                            onClick={() => setQuizModalBanco(ej._id)}
                            sx={{ borderColor: "#6b46c1", color: "#6b46c1", borderRadius: 2,
                              fontWeight: 600, fontSize: "0.75rem",
                              "&:hover": { bgcolor: "#f5f0ff" } }}>
                            Del banco
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ModalBanco para este ejercicio ── */}
                  {quizModalBanco === ej._id && (
                    <ModalBanco
                      modo="pregunta"
                      quiz_id={ej._id}
                      onCopiado={() => {
                        dispatch(obtenerPreguntas({ quiz_id: ej._id }));
                        setQuizModalBanco(null);
                      }}
                      onClose={() => setQuizModalBanco(null)}
                    />
                  )}

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Modal crear/editar quiz ── */}
      {modalQuiz && capitulo_id && curso_id && (
        <ModalCrearQuiz
          contexto="ejercicio"
          capitulo_id={capitulo_id}
          curso_id={curso_id}
          quiz={quizEditar}
          onClose={() => { setModalQuiz(false); setQuizEditar(undefined); }}
          onCreado={handleCreado}
        />
      )}
    </div>
  );
};

export default Ejercicios;