// src/pages/plataforma/QuizPlataforma.tsx
// Página para que estudiantes/profesores respondan un quiz de clase o ayudantía.
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography, CircularProgress, Button, Chip, Alert,
  Radio, RadioGroup, FormControlLabel, FormControl,
  TextField, Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchConToken }     from "../../helpers/fetch";
import { calcularIndicador } from "../../helpers/indicadorIntento";

interface IOpcion { _id: string; texto: string; es_correcta: boolean; }

interface IPregunta {
  _id:       string;
  enunciado: string;
  tipo:      string;
  puntos:    number;
  opciones:  IOpcion[];
}

interface IUltimo {
  _id:          string;
  numero:       number;
  porcentaje:   number;
  completado:   boolean;
  puntaje_total:  number;
  puntaje_maximo: number;
  respuestas: {
    pregunta_id:      string;
    respuesta_dada:   string;
    es_correcta:      boolean;
    puntos_obtenidos: number;
  }[];
}

interface IQuizData {
  _id:               string;
  titulo:            string;
  descripcion:       string;
  tiempo_limite:     number | null;
  intentos:          number;
  umbral_aprobacion: number;
}

const QuizPlataforma = () => {
  const { curso_id, capitulo_id, clase_id, ayudantia_id, recurso_id } = useParams<{
    curso_id:       string;
    capitulo_id:    string;
    clase_id?:      string;
    ayudantia_id?:  string;
    recurso_id:     string;  // quiz_id
  }>();

  const navigate    = useNavigate();
  const quiz_id     = recurso_id!;
  const esAyudantia = !!ayudantia_id;

  const rutaVolver = esAyudantia
    ? `/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia_id}`
    : `/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/clases/${clase_id}`;

  const [quiz,       setQuiz]       = useState<IQuizData | null>(null);
  const [preguntas,  setPreguntas]  = useState<IPregunta[]>([]);
  const [ultimo,     setUltimo]     = useState<IUltimo | null>(null);
  const [total,      setTotal]      = useState(0);
  const [cargando,   setCargando]   = useState(true);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando,   setEnviando]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [intentoActivo, setIntentoActivo] = useState<string | null>(null);

  useEffect(() => {
    if (!quiz_id) return;
    const cargar = async () => {
      setCargando(true);
      const [respQuiz, respIntento] = await Promise.all([
        fetchConToken(`api/admin/quizzes/${quiz_id}`),
        fetchConToken(`api/plataforma/intentos/${quiz_id}`),
      ]);
      const bodyQuiz    = await respQuiz.json();
      const bodyIntento = await respIntento.json();
      if (bodyQuiz.ok) setQuiz(bodyQuiz.data);
      if (bodyIntento.ok && bodyIntento.data) setUltimo(bodyIntento.data);
      const respPreguntas = await fetchConToken(`api/admin/quizzes/${quiz_id}/preguntas`);
      const bodyPreguntas = await respPreguntas.json();
      if (bodyPreguntas.ok) setPreguntas(bodyPreguntas.data);
      setTotal(bodyIntento.data?.numero ?? 0);
      setCargando(false);
    };
    cargar();
  }, [quiz_id]);

  const cargar = async () => {
    setCargando(true);
    const [respQuiz, respIntento] = await Promise.all([
      fetchConToken(`api/admin/quizzes/${quiz_id}`),
      fetchConToken(`api/plataforma/intentos/${quiz_id}`),
    ]);
    const bodyQuiz    = await respQuiz.json();
    const bodyIntento = await respIntento.json();
    if (bodyQuiz.ok) setQuiz(bodyQuiz.data);
    if (bodyIntento.ok && bodyIntento.data) setUltimo(bodyIntento.data);
    const respPreguntas = await fetchConToken(`api/admin/quizzes/${quiz_id}/preguntas`);
    const bodyPreguntas = await respPreguntas.json();
    if (bodyPreguntas.ok) setPreguntas(bodyPreguntas.data);
    setTotal(bodyIntento.data?.numero ?? 0);
    setCargando(false);
  };

  const handleIniciar = async () => {
    setError(null);
    const resp = await fetchConToken(`api/plataforma/intentos/${quiz_id}/iniciar`, {}, "POST");
    const body = await resp.json();
    if (body.ok) { setIntentoActivo(body.data._id); setRespuestas({}); setUltimo(null); }
    else { setError(body.msg ?? "No se pudo iniciar el intento"); }
  };

  const handleEnviar = async () => {
    if (!intentoActivo) return;
    setEnviando(true);
    setError(null);

    for (const [pregunta_id, respuesta_dada] of Object.entries(respuestas)) {
      await fetchConToken(
        `api/plataforma/intentos/${quiz_id}/responder`,
        { pregunta_id, respuesta_dada },
        "POST",
      );
    }

    const resp = await fetchConToken(`api/plataforma/intentos/${quiz_id}/enviar`, {}, "POST");
    const body = await resp.json();
    setEnviando(false);

    if (body.ok) { setIntentoActivo(null); await cargar(); }
    else { setError(body.msg ?? "Error al enviar"); }
  };

  if (cargando) return <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#2d5be3" }} /></div>;
  if (!quiz)    return null;

  const ind        = calcularIndicador(ultimo, quiz.intentos, quiz.umbral_aprobacion, total);
  const enProgreso = !!intentoActivo;

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-3xl mx-auto">

        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(rutaVolver)}
          sx={{ color: "#6793ba", mb: 3 }}>
          Volver
        </Button>

        {/* ── Header ── */}
        <div className="bg-[#2d5be3] rounded-2xl px-6 py-5 mb-6">
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
            {quiz.titulo}
          </Typography>
          {quiz.descripcion && (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 1.5 }}>
              {quiz.descripcion}
            </Typography>
          )}
          <div className="flex gap-2 flex-wrap">
            <Chip
              label={quiz.tiempo_limite ? `${quiz.tiempo_limite} min` : "Sin límite"}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }} />
            <Chip
              label={`${quiz.intentos === 0 ? "∞" : quiz.intentos} intento${quiz.intentos !== 1 ? "s" : ""}`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }} />
            <Chip
              label={`Aprobación: ${quiz.umbral_aprobacion}%`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }} />
            <Chip
              label={`${preguntas.length} pregunta${preguntas.length !== 1 ? "s" : ""}`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }} />
            {ind.icono && (
              <Chip label={`${ind.icono} ${ind.label}`}
                size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, fontSize: "0.7rem" }} />
            )}
          </div>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* ── Resultado último intento ── */}
        {ultimo?.completado && !enProgreso && (
          <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee] mb-6">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600 }}>
                Resultado — Intento {ultimo.numero}
              </Typography>
              <Chip label={`${ultimo.puntaje_total} / ${ultimo.puntaje_maximo} pts (${ultimo.porcentaje}%)`}
                size="small"
                sx={{ bgcolor: `${ind.color}20`, color: ind.color, fontWeight: 600 }} />
            </div>
            <Divider sx={{ mb: 2 }} />
            {preguntas.map((p) => {
              const resp = ultimo.respuestas.find((r) => r.pregunta_id === p._id);
              return (
                <div key={p._id} className="mb-4">
                  <Typography variant="body2" sx={{ color: "#374151", mb: 1, fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: p.enunciado }} />
                  {resp ? (
                    <div className="flex items-center gap-2">
                      <span>{resp.es_correcta ? "✅" : "❌"}</span>
                      <Typography variant="body2" sx={{ color: resp.es_correcta ? "#16a34a" : "#dc2626" }}>
                        Tu respuesta: <strong>{resp.respuesta_dada}</strong>
                        {!resp.es_correcta && (
                          <span style={{ color: "#6b7280" }}> · Correcta: <strong>
                            {p.opciones.find((o) => o.es_correcta)?.texto ?? "—"}
                          </strong></span>
                        )}
                      </Typography>
                    </div>
                  ) : (
                    <Typography variant="caption" sx={{ color: "#8daecb" }}>Sin respuesta</Typography>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Formulario activo ── */}
        {enProgreso && (
          <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee] mb-6">
            <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600, mb: 3 }}>
              Responde las preguntas
            </Typography>
            {preguntas.map((p, idx) => (
              <div key={p._id} className="mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <Chip label={idx + 1} size="small"
                    sx={{ bgcolor: "#e8f0fe", color: "#2d5be3", fontWeight: 700, minWidth: 28 }} />
                  <Typography variant="body1" sx={{ color: "#1f2c38", fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: p.enunciado }} />
                </div>

                {(p.tipo === "multiple_choice" || p.tipo === "true_false") && (
                  <FormControl sx={{ ml: 4 }}>
                    <RadioGroup value={respuestas[p._id] ?? ""}
                      onChange={(e) => setRespuestas((r) => ({ ...r, [p._id]: e.target.value }))}>
                      {p.opciones.map((op) => (
                        <FormControlLabel key={op._id} value={op.texto}
                          control={<Radio size="small" sx={{ color: "#2d5be3", "&.Mui-checked": { color: "#2d5be3" } }} />}
                          label={<Typography variant="body2">{op.texto}</Typography>} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                {(p.tipo === "short_answer" || p.tipo === "essay") && (
                  <TextField fullWidth multiline rows={p.tipo === "essay" ? 4 : 1}
                    value={respuestas[p._id] ?? ""}
                    onChange={(e) => setRespuestas((r) => ({ ...r, [p._id]: e.target.value }))}
                    placeholder="Escribe tu respuesta..."
                    sx={{ ml: 4, mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                )}

                {p.tipo === "numerical" && (
                  <TextField type="number" value={respuestas[p._id] ?? ""}
                    onChange={(e) => setRespuestas((r) => ({ ...r, [p._id]: e.target.value }))}
                    placeholder="Ingresa un número"
                    sx={{ ml: 4, mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                )}

                {idx < preguntas.length - 1 && <Divider sx={{ mt: 3 }} />}
              </div>
            ))}

            <Button variant="contained" fullWidth onClick={handleEnviar} disabled={enviando}
              sx={{ bgcolor: "#2d5be3", borderRadius: 2, py: 1.5, fontWeight: 600, boxShadow: "none",
                "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
              {enviando ? "Enviando..." : "Enviar respuestas"}
            </Button>
          </div>
        )}

        {/* ── Botón iniciar/reintentar ── */}
        {!enProgreso && ind.estado !== "agotado" && (
          <Button variant="contained" fullWidth onClick={handleIniciar}
            sx={{ bgcolor: "#2d5be3", borderRadius: 2, py: 1.5, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
            {ind.estado === "sin_intentos" ? "Iniciar quiz" : "Reintentar"}
          </Button>
        )}

        {ind.estado === "agotado" && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Has agotado todos tus intentos para este quiz.
          </Alert>
        )}

      </div>
    </div>
  );
};

export default QuizPlataforma;