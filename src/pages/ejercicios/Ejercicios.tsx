// src/pages/ejercicios/Ejercicios.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Switch,
  Chip,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerEjercicios,
  obtenerPreguntas,
  editarQuiz,
} from "../../store/slices/quiz";
import type { IQuiz } from "../../store/slices/quiz";
import { obtenerMongoCurso } from "../../store/slices/mongoCurso";
import { obtenerCapitulos } from "../../store/slices/capitulo";
import ModalCrearQuiz from "../clases/components/ModalCrearQuiz";
import FormPregunta from "../quiz/FormPregunta";
import ModalBanco from "../../components/banco/ModalBanco";
import PreguntaCardFIB from "../quiz/PreguntaCardFIB";
import PreguntaViewer from "../../components/quiz/PreguntaViewer";
import type { TipoPreguntaViewer } from "../../components/quiz/PreguntaViewer";
import Header from "./components/Header";

const Ejercicios = () => {
  const { curso_id, capitulo_id } = useParams<{
    curso_id: string;
    capitulo_id: string;
  }>();
  const dispatch = useAppDispatch();

  const { quizzes, preguntas, isLoading, error } = useAppSelector(
    (s) => s.quizMongo,
  );
  const { capitulos } = useAppSelector((s) => s.capituloMongo);

  const ejercicios = quizzes.filter(
    (q) => q.contexto === "ejercicio" && q.capitulo_id === capitulo_id,
  );

  const capituloActivo = capitulos.find((c) => c._id === capitulo_id);

  const [modalQuiz, setModalQuiz] = useState(false);
  const [quizEditar, setQuizEditar] = useState<IQuiz | undefined>(undefined);
  const [quizFormPregunta, setQuizFormPregunta] = useState<string | null>(null);
  const [quizModalBanco, setQuizModalBanco] = useState<string | null>(null);
  const [togglingCanvas, setTogglingCanvas] = useState<string | null>(null);
  const [togglingApi, setTogglingApi] = useState<string | null>(null);
  const [msgDeploy, setMsgDeploy] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerEjercicios({ capitulo_id }));
  }, [curso_id, capitulo_id, dispatch]);

  // Cargar preguntas de TODOS los ejercicios cuando llegan
  const ejIds = ejercicios.map((e) => e._id).join(",");
  useEffect(() => {
    if (!ejIds) return;
    ejIds.split(",").forEach((quiz_id) => {
      dispatch(obtenerPreguntas({ quiz_id }));
    });
  }, [ejIds, dispatch]);

  const handleCreado = (quiz: IQuiz) => {
    setModalQuiz(false);
    setQuizEditar(undefined);
    setQuizFormPregunta(quiz._id);
  };

  const handleToggleCanvas = async (ej: IQuiz) => {
    setTogglingCanvas(ej._id);
    await dispatch(
      editarQuiz({ quiz_id: ej._id, published_canvas: !ej.published_canvas }),
    );
    setTogglingCanvas(null);
  };

  const handleToggleApi = async (ej: IQuiz) => {
    setTogglingApi(ej._id);
    await dispatch(
      editarQuiz({ quiz_id: ej._id, published_api: !ej.published_api }),
    );
    setTogglingApi(null);
  };

  const preguntasEjercicio = (quiz_id: string) =>
    preguntas
      .filter((p) => p.quiz_id === quiz_id)
      .sort((a, b) => a.position - b.position);

  return (
    <div className="px-8 py-6 min-h-screen bg-[#F4F5F7]">
      <Header
        curso_id={curso_id!}
        capitulo={capituloActivo!}
        setMsgDeploy={setMsgDeploy}
      />
{/* 
      {mostrarForm && (
        <ModalCrearEjercicio
          capitulo_id={capitulo_id!}
          onClose={() => setMostrarForm(false)}
        />
      )} */}

            <div className="flex justify-end my-4">
        <Button
          sx={{ borderRadius: "10px", textTransform: "none" }}
          onClick={() => setModalQuiz(true)}
          size="medium"
          variant="outlined"
          startIcon={<AddIcon />}
        >
          Agregar ejercicio
        </Button>
      </div>

      {msgDeploy && (
        <Alert
          severity={msgDeploy.startsWith("✓") ? "success" : "warning"}
          onClose={() => setMsgDeploy(null)}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {msgDeploy}
        </Alert>
      )}

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
          <Typography
            variant="body1"
            sx={{ color: "#6793ba", fontWeight: 500 }}
          >
            No hay ejercicios
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea el primero con "+ Agregar ejercicio"
          </Typography>
        </div>
      )}

      {/* ── Lista de ejercicios ── */}
      {!isLoading && ejercicios.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {ejercicios.map((ej, idx) => {
            const pqs = preguntasEjercicio(ej._id);

            return (
              <Card
                key={ej._id}
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #d9e4ee" }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* ── Header del ejercicio ── */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#4A6D8C",
                        color: "white",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#1f2c38", fontWeight: 600 }}
                        noWrap
                      >
                        Ejercicio
                      </Typography>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Typography variant="caption" sx={{ color: "#8daecb" }}>
                          {ej.intentos} intento{ej.intentos !== 1 ? "s" : ""} ·{" "}
                          {ej.umbral_aprobacion}%
                        </Typography>
                        {ej.canvas_deployments.some(
                          (d) => d.status === "synced",
                        ) && (
                          <Chip
                            label="Canvas ✓"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: "0.6rem",
                              bgcolor: "#d1fae5",
                              color: "#065f46",
                            }}
                          />
                        )}
                        {pqs.length > 0 && (
                          <Chip
                            label={`${pqs.length} pregunta${pqs.length !== 1 ? "s" : ""}`}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: "0.6rem",
                              bgcolor: "#e8f0fe",
                              color: "#1a3cb0",
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Toggle Canvas */}
                      <Tooltip
                        title={`Canvas: ${ej.published_canvas ? "publicado" : "oculto"}`}
                      >
                        <span className="flex items-center gap-0.5">
                          <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                          {togglingCanvas === ej._id ? (
                            <CircularProgress
                              size={16}
                              sx={{ color: "#4A6D8C", mx: 0.75 }}
                            />
                          ) : (
                            <Switch
                              size="small"
                              checked={ej.published_canvas}
                              onChange={() => handleToggleCanvas(ej)}
                              disabled={togglingApi === ej._id}
                              sx={{
                                "& .MuiSwitch-thumb": {
                                  bgcolor: ej.published_canvas
                                    ? "#4A6D8C"
                                    : "#ccc",
                                },
                                "& .MuiSwitch-track": {
                                  bgcolor: ej.published_canvas
                                    ? "#6793ba !important"
                                    : "#d9e4ee !important",
                                },
                              }}
                            />
                          )}
                        </span>
                      </Tooltip>

                      {/* Toggle API */}
                      <Tooltip
                        title={`Plataforma: ${ej.published_api ? "publicado" : "oculto"}`}
                      >
                        <span className="flex items-center gap-0.5">
                          <PublicIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                          {togglingApi === ej._id ? (
                            <CircularProgress
                              size={16}
                              sx={{ color: "#4A6D8C", mx: 0.75 }}
                            />
                          ) : (
                            <Switch
                              size="small"
                              checked={ej.published_api}
                              onChange={() => handleToggleApi(ej)}
                              disabled={togglingCanvas === ej._id}
                              sx={{
                                "& .MuiSwitch-thumb": {
                                  bgcolor: ej.published_api
                                    ? "#4A6D8C"
                                    : "#ccc",
                                },
                                "& .MuiSwitch-track": {
                                  bgcolor: ej.published_api
                                    ? "#6793ba !important"
                                    : "#d9e4ee !important",
                                },
                              }}
                            />
                          )}
                        </span>
                      </Tooltip>

                      {/* Editar config */}
                      <Tooltip title="Editar configuración">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setQuizEditar(ej);
                            setModalQuiz(true);
                          }}
                          sx={{
                            color: "#8daecb",
                            "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                  {/* ── Preguntas — siempre visibles ── */}
                  <div className="px-4 pb-4 border-t border-[#f0f0f0]">
                    {/* Preguntas existentes */}
                    {pqs.length > 0 && (
                      <div className="flex flex-col gap-4 pt-3">
                        {pqs.map((p) => {
                          const esFIBConItems =
                            p.tipo === "fill_in_multiple_blanks" &&
                            Array.isArray(p.items) &&
                            p.items.length > 0;

                          return (
                            <div key={p._id}>
                              {esFIBConItems ? (
                                <PreguntaCardFIB pregunta={p} />
                              ) : (
                                <PreguntaViewer
                                  tipo={p.tipo as TipoPreguntaViewer}
                                  enunciado={p.enunciado}
                                  opciones={p.opciones}
                                  pares={p.pares}
                                  respuesta_numerica={p.respuesta_numerica}
                                  tipo_pimu={p.tipo_pimu}
                                  respuesta_lti={p.respuesta_lti}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Sin preguntas — mostrar botones de agregar */}
                    {pqs.length === 0 && quizFormPregunta !== ej._id && (
                      <div className="flex gap-3 pt-3">
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setQuizFormPregunta(ej._id)}
                          sx={{
                            borderColor: "#4A6D8C",
                            color: "#4A6D8C",
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            "&:hover": { bgcolor: "#f0f4f8" },
                          }}
                        >
                          Nueva pregunta
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setQuizModalBanco(ej._id)}
                          sx={{
                            borderColor: "#6b46c1",
                            color: "#6b46c1",
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            "&:hover": { bgcolor: "#f5f0ff" },
                          }}
                        >
                          Del banco
                        </Button>
                      </div>
                    )}

                    {/* FormPregunta inline */}
                    {quizFormPregunta === ej._id && (
                      <div className="mt-3">
                        <FormPregunta
                          quiz_id={ej._id}
                          onCreada={() => {
                            dispatch(obtenerPreguntas({ quiz_id: ej._id }));
                            setQuizFormPregunta(null);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* ModalBanco */}
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

      {/* Modal crear/editar quiz */}
      {modalQuiz && capitulo_id && curso_id && (
        <ModalCrearQuiz
          contexto="ejercicio"
          capitulo_id={capitulo_id}
          curso_id={curso_id}
          quiz={quizEditar}
          onClose={() => {
            setModalQuiz(false);
            setQuizEditar(undefined);
          }}
          onCreado={handleCreado}
        />
      )}
    </div>
  );
};

export default Ejercicios;
