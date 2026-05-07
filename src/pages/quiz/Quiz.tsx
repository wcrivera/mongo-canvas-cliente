// src/pages/quiz/Quiz.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, Typography, CircularProgress, Alert, Chip,
  IconButton, Tooltip, TextField, Switch, FormControlLabel,
} from "@mui/material";
import ArrowBackIcon    from "@mui/icons-material/ArrowBack";
import QuizIcon         from "@mui/icons-material/Quiz";
import AddIcon          from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon        from "@mui/icons-material/Check";
import SchoolIcon       from "@mui/icons-material/School";
import PublicIcon       from "@mui/icons-material/Public";
import { fetchConToken } from "../../helpers/fetch";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerPreguntas,
  editarQuiz,
  limpiarQuizActivo,
  setQuizActivo,
} from "../../store/slices/quiz";
import PreguntaCard from "./PreguntaCard";
import FormPregunta from "./FormPregunta";
import ModalBanco   from "../../components/banco/ModalBanco";

// El parámetro en la ruta sigue llamándose :recurso_id por compatibilidad
// pero ahora contiene directamente el quiz_id.
// Ruta clase:     /cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id/quiz/:recurso_id
// Ruta ayudantía: /cursos/:curso_id/capitulos/:capitulo_id/ayudantias/:ayudantia_id/quiz/:recurso_id

interface FormState {
  titulo:           string;
  descripcion:      string;
  tiempo_limite:    string | number;
  intentos:         number;
  umbral_aprobacion: number;
  sin_limite:       boolean;
  published_canvas: boolean;
  published_api:    boolean;
}

const Quiz = () => {
  const { curso_id, capitulo_id, ayudantia_id, clase_id, recurso_id } = useParams<{
    curso_id:      string;
    capitulo_id:   string;
    ayudantia_id?: string;
    clase_id?:     string;
    recurso_id:    string; // es el quiz_id
  }>();

  const quiz_id  = recurso_id!;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { quizActivo, preguntas, isLoading, error } = useAppSelector((s) => s.quizMongo);
  const { quizzes } = useAppSelector((s) => s.quizMongo);

  const [mostrarForm,  setMostrarForm]  = useState(false);
  const [mostrarBanco, setMostrarBanco] = useState(false);
  const [editando,     setEditando]     = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [form,         setForm]         = useState<FormState>({
    titulo: "", descripcion: "", tiempo_limite: "", intentos: 1,
    umbral_aprobacion: 60, sin_limite: false,
    published_canvas: false, published_api: false,
  });

  const esAyudantia = !!ayudantia_id;
  const esEjercicio = !clase_id && !ayudantia_id;
  const rutaVolver  = esEjercicio
    ? `/cursos/${curso_id}/capitulos/${capitulo_id}/ejercicios`
    : esAyudantia
      ? `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias`
      : `/cursos/${curso_id}/capitulos/${capitulo_id}/clases`;
  const labelVolver = esEjercicio ? "Volver a ejercicios" : esAyudantia ? "Volver a ayudantías" : "Volver a clases";

  // Cargar quiz desde el store o por ID
  useEffect(() => {
    if (!quiz_id) return;

    // Buscar en el store primero
    const enStore = quizzes.find((q) => q._id === quiz_id);
    if (enStore) {
      dispatch(setQuizActivo(enStore));
    } else {
      // Fetch directo por id usando fetchConToken
      fetchConToken(`api/admin/quizzes/${quiz_id}`)
        .then((r: Response) => r.json())
        .then((body: { ok: boolean; data: unknown }) => { if (body.ok) dispatch(setQuizActivo(body.data)); });
    }

    return () => { dispatch(limpiarQuizActivo()); };
  }, [quiz_id, dispatch, quizzes]);

  // Cargar preguntas cuando llega el quiz
  useEffect(() => {
    if (!quizActivo) return;
    dispatch(obtenerPreguntas({ quiz_id: quizActivo._id }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizActivo?._id, dispatch]);

  const handleAbrirEdicion = () => {
    if (!quizActivo) return;
    setForm({
      titulo:           quizActivo.titulo,
      descripcion:      quizActivo.descripcion,
      tiempo_limite:    quizActivo.tiempo_limite ?? "",
      intentos:         quizActivo.intentos,
      umbral_aprobacion: quizActivo.umbral_aprobacion,
      sin_limite:       quizActivo.tiempo_limite === null,
      published_canvas: quizActivo.published_canvas,
      published_api:    quizActivo.published_api,
    });
    setEditando(true);
  };

  const handleGuardarEdicion = async () => {
    if (!quizActivo) return;
    setGuardando(true);
    await dispatch(editarQuiz({
      quiz_id:           quizActivo._id,
      titulo:            form.titulo,
      descripcion:       form.descripcion,
      tiempo_limite:     form.sin_limite ? null : Number(form.tiempo_limite) || null,
      intentos:          form.intentos,
      umbral_aprobacion: form.umbral_aprobacion,
      published_canvas:  form.published_canvas,
      published_api:     form.published_api,
    }));
    setGuardando(false);
    setEditando(false);
  };

  const totalPuntos = preguntas.reduce((acc, p) => acc + p.puntos, 0);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">

      {/* ── Header ── */}
      <div className="rounded-2xl px-6 pt-5 pb-4 mb-6 animate-fadeIn"
        style={{ backgroundColor: "#2d5be3" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(rutaVolver)}
          size="small"
          sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", p: 0, minWidth: 0, mb: 1, "&:hover": { color: "white", bgcolor: "transparent" } }}
        >
          {labelVolver}
        </Button>

        {editando ? (
          <div className="flex flex-col gap-3">
            <TextField
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              size="small" fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.4)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
            />
            <div className="grid grid-cols-3 gap-3">
              <TextField
                label="Tiempo (min)" type="number"
                value={form.sin_limite ? "" : form.tiempo_limite}
                onChange={(e) => setForm((f) => ({ ...f, tiempo_limite: e.target.value }))}
                disabled={form.sin_limite} size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.4)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
              />
              <TextField
                label="Intentos (0=ilimitado)" type="number"
                value={form.intentos}
                onChange={(e) => setForm((f) => ({ ...f, intentos: Number(e.target.value) }))}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.4)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
              />
              <TextField
                label="Umbral aprobación (%)" type="number"
                value={form.umbral_aprobacion}
                onChange={(e) => setForm((f) => ({ ...f, umbral_aprobacion: Number(e.target.value) }))}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.4)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <FormControlLabel
                control={<Switch size="small" checked={form.sin_limite}
                  onChange={(e) => setForm((f) => ({ ...f, sin_limite: e.target.checked }))}
                  sx={{ "& .MuiSwitch-thumb": { bgcolor: "white" } }} />}
                label={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>Sin límite de tiempo</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" checked={form.published_canvas}
                  onChange={(e) => setForm((f) => ({ ...f, published_canvas: e.target.checked }))}
                  sx={{ "& .MuiSwitch-thumb": { bgcolor: "white" } }} />}
                label={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}><SchoolIcon sx={{ fontSize: 11, mr: 0.5 }} />Canvas</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" checked={form.published_api}
                  onChange={(e) => setForm((f) => ({ ...f, published_api: e.target.checked }))}
                  sx={{ "& .MuiSwitch-thumb": { bgcolor: "white" } }} />}
                label={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}><PublicIcon sx={{ fontSize: 11, mr: 0.5 }} />Plataforma</Typography>}
              />
            </div>
            <div className="flex gap-2">
              <Button size="small" variant="outlined" onClick={() => setEditando(false)}
                sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.4)", borderRadius: 2 }}>
                Cancelar
              </Button>
              <Button size="small" variant="contained" onClick={handleGuardarEdicion} disabled={guardando}
                startIcon={guardando ? <CircularProgress size={12} color="inherit" /> : <CheckIcon />}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2, boxShadow: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.3)", boxShadow: "none" } }}>
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
                  <IconButton size="small" onClick={handleAbrirEdicion}
                    sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
            {quizActivo && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Chip
                  label={quizActivo.published_canvas ? "Canvas ●" : "Canvas ○"}
                  size="small"
                  sx={{ fontSize: "0.62rem", height: 18, bgcolor: quizActivo.published_canvas ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)", color: "white", fontWeight: 600 }}
                />
                <Chip
                  label={quizActivo.published_api ? "API ●" : "API ○"}
                  size="small"
                  sx={{ fontSize: "0.62rem", height: 18, bgcolor: quizActivo.published_api ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)", color: "white", fontWeight: 600 }}
                />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {quizActivo.tiempo_limite ? `${quizActivo.tiempo_limite} min` : "Sin límite"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  · {quizActivo.intentos === 0 ? "Intentos ilimitados" : `${quizActivo.intentos} intento${quizActivo.intentos !== 1 ? "s" : ""}`}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  · Aprobación: {quizActivo.umbral_aprobacion}%
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  · {totalPuntos} pts
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
          {quizActivo && (
            <Button variant="outlined" startIcon={<SchoolIcon />}
              onClick={() => { setMostrarBanco(true); setMostrarForm(false); }}
              sx={{ borderColor: "#6b46c1", color: "#6b46c1", borderRadius: 2.5, px: 2.5, fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#f5f0ff", borderColor: "#553c9a" } }}>
              Del banco
            </Button>
          )}
          <Button variant="contained"
            startIcon={mostrarForm ? undefined : <AddIcon />}
            onClick={() => { setMostrarForm((v) => !v); setMostrarBanco(false); }}
            sx={{ bgcolor: mostrarForm ? "#6793ba" : "#2d5be3", borderRadius: 2.5, px: 3, fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: mostrarForm ? "#5580aa" : "#1a3cb0", boxShadow: "none" } }}>
            {mostrarForm ? "Cancelar" : "Nueva pregunta"}
          </Button>
        </div>
      </div>

      {/* ── Formulario nueva pregunta ── */}
      {mostrarForm && quizActivo && (
        <div className="mb-6">
          <FormPregunta quiz_id={quizActivo._id} onCreada={() => setMostrarForm(false)} />
        </div>
      )}

      {/* ── Estados ── */}
      {isLoading && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#2d5be3" }} /></div>}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
      {!isLoading && preguntas.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <QuizIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography variant="body1" sx={{ color: "#6793ba", fontWeight: 500 }}>No hay preguntas</Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>Agrega la primera con "Nueva pregunta" o copia desde el banco</Typography>
        </div>
      )}

      {/* ── Lista de preguntas ── */}
      {!isLoading && preguntas.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {preguntas.map((p, idx) => (
            <PreguntaCard key={p._id} pregunta={p} esPrimero={idx === 0} esUltimo={idx === preguntas.length - 1} />
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

    </div>
  );
};

export default Quiz;