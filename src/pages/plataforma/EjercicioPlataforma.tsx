// src/pages/plataforma/EjercicioPlataforma.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography, CircularProgress, Button, Chip, Alert,
  Radio, RadioGroup, FormControlLabel, FormControl, TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchConToken }     from "../../helpers/fetch";
import { calcularIndicador } from "../../helpers/indicadorIntento";

interface IPreguntaEj {
  _id:      string;
  enunciado: string;
  tipo:     string;
  puntos:   number;
  opciones: { _id: string; texto: string; es_correcta: boolean }[];
}

interface IEjercicioData {
  ejercicio:     { _id: string; titulo: string; descripcion: string; intentos: number; umbral_aprobacion: number };
  preguntas:     IPreguntaEj[];
  ultimo_intento: { _id: string; numero: number; porcentaje: number; completado: boolean; respuestas: { pregunta_id: string; respuesta_dada: string; es_correcta: boolean; puntos_obtenidos: number }[] } | null;
  total_intentos: number;
}

const EjercicioPlataforma = () => {
  const { curso_id, capitulo_id, ejercicio_id } = useParams<{
    curso_id: string; capitulo_id: string; ejercicio_id: string;
  }>();
  const navigate = useNavigate();

  const [data,       setData]       = useState<IEjercicioData | null>(null);
  const [cargando,   setCargando]   = useState(true);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando,   setEnviando]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [intentoId,  setIntentoId]  = useState<string | null>(null);

  useEffect(() => {
    if (!ejercicio_id) return;
    const cargar = async () => {
      const resp = await fetchConToken(`api/plataforma/ejercicios/${ejercicio_id}`);
      const body = await resp.json();
      if (body.ok) setData(body.data);
      setCargando(false);
    };
    cargar();
  }, [ejercicio_id]);

  const cargar = async () => {
    if (!ejercicio_id) return;
    setCargando(true);
    const resp = await fetchConToken(`api/plataforma/ejercicios/${ejercicio_id}`);
    const body = await resp.json();
    if (body.ok) setData(body.data);
    setCargando(false);
  };

  const handleIniciar = async () => {
    if (!ejercicio_id) return;
    const resp = await fetchConToken(`api/plataforma/intentos/${ejercicio_id}/iniciar?ejercicio=true`, {}, "POST");
    const body = await resp.json();
    if (body.ok) { setIntentoId(body.data._id); setRespuestas({}); setError(null); }
    else { setError(body.msg ?? "No se pudo iniciar el intento"); }
  };

  const handleEnviar = async () => {
    if (!ejercicio_id || !intentoId) return;
    setEnviando(true);
    setError(null);

    // Guardar cada respuesta
    for (const [pregunta_id, respuesta_dada] of Object.entries(respuestas)) {
      await fetchConToken(
        `api/plataforma/intentos/${ejercicio_id}/responder?ejercicio=true`,
        { pregunta_id, respuesta_dada },
        "POST",
      );
    }

    // Enviar
    const resp = await fetchConToken(`api/plataforma/intentos/${ejercicio_id}/enviar?ejercicio=true`, {}, "POST");
    const body = await resp.json();
    setEnviando(false);

    if (body.ok) {
      setIntentoId(null);
      await cargar();
    } else {
      setError(body.msg ?? "Error al enviar");
    }
  };

  if (cargando) return <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>;
  if (!data)    return null;

  const { ejercicio, preguntas, ultimo_intento, total_intentos } = data;
  const ind = calcularIndicador(ultimo_intento, ejercicio.intentos, ejercicio.umbral_aprobacion, total_intentos);
  const enProgreso = !!intentoId;
  const yaCompleto = ultimo_intento?.completado;

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-3xl mx-auto">
        <Button startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}`)}
          sx={{ color: "#6793ba", mb: 3 }}>
          Volver al capítulo
        </Button>

        {/* ── Header ── */}
        <div className="bg-[#2d5be3] rounded-2xl px-6 py-5 mb-6">
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
            {ejercicio.titulo}
          </Typography>
          {ejercicio.descripcion && (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 1.5 }}>
              {ejercicio.descripcion}
            </Typography>
          )}
          <div className="flex gap-2 flex-wrap">
            <Chip label={`${ejercicio.intentos === 0 ? "∞" : ejercicio.intentos} intento${ejercicio.intentos !== 1 ? "s" : ""}`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }} />
            <Chip label={`Aprobación: ${ejercicio.umbral_aprobacion}%`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }} />
            {ind.icono && (
              <Chip label={`${ind.icono} ${ind.label}`}
                size="small" sx={{ bgcolor: `${ind.color}30`, color: "white", fontWeight: 600, fontSize: "0.7rem" }} />
            )}
          </div>
        </div>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {/* ── Resultado del último intento ── */}
        {yaCompleto && !enProgreso && (
          <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee] mb-6">
            <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600, mb: 2 }}>
              Último resultado — Intento {ultimo_intento?.numero}
            </Typography>
            {preguntas.map((p) => {
              const resp = ultimo_intento?.respuestas.find((r) => r.pregunta_id === p._id);
              return (
                <div key={p._id} className="mb-4">
                  <Typography variant="body2" sx={{ color: "#374151", mb: 1 }}
                    dangerouslySetInnerHTML={{ __html: p.enunciado }} />
                  {resp && (
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16 }}>{resp.es_correcta ? "✅" : "❌"}</span>
                      <Typography variant="body2" sx={{ color: resp.es_correcta ? "#16a34a" : "#dc2626" }}>
                        Tu respuesta: <strong>{resp.respuesta_dada}</strong>
                      </Typography>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Formulario activo ── */}
        {enProgreso && (
          <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee] mb-6">
            {preguntas.map((p) => (
              <div key={p._id} className="mb-6">
                <Typography variant="body1" sx={{ color: "#1f2c38", fontWeight: 500, mb: 2 }}
                  dangerouslySetInnerHTML={{ __html: p.enunciado }} />

                {(p.tipo === "multiple_choice" || p.tipo === "true_false") && (
                  <FormControl>
                    <RadioGroup value={respuestas[p._id] ?? ""}
                      onChange={(e) => setRespuestas((r) => ({ ...r, [p._id]: e.target.value }))}>
                      {p.opciones.map((op) => (
                        <FormControlLabel key={op._id} value={op.texto} control={<Radio size="small" />}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                )}

                {p.tipo === "numerical" && (
                  <TextField type="number" value={respuestas[p._id] ?? ""}
                    onChange={(e) => setRespuestas((r) => ({ ...r, [p._id]: e.target.value }))}
                    placeholder="Ingresa un número"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                )}
              </div>
            ))}

            <Button variant="contained" fullWidth onClick={handleEnviar} disabled={enviando}
              sx={{ bgcolor: "#2d5be3", borderRadius: 2, py: 1.5, fontWeight: 600, boxShadow: "none",
                "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
              {enviando ? "Enviando..." : "Enviar respuesta"}
            </Button>
          </div>
        )}

        {/* ── Botón iniciar/reintentar ── */}
        {!enProgreso && ind.estado !== "agotado" && (
          <Button variant="contained" fullWidth onClick={handleIniciar}
            sx={{ bgcolor: "#2d5be3", borderRadius: 2, py: 1.5, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
            {ind.estado === "sin_intentos" ? "Iniciar ejercicio" : "Reintentar"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EjercicioPlataforma;