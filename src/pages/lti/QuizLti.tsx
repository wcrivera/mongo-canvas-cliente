// src/pages/lti/QuizLti.tsx
// Página pública embebida en iframe de Canvas.
// Flujo: carga JWT → obtiene quiz → verifica blanco a blanco con feedback inmediato.
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { setLtiToken, fetchLti } from "@/helpers/fetchLti";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface IItemFIB {
  id:        string;
  enunciado: string;
  tipo_pimu: string;
}

interface IPregunta {
  _id:                string;
  tipo:               string;
  enunciado:          string;
  enunciado_contexto: string;
  puntos:             number;
  position:           number;
  items:              IItemFIB[];
  opciones: { _id: string; texto: string; blank_id?: string }[];
}

interface IQuiz {
  _id:           string;
  titulo:        string;
  descripcion:   string;
  tiempo_limite: number | null;
  intentos:      number;
  contexto:      string;
}

interface IEstudiante {
  canvas_user_id: string;
  nombre:         string;
  email:          string;
}

// Estado de un blanco individual
type EstadoBlanco = "pendiente" | "verificando" | "correcto" | "incorrecto";

interface IEstadoBlanco {
  valor:             string;
  estado:            EstadoBlanco;
  respuesta_correcta?: string;
}

// ── Tokens de diseño ──────────────────────────────────────────────────────────
const T = {
  teal:        "#0D9488",
  tealLight:   "#F0FDFA",
  tealBorder:  "#99F6E4",
  tealDark:    "#0F766E",
  text:        "#0F172A",
  textSec:     "#64748B",
  border:      "#E2E8F0",
  success:     "#16A34A",
  successBg:   "#F0FDF4",
  successBorder:"#BBF7D0",
  error:       "#DC2626",
  errorBg:     "#FEF2F2",
  errorBorder: "#FECACA",
  white:       "#FFFFFF",
  bg:          "#F8FAFC",
  radius:      "10px",
};

// ── Componente ────────────────────────────────────────────────────────────────

const QuizLti = () => {
  const [searchParams] = useSearchParams();

  const [quiz,       setQuiz]       = useState<IQuiz | null>(null);
  const [estudiante, setEstudiante] = useState<IEstudiante | null>(null);
  const [preguntas,  setPreguntas]  = useState<IPregunta[]>([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // Estado por blanco: clave = "pregunta_id__blank_id"
  const [blancos, setBlancos] = useState<Record<string, IEstadoBlanco>>({});

  // ── Inicializar ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = searchParams.get("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) { setError("Token LTI no proporcionado."); setCargando(false); return; }

    setLtiToken(token);

    let qid: string;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      qid = payload.quiz_id;
      if (!qid) throw new Error();
    } catch {
      setError("Token LTI inválido."); setCargando(false); return;
    }

    const cargar = async () => {
      try {
        const [respQuiz, respPrevias] = await Promise.all([
          fetchLti(`api/lti/quiz/${qid}`),
          fetchLti(`api/lti/quiz/${qid}/respuestas`),
        ]);
        const bodyQuiz    = await respQuiz.json();
        const bodyPrevias = await respPrevias.json();

        if (!bodyQuiz.ok) { setError(bodyQuiz.msg ?? "Error al cargar el quiz"); return; }

        setQuiz(bodyQuiz.quiz);
        setEstudiante(bodyQuiz.estudiante);
        setPreguntas(bodyQuiz.preguntas);

        // Inicializar estado de blancos — vacío o con respuestas previas
        const init: Record<string, IEstadoBlanco> = {};
        for (const p of bodyQuiz.preguntas as IPregunta[]) {
          for (const item of p.items) {
            const clave = `${p._id}__${item.id}`;
            init[clave] = { valor: "", estado: "pendiente" };
          }
        }
        // Cargar respuestas previas
        if (bodyPrevias.ok && Array.isArray(bodyPrevias.data)) {
          for (const r of bodyPrevias.data as { pregunta_id: string; blank_id: string; es_correcta: boolean }[]) {
            const clave = `${r.pregunta_id}__${r.blank_id}`;
            if (init[clave]) {
              init[clave].estado = r.es_correcta ? "correcto" : "incorrecto";
            }
          }
        }
        setBlancos(init);
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [searchParams]);

  // ── Verificar un blanco ────────────────────────────────────────────────────
  const verificarBlanco = useCallback(async (pregunta_id: string, blank_id: string) => {
    const clave = `${pregunta_id}__${blank_id}`;
    const blanco = blancos[clave];
    if (!blanco || !blanco.valor.trim() || blanco.estado === "verificando") return;

    setBlancos(prev => ({ ...prev, [clave]: { ...prev[clave], estado: "verificando" } }));

    try {
      const resp = await fetchLti("api/lti/verificar-blanco", "POST", {
        pregunta_id,
        blank_id,
        respuesta_dada: blanco.valor.trim(),
      });
      const body = await resp.json();
      if (body.ok) {
        setBlancos(prev => ({
          ...prev,
          [clave]: {
            ...prev[clave],
            estado: body.resultado.es_correcta ? "correcto" : "incorrecto",
            respuesta_correcta: body.resultado.es_correcta ? undefined : body.resultado.respuesta_correcta,
          },
        }));
      } else {
        setBlancos(prev => ({ ...prev, [clave]: { ...prev[clave], estado: "pendiente" } }));
      }
    } catch {
      setBlancos(prev => ({ ...prev, [clave]: { ...prev[clave], estado: "pendiente" } }));
    }
  }, [blancos]);

  const handleKeyDown = (e: React.KeyboardEvent, pregunta_id: string, blank_id: string) => {
    if (e.key === "Enter") verificarBlanco(pregunta_id, blank_id);
  };

  // ── Contadores ─────────────────────────────────────────────────────────────
  const totalBlancos   = Object.keys(blancos).length;
  const correctos      = Object.values(blancos).filter(b => b.estado === "correcto").length;
  const incorrectos    = Object.values(blancos).filter(b => b.estado === "incorrecto").length;
  const respondidos    = correctos + incorrectos;
  const porcentaje     = totalBlancos > 0 ? Math.round((correctos / totalBlancos) * 100) : 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (cargando) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress sx={{ color: T.teal }} />
    </div>
  );

  if (error || !quiz) return (
    <div style={{ maxWidth: 860, margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ background: T.errorBg, border: `1px solid ${T.errorBorder}`, borderRadius: T.radius, padding: "16px 20px", color: T.error }}>
        <strong>Error:</strong> {error ?? "No se pudo cargar el quiz."}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "20px 16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Tarjeta estudiante ── */}
        {estudiante && (
          <div style={{
            background: T.white, borderRadius: T.radius,
            border: `1px solid ${T.border}`, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: `${T.teal}18`, border: `1.5px solid ${T.tealBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: T.teal, fontWeight: 700,
            }}>
              {estudiante.nombre.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {estudiante.nombre}
              </div>
              <div style={{ fontSize: 12, color: T.textSec }}>{estudiante.email}</div>
            </div>
          </div>
        )}

        {/* ── Header quiz ── */}
        <div style={{
          background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%)`,
          borderRadius: T.radius, padding: "20px 22px", color: T.white,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{quiz.titulo}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px", fontSize: 12 }}>
              ⏱ {quiz.tiempo_limite ? `${quiz.tiempo_limite} min` : "Sin límite"}
            </span>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px", fontSize: 12 }}>
              🔄 {quiz.intentos === 0 ? "∞" : quiz.intentos} intento{quiz.intentos !== 1 ? "s" : ""}
            </span>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px", fontSize: 12 }}>
              📝 {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Barra de progreso */}
          {totalBlancos > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5, opacity: 0.9 }}>
                <span>{respondidos}/{totalBlancos} respondidos</span>
                <span>{correctos} ✓  {incorrectos} ✗</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{
                  background: T.white, height: "100%", borderRadius: 99,
                  width: `${porcentaje}%`, transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Preguntas ── */}
        {preguntas.map((p, idx) => (
          <div key={p._id} style={{
            background: T.white, borderRadius: T.radius,
            border: `1px solid ${T.border}`, overflow: "hidden",
          }}>
            {/* Header pregunta */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 18px", background: T.bg,
              borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: T.teal, color: T.white,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: T.textSec, fontStyle: "italic" }}>
                {p.tipo === "fill_in_multiple_blanks" ? "Completar espacios en blanco" : p.tipo}
              </div>
              <span style={{
                background: `${T.teal}18`, color: T.teal,
                borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
              }}>
                {p.puntos} pt{p.puntos !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cuerpo pregunta */}
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Enunciado de contexto */}
              {p.enunciado_contexto && (
                <div style={{ fontSize: 14, color: T.textSec, fontStyle: "italic", lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: p.enunciado_contexto }} />
              )}

              {/* Enunciado principal */}
              {p.enunciado && (
                <div style={{ fontSize: 15, color: T.text, fontWeight: 500, lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: p.enunciado }} />
              )}

              {/* ── Items FIB — blanco a blanco ── */}
              {p.tipo === "fill_in_multiple_blanks" && p.items.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.items.map((item) => {
                    const clave  = `${p._id}__${item.id}`;
                    const blanco = blancos[clave] ?? { valor: "", estado: "pendiente" as EstadoBlanco };
                    const esCorrecto   = blanco.estado === "correcto";
                    const esIncorrecto = blanco.estado === "incorrecto";
                    const verificando  = blanco.estado === "verificando";

                    const borderColor = esCorrecto ? T.success : esIncorrecto ? T.error : T.border;
                    const bgColor     = esCorrecto ? T.successBg : esIncorrecto ? T.errorBg : T.white;

                    return (
                      <div key={item.id} style={{
                        background: bgColor, border: `1.5px solid ${borderColor}`,
                        borderRadius: T.radius, padding: "12px 14px",
                        transition: "all 0.2s ease",
                      }}>
                        {/* Enunciado del ítem */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                            background: esCorrecto ? "#DCFCE7" : esIncorrecto ? "#FEE2E2" : `${T.teal}18`,
                            color: esCorrecto ? T.success : esIncorrecto ? T.error : T.teal,
                            borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {item.id}
                          </span>
                          {item.enunciado ? (
                            <span style={{ fontSize: 14, color: T.text, lineHeight: 1.5, flex: 1 }}
                              dangerouslySetInnerHTML={{ __html: item.enunciado }} />
                          ) : (
                            <span style={{ fontSize: 12, color: T.textSec, fontStyle: "italic", flex: 1 }}>
                              (usa el enunciado de contexto)
                            </span>
                          )}
                          <span style={{
                            fontSize: 11, color: T.textSec,
                            background: T.bg, borderRadius: 4, padding: "2px 6px",
                            border: `1px solid ${T.border}`, whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {item.tipo_pimu}
                          </span>
                        </div>

                        {/* Input + Verificar */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            value={blanco.valor}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlancos(prev => ({
                                ...prev,
                                [clave]: { ...prev[clave], valor: val, estado: "pendiente" },
                              }));
                            }}
                            onKeyDown={(e) => handleKeyDown(e, p._id, item.id)}
                            placeholder={`Respuesta para ${item.id}`}
                            disabled={esCorrecto}
                            style={{
                              flex: 1, padding: "8px 12px", fontSize: 14,
                              border: `1.5px solid ${borderColor}`,
                              borderRadius: 8, outline: "none",
                              background: esCorrecto ? T.successBg : T.white,
                              color: T.text,
                              fontFamily: "inherit",
                            }}
                          />
                          {!esCorrecto && (
                            <button
                              onClick={() => verificarBlanco(p._id, item.id)}
                              disabled={!blanco.valor.trim() || verificando}
                              style={{
                                padding: "8px 16px", fontSize: 13, fontWeight: 600,
                                background: blanco.valor.trim() && !verificando ? T.teal : T.border,
                                color: blanco.valor.trim() && !verificando ? T.white : T.textSec,
                                border: "none", borderRadius: 8, cursor: blanco.valor.trim() ? "pointer" : "not-allowed",
                                transition: "all 0.15s", whiteSpace: "nowrap",
                                fontFamily: "inherit",
                              }}
                            >
                              {verificando ? "..." : "Verificar →"}
                            </button>
                          )}
                        </div>

                        {/* Feedback */}
                        {esCorrecto && (
                          <div style={{ marginTop: 8, fontSize: 13, color: T.success, fontWeight: 600 }}>
                            ✓ Correcto
                          </div>
                        )}
                        {esIncorrecto && blanco.respuesta_correcta && (
                          <div style={{ marginTop: 8, fontSize: 13, color: T.error }}>
                            ✗ Incorrecto — respuesta: <strong>{blanco.respuesta_correcta}</strong>
                          </div>
                        )}
                        {esIncorrecto && !blanco.respuesta_correcta && (
                          <div style={{ marginTop: 8, fontSize: 13, color: T.error }}>
                            ✗ Incorrecto — intenta de nuevo
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        ))}

        {/* ── Resumen final si todos respondidos ── */}
        {totalBlancos > 0 && respondidos === totalBlancos && (
          <div style={{
            background: porcentaje >= 60 ? T.successBg : T.errorBg,
            border: `1.5px solid ${porcentaje >= 60 ? T.successBorder : T.errorBorder}`,
            borderRadius: T.radius, padding: "16px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: porcentaje >= 60 ? T.success : T.error, marginBottom: 4 }}>
              {porcentaje}%
            </div>
            <div style={{ fontSize: 14, color: porcentaje >= 60 ? T.success : T.error }}>
              {correctos} de {totalBlancos} blancos correctos
              {porcentaje >= 60 ? " — ¡Aprobado!" : " — Puedes seguir intentando los incorrectos"}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
};

export default QuizLti;