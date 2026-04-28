// src/pages/quiz/Quiz.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import QuizIcon           from "@mui/icons-material/Quiz";
import AddIcon            from "@mui/icons-material/Add";
import EditOutlinedIcon   from "@mui/icons-material/EditOutlined";
import CheckIcon          from "@mui/icons-material/Check";
import SchoolIcon         from "@mui/icons-material/School";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerQuizPorRecurso,
  obtenerPreguntas,
  editarQuiz,
  limpiarQuizActivo,
} from "../../store/slices/quiz";
import PreguntaCard    from "./PreguntaCard";
import FormPregunta    from "./FormPregunta";
import ModalBanco      from "../../components/banco/ModalBanco";
import ModalCrearQuiz  from "../clases/ModalCrearQuiz";
import type { IQuiz }  from "../../store/slices/quiz";

interface FormState {
  titulo:        string;
  descripcion:   string;
  tiempo_limite: string | number;
  intentos:      number;
  sin_limite:    boolean;
  publicado:     boolean;
}

const formVacio: FormState = {
  titulo:        "",
  descripcion:   "",
  tiempo_limite: "",
  intentos:      1,
  sin_limite:    false,
  publicado:     false,
};

const Quiz = () => {
  // ayudantia_id estará presente solo cuando venimos de la ruta de ayudantía
  const { curso_id, capitulo_id, ayudantia_id, recurso_id } = useParams<{
    curso_id:      string;
    capitulo_id:   string;
    ayudantia_id?: string;
    recurso_id:    string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { quizActivo, preguntas, isLoading, error } = useAppSelector(
    (s) => s.quizMongo,
  );

  const [mostrarForm,       setMostrarForm]       = useState(false);
  const [mostrarBanco,      setMostrarBanco]      = useState(false);
  const [editando,          setEditando]          = useState(false);
  const [guardando,         setGuardando]         = useState(false);
  const [form,              setForm]              = useState<FormState>(formVacio);
  const [quizNoEncontrado,  setQuizNoEncontrado]  = useState(false);

  // ── Detectar contexto (clase vs ayudantía) ────────────────────────────────
  const esAyudantia = !!ayudantia_id;
  const rutaVolver  = esAyudantia
    ? `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias`
    : `/cursos/${curso_id}/capitulos/${capitulo_id}/clases`;
  const labelVolver = esAyudantia ? "Volver a ayudantías" : "Volver a clases";

  // Cargar quiz — si no existe para ese recurso, abrir modal de creación
  useEffect(() => {
    if (!recurso_id) return;
    let activo = true;
    dispatch(obtenerQuizPorRecurso({ recurso_id })).then((result) => {
      if (!activo) return;
      const res = result as unknown as { ok: boolean };
      if (!res.ok) setQuizNoEncontrado(true);
    });
    return () => {
      activo = false;
      dispatch(limpiarQuizActivo());
    };
  }, [recurso_id, dispatch]);

  // Cargar preguntas cuando llega el quiz
  useEffect(() => {
    if (!quizActivo) return;
    dispatch(obtenerPreguntas({ quiz_id: quizActivo._id }));
  }, [quizActivo, dispatch]);

  const handleAbrirEdicion = () => {
    if (!quizActivo) return;
    setForm({
      titulo:        quizActivo.titulo,
      descripcion:   quizActivo.descripcion,
      tiempo_limite: quizActivo.tiempo_limite ?? "",
      intentos:      quizActivo.intentos,
      sin_limite:    quizActivo.tiempo_limite === null,
      publicado:     quizActivo.publicado,
    });
    setEditando(true);
  };

  const handleGuardarEdicion = async () => {
    if (!quizActivo) return;
    setGuardando(true);
    await dispatch(
      editarQuiz({
        quiz_id:       quizActivo._id,
        titulo:        form.titulo,
        descripcion:   form.descripcion,
        tiempo_limite: form.sin_limite ? null : Number(form.tiempo_limite) || null,
        intentos:      form.intentos,
        publicado:     form.publicado,
      }),
    );
    setGuardando(false);
    setEditando(false);
  };

  const totalPuntos = preguntas.reduce((acc, p) => acc + p.puntos, 0);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">

      {/* ── Header ── */}
      <div
        className="rounded-2xl px-6 pt-5 pb-4 mb-6 animate-fadeIn"
        style={{ backgroundColor: "#2d5be3" }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(rutaVolver)}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.75rem",
            p: 0, minWidth: 0, mb: 1,
            "&:hover": { color: "white", bgcolor: "transparent" },
          }}
        >
          {labelVolver}
        </Button>

        {editando ? (
          <div className="flex flex-col gap-3">
            <TextField
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Tiempo (min)"
                type="number"
                value={form.sin_limite ? "" : form.tiempo_limite}
                onChange={(e) => setForm((f) => ({ ...f, tiempo_limite: e.target.value }))}
                disabled={form.sin_limite}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2, color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                }}
              />
              <TextField
                label="Intentos (0 = ilimitado)"
                type="number"
                value={form.intentos}
                onChange={(e) => setForm((f) => ({ ...f, intentos: Number(e.target.value) }))}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2, color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                }}
              />
            </div>

            <div className="flex gap-4">
              <FormControlLabel
                control={
                  <Switch
                    size="small" checked={form.sin_limite}
                    onChange={(e) => setForm((f) => ({ ...f, sin_limite: e.target.checked }))}
                    sx={{ "& .MuiSwitch-thumb": { bgcolor: "white" } }}
                  />
                }
                label={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>Sin límite de tiempo</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small" checked={form.publicado}
                    onChange={(e) => setForm((f) => ({ ...f, publicado: e.target.checked }))}
                    sx={{ "& .MuiSwitch-thumb": { bgcolor: "white" } }}
                  />
                }
                label={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>Publicado</Typography>}
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="small" variant="outlined"
                onClick={() => setEditando(false)}
                sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.4)", borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button
                size="small" variant="contained"
                onClick={handleGuardarEdicion} disabled={guardando}
                startIcon={guardando ? <CircularProgress size={12} color="inherit" /> : <CheckIcon />}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2, boxShadow: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.3)", boxShadow: "none" } }}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <QuizIcon sx={{ color: "white", fontSize: 20 }} />
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600, flex: 1 }}>
                {quizActivo ? quizActivo.titulo : "Cargando..."}
              </Typography>
              {quizActivo && (
                <Tooltip title="Editar quiz">
                  <IconButton size="small" onClick={handleAbrirEdicion} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
            {quizActivo && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Chip
                  label={quizActivo.publicado ? "Publicado" : "No publicado"}
                  size="small"
                  sx={{
                    fontSize: "0.62rem",
                    height: 18,
                    bgcolor: quizActivo.publicado
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(0,0,0,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {quizActivo.tiempo_limite ? `${quizActivo.tiempo_limite} min` : "Sin límite"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  · {quizActivo.intentos === 0 ? "Intentos ilimitados" : `${quizActivo.intentos} intento${quizActivo.intentos !== 1 ? "s" : ""}`}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  · {totalPuntos} pts totales
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className="flex justify-between items-center mb-5">
        <Typography variant="body2" sx={{ color: "#6793ba", fontWeight: 500 }}>
          {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""}
        </Typography>

        <div className="flex items-center gap-2">
          {/* Copiar del banco */}
          {quizActivo && (
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
          )}

          <Button
            variant="contained"
            startIcon={mostrarForm ? undefined : <AddIcon />}
            onClick={() => { setMostrarForm((v) => !v); setMostrarBanco(false); }}
            sx={{
              bgcolor: mostrarForm ? "#6793ba" : "#2d5be3",
              borderRadius: 2.5,
              px: 3,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                bgcolor: mostrarForm ? "#5580aa" : "#1a3cb0",
                boxShadow: "none",
              },
            }}
          >
            {mostrarForm ? "Cancelar" : "Nueva pregunta"}
          </Button>
        </div>
      </div>

      {/* ── Formulario nueva pregunta ── */}
      {mostrarForm && quizActivo && (
        <div className="mb-6">
          <FormPregunta
            quiz_id={quizActivo._id}
            onCreada={() => setMostrarForm(false)}
          />
        </div>
      )}

      {/* ── Estados ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <CircularProgress sx={{ color: "#2d5be3" }} />
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && preguntas.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <QuizIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>
            No hay preguntas
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Agrega la primera con "Nueva pregunta" o copia desde el banco
          </Typography>
        </div>
      )}

      {/* ── Lista de preguntas ── */}
      {!isLoading && preguntas.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {preguntas.map((p, idx) => (
            <PreguntaCard
              key={p._id}
              pregunta={p}
              esPrimero={idx === 0}
              esUltimo={idx === preguntas.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Modal banco ── */}
      {mostrarBanco && quizActivo && (
        <ModalBanco
          modo="pregunta"
          quiz_id={quizActivo._id}
          onCopiado={() => dispatch(obtenerPreguntas({ quiz_id: quizActivo._id }))}
          onClose={() => setMostrarBanco(false)}
        />
      )}

      {/* ── Modal crear quiz (recurso huérfano sin quiz asociado) ── */}
      {quizNoEncontrado && recurso_id && (
        <ModalCrearQuiz
          recurso_id={recurso_id}
          onClose={() => navigate(rutaVolver)}
          onCreado={(q: IQuiz) => {
            setQuizNoEncontrado(false);
            dispatch(obtenerQuizPorRecurso({ recurso_id: q.recurso_id }));
          }}
        />
      )}

    </div>
  );
};

export default Quiz;