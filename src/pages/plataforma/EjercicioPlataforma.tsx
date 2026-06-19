// src/pages/plataforma/EjercicioPlataforma.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate }           from "react-router-dom";
import {
  Typography, CircularProgress, Button, Chip, Alert,
  Radio, RadioGroup, FormControlLabel, FormControl,
  TextField, Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchConToken }     from "../../helpers/fetch";
import { calcularIndicador } from "../../helpers/indicadorIntento";
import { renderLatexInHtml } from "../../components/CKEditor/mathUtils";
import { chapter } from "../../db/db";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface IItemFIB {
  id:        string;
  enunciado: string;
  respuesta: string;
  tipo_pimu: string;
}

interface IPreguntaEj {
  _id:                string;
  enunciado:          string;
  enunciado_contexto: string;
  items:              IItemFIB[];
  columnas:           number;
  tipo:               string;
  puntos:             number;
  opciones:           { _id: string; texto: string; es_correcta: boolean }[];
}

interface IUltimoIntento {
  _id:            string;
  numero:         number;
  porcentaje:     number;
  completado:     boolean;
  respuestas: {
    pregunta_id:      string;
    respuesta_dada:   string | string[];
    es_correcta:      boolean;
    puntos_obtenidos: number;
  }[];
}

interface IEjercicioData {
  ejercicio:      { _id: string; titulo: string; descripcion: string; intentos: number; umbral_aprobacion: number };
  preguntas:      IPreguntaEj[];
  ultimo_intento: IUltimoIntento | null;
  total_intentos: number;
}

// ─── Helper: renderizar KaTeX ─────────────────────────────────────────────────

const Latex = ({ html, className }: { html: string; className?: string }) => (
  <span
    className={className}
    dangerouslySetInnerHTML={{ __html: renderLatexInHtml(html) }}
  />
);

// ─── Componente: Grid FIB (fill_in_multiple_blanks) ──────────────────────────

interface FIBGridProps {
  pregunta:      IPreguntaEj;
  respuestas:    Record<string, string>;   // { blanco1: "valor", ... }
  onChange:      (blank_id: string, val: string) => void;
  modoResultado: boolean;
  respuestasIntento?: IUltimoIntento["respuestas"];
  disabled:      boolean;
}

const FIBGrid = ({
  pregunta, respuestas, onChange, modoResultado, respuestasIntento, disabled,
}: FIBGridProps) => {
  const { items, columnas, enunciado_contexto } = pregunta;

  // En modo resultado, encontrar la respuesta dada para este pregunta_id
  const respuestaIntentoMap: Record<string, string> = {};
  if (modoResultado && respuestasIntento) {
    const r = respuestasIntento.find((r) => r.pregunta_id === pregunta._id);
    if (r && Array.isArray(r.respuesta_dada)) {
      // Respuestas FIB vienen como ["blanco1:valor1", "blanco2:valor2"] o como objeto
      (r.respuesta_dada as string[]).forEach((entry) => {
        const [bid, ...val] = entry.split(":");
        respuestaIntentoMap[bid] = val.join(":");
      });
    } else if (r && typeof r.respuesta_dada === "string") {
      respuestaIntentoMap["blanco1"] = r.respuesta_dada;
    }
  }

  const colClass =
    columnas === 3 ? "grid-cols-3" :
    columnas === 2 ? "grid-cols-2" :
    "grid-cols-1";

  return (
    <div>
      {/* Contexto / enunciado padre */}
      {enunciado_contexto && (
        <div className="mb-4 text-[#1e293b] leading-relaxed">
          <Latex html={enunciado_contexto} />
        </div>
      )}

      {/* Grid de ítems */}
      <div className={`grid ${colClass} gap-4`}>
        {items.map((item, idx) => {
          const valorDado   = modoResultado ? (respuestaIntentoMap[item.id] ?? "") : (respuestas[item.id] ?? "");
          const esCorrecta  = modoResultado
            ? item.respuesta.trim().toLowerCase() === valorDado.trim().toLowerCase()
            : null;

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 flex flex-col gap-3 ${
                modoResultado
                  ? esCorrecta
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                  : "border-[#d9e4ee] bg-white"
              }`}
            >
              {/* Número del ítem */}
              <div className="flex items-start gap-2">
                <span className="text-[#2d5be3] font-bold text-sm min-w-[1.2rem]">
                  {idx + 1}.
                </span>
                <div className="flex-1 text-[#1e293b] text-sm leading-relaxed">
                  {item.enunciado
                    ? <Latex html={item.enunciado} />
                    : <Latex html={enunciado_contexto} />
                  }
                </div>
              </div>

              {/* Input de respuesta */}
              {modoResultado ? (
                <div className="flex flex-col gap-1">
                  <div className={`text-sm px-3 py-2 rounded-lg border font-medium ${
                    esCorrecta
                      ? "border-green-400 bg-green-100 text-green-800"
                      : "border-red-400 bg-red-100 text-red-800"
                  }`}>
                    Tu respuesta: <Latex html={valorDado || "(sin respuesta)"} />
                  </div>
                  {!esCorrecta && (
                    <div className="text-xs text-green-700 px-2">
                      Respuesta esperada: <Latex html={item.respuesta} />
                    </div>
                  )}
                </div>
              ) : (
                <TextField
                  value={respuestas[item.id] ?? ""}
                  onChange={(e) => onChange(item.id, e.target.value)}
                  disabled={disabled}
                  placeholder="Ingrese su respuesta"
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      "& fieldset": { borderColor: "#cbd5e1" },
                      "&:hover fieldset": { borderColor: "#4A6D8C" },
                    },
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const EjercicioPlataforma = () => {
  const { curso_id, capitulo_id, ejercicio_id } = useParams<{
    curso_id:     string;
    capitulo_id:  string;
    ejercicio_id: string;
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
    let activo = true;
    const cargarInicial = async () => {
      setCargando(true);
      const resp = await fetchConToken(`api/plataforma/ejercicios/${ejercicio_id}`);
      const body = await resp.json();
      if (activo) {
        if (body.ok) setData(body.data);
        setCargando(false);
      }
    };
    cargarInicial();
    return () => { activo = false; };
  }, [ejercicio_id]);

  const handleIniciar = async () => {
    if (!ejercicio_id) return;
    const resp = await fetchConToken(`api/plataforma/intentos/${ejercicio_id}/iniciar?ejercicio=true`, {}, "POST");
    const body = await resp.json();
    if (body.ok) { setIntentoId(body.data._id); setRespuestas({}); setError(null); }
    else setError(body.msg ?? "No se pudo iniciar el intento");
  };

  const handleEnviar = async () => {
    if (!ejercicio_id || !intentoId || !data) return;
    setEnviando(true);
    setError(null);

    // Para cada pregunta, enviar las respuestas al endpoint
    for (const pregunta of data.preguntas) {
      let respuesta_dada: string | string[];

      if (pregunta.tipo === "fill_in_multiple_blanks" && pregunta.items.length > 0) {
        // FIB: enviar array de "blancoN:valor"
        respuesta_dada = pregunta.items
          .filter((item) => respuestas[item.id] !== undefined)
          .map((item) => `${item.id}:${respuestas[item.id] ?? ""}`);
      } else {
        respuesta_dada = respuestas[pregunta._id] ?? "";
      }

      await fetchConToken(
        `api/plataforma/intentos/${ejercicio_id}/responder?ejercicio=true`,
        { pregunta_id: pregunta._id, respuesta_dada },
        "POST",
      );
    }

    const resp = await fetchConToken(`api/plataforma/intentos/${ejercicio_id}/enviar?ejercicio=true`, {}, "POST");
    const body = await resp.json();
    setEnviando(false);

    if (body.ok) {
      setIntentoId(null);
      // Re-cargar datos sin useCallback — fetch directo
      setCargando(true);
      const r2 = await fetchConToken(`api/plataforma/ejercicios/${ejercicio_id}`);
      const b2 = await r2.json();
      if (b2.ok) setData(b2.data);
      setCargando(false);
    }
    else setError(body.msg ?? "Error al enviar");
  };

  const handleCambioFIB = (pregunta_id: string, blank_id: string, val: string) => {
    setRespuestas((prev) => ({ ...prev, [`${pregunta_id}_${blank_id}`]: val }));
  };

  const getFIBRespuestas = (pregunta_id: string, items: IItemFIB[]) => {
    const result: Record<string, string> = {};
    for (const item of items) {
      result[item.id] = respuestas[`${pregunta_id}_${item.id}`] ?? "";
    }
    return result;
  };

  if (cargando) return <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>;
  if (!data)    return null;

  const { ejercicio, preguntas, ultimo_intento, total_intentos } = data;
  const ind        = calcularIndicador(ultimo_intento, ejercicio.intentos, ejercicio.umbral_aprobacion, total_intentos);
  const enProgreso = !!intentoId;
  const yaCompleto = ultimo_intento?.completado;

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-4xl mx-auto">

        <Button startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}`)}
          sx={{ color: "#6793ba", mb: 3 }}>
          Volver al {chapter.name}
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
            <Chip
              label={`${ejercicio.intentos === 0 ? "∞" : ejercicio.intentos} intento${ejercicio.intentos !== 1 ? "s" : ""}`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
            />
            <Chip
              label={`${total_intentos} realizado${total_intentos !== 1 ? "s" : ""}`}
              size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }}
            />
            {ultimo_intento && (
              <Chip
                label={ind.label}
                size="small"
                sx={{ bgcolor: `${ind.color}30`, color: "white", fontWeight: 700 }}
              />
            )}
          </div>
        </div>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* ── Resultado del último intento (sin intento en progreso) ── */}
        {yaCompleto && !enProgreso && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-[#d9e4ee]">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}>
              Resultado del intento #{ultimo_intento!.numero}
            </Typography>
            {preguntas.map((preg, pi) => (
              <div key={preg._id} className="mb-6">
                {pi > 0 && <Divider sx={{ mb: 4 }} />}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#eef3fb] flex items-center justify-center text-[#2d5be3] font-bold text-sm">
                    {pi + 1}
                  </span>
                  <Chip label={preg.tipo === "fill_in_multiple_blanks" ? "Completar (LTI)" : "Opción múltiple"}
                    size="small" sx={{ bgcolor: "#eef3fb", color: "#2d5be3", fontWeight: 600, fontSize: "0.65rem" }} />
                  <Chip label={`${preg.puntos} pt${preg.puntos !== 1 ? "s" : ""}`}
                    size="small" sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontSize: "0.65rem" }} />
                </div>

                {preg.tipo === "fill_in_multiple_blanks" ? (
                  <FIBGrid
                    pregunta={preg}
                    respuestas={{}}
                    onChange={() => {}}
                    modoResultado
                    respuestasIntento={ultimo_intento!.respuestas}
                    disabled
                  />
                ) : (
                  <>
                    <div className="mb-3 text-[#1e293b]"><Latex html={preg.enunciado} /></div>
                    <div className="flex flex-col gap-2">
                      {preg.opciones.map((op) => {
                        const resp = ultimo_intento!.respuestas.find((r) => r.pregunta_id === preg._id);
                        const elegida   = resp?.respuesta_dada === op._id;
                        const correcta  = op.es_correcta;
                        return (
                          <div key={op._id} className={`px-4 py-2 rounded-xl border text-sm ${
                            elegida && correcta ? "border-green-400 bg-green-50 text-green-800" :
                            elegida && !correcta ? "border-red-400 bg-red-50 text-red-800" :
                            correcta ? "border-green-300 bg-green-50/50 text-green-700" :
                            "border-[#e2e8f0] text-[#64748b]"
                          }`}>
                            <Latex html={op.texto} />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Formulario de intento en progreso ── */}
        {enProgreso && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-[#d9e4ee]">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 4 }}>
              Responde las siguientes preguntas
            </Typography>

            {preguntas.map((preg, pi) => (
              <div key={preg._id} className="mb-8">
                {pi > 0 && <Divider sx={{ mb: 6 }} />}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#2d5be3] flex items-center justify-center text-white font-bold text-sm">
                    {pi + 1}
                  </span>
                  <Chip label={`${preg.puntos} pt${preg.puntos !== 1 ? "s" : ""}`}
                    size="small" sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontSize: "0.65rem" }} />
                </div>

                {preg.tipo === "fill_in_multiple_blanks" ? (
                  <FIBGrid
                    pregunta={preg}
                    respuestas={getFIBRespuestas(preg._id, preg.items)}
                    onChange={(blank_id, val) => handleCambioFIB(preg._id, blank_id, val)}
                    modoResultado={false}
                    disabled={false}
                  />
                ) : preg.tipo === "true_false" || preg.tipo === "multiple_choice" ? (
                  <>
                    <div className="mb-4 text-[#1e293b] leading-relaxed">
                      <Latex html={preg.enunciado} />
                    </div>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={respuestas[preg._id] ?? ""}
                        onChange={(e) => setRespuestas((prev) => ({ ...prev, [preg._id]: e.target.value }))}
                      >
                        {preg.opciones.map((op) => (
                          <FormControlLabel
                            key={op._id} value={op._id}
                            control={<Radio size="small" sx={{ color: "#4A6D8C", "&.Mui-checked": { color: "#2d5be3" } }} />}
                            label={<Latex html={op.texto} className="text-sm text-[#1e293b]" />}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <div className="mb-3 text-[#1e293b] leading-relaxed">
                      <Latex html={preg.enunciado} />
                    </div>
                    <TextField
                      value={respuestas[preg._id] ?? ""}
                      onChange={(e) => setRespuestas((prev) => ({ ...prev, [preg._id]: e.target.value }))}
                      placeholder="Tu respuesta"
                      size="small"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e2e8f0]">
              <Button onClick={() => setIntentoId(null)} variant="outlined"
                sx={{ borderColor: "#cbd5e1", color: "#64748b", borderRadius: 2 }}>
                Cancelar
              </Button>
              <Button onClick={handleEnviar} disabled={enviando} variant="contained"
                sx={{ bgcolor: "#2d5be3", borderRadius: 2, fontWeight: 600, boxShadow: "none",
                  "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
                {enviando ? "Enviando..." : "Enviar respuestas"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Botón iniciar / reintentar ── */}
        {!enProgreso && (
          <div className="flex justify-center">
            <Button
              onClick={handleIniciar}
              disabled={ind.estado === "agotado"}
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#2d5be3", borderRadius: 2, fontWeight: 600,
                boxShadow: "none", px: 5,
                "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" },
              }}
            >
              {ind.estado === "agotado"
                ? "Intentos agotados"
                : yaCompleto
                  ? "Volver a intentar"
                  : "Iniciar ejercicio"
              }
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default EjercicioPlataforma;