// src/pages/lti/QuizLti.tsx
// Página pública que Canvas embebe en un iframe al abrir el quiz.
// Recibe el JWT LTI por query param ?token= y lo usa para todas las peticiones.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Typography, CircularProgress, Alert, Chip, Divider,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon   from "@mui/icons-material/Quiz";
import { setLtiToken, fetchLti } from "../../helpers/fetchLti";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface IEstudiante {
  canvas_user_id: string;
  nombre:         string;
  email:          string;
}

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
  opciones: {
    _id:       string;
    texto:     string;
    blank_id?: string;
  }[];
}

interface IQuiz {
  _id:           string;
  titulo:        string;
  descripcion:   string;
  tiempo_limite: number | null;
  intentos:      number;
}

interface IQuizLtiData {
  estudiante: IEstudiante;
  quiz:       IQuiz;
  preguntas:  IPregunta[];
}

// ── Componente ────────────────────────────────────────────────────────────────

const QuizLti = () => {
  const [searchParams]            = useSearchParams();
  const [datos,    setDatos]      = useState<IQuizLtiData | null>(null);
  const [cargando, setCargando]   = useState(true);
  const [error,    setError]      = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Token LTI no proporcionado.");
      setCargando(false);
      return;
    }

    // Guardar el token en memoria para todas las peticiones LTI
    setLtiToken(token);

    // Decodificar el quiz_id desde el JWT (sin verificar — solo leer el payload)
    let quiz_id: string;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      quiz_id = payload.quiz_id;
      if (!quiz_id) throw new Error("quiz_id no encontrado en el token");
    } catch {
      setError("Token LTI inválido.");
      setCargando(false);
      return;
    }

    const cargar = async () => {
      try {
        const resp = await fetchLti(`api/lti/quiz/${quiz_id}`);
        const body = await resp.json();
        if (body.ok) {
          setDatos(body);
        } else {
          setError(body.msg ?? "Error al cargar el quiz");
        }
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [searchParams]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#2d5be3" }} />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !datos) {
    return (
      <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error ?? "Error desconocido"}
        </Alert>
      </div>
    );
  }

  const { estudiante, quiz, preguntas } = datos;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem", fontFamily: "sans-serif" }}>

      {/* ── Tarjeta del estudiante ── */}
      <div style={{
        background: "#f0f4ff", border: "1px solid #c7d7f4",
        borderRadius: 12, padding: "14px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <SchoolIcon sx={{ color: "#2d5be3", fontSize: 28 }} />
        <div>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f2c38", lineHeight: 1.2 }}>
            {estudiante.nombre}
          </Typography>
          <Typography variant="caption" sx={{ color: "#6793ba" }}>
            {estudiante.email}
          </Typography>
        </div>
      </div>

      {/* ── Encabezado del quiz ── */}
      <div style={{
        background: "#2d5be3", borderRadius: 14,
        padding: "18px 22px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <QuizIcon sx={{ color: "rgba(255,255,255,0.85)", fontSize: 22 }} />
          <Typography variant="h6" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
            {quiz.titulo}
          </Typography>
        </div>
        {quiz.descripcion && (
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 1.5 }}>
            {quiz.descripcion}
          </Typography>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip
            label={quiz.tiempo_limite ? `${quiz.tiempo_limite} min` : "Sin límite de tiempo"}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }}
          />
          <Chip
            label={`${quiz.intentos === 0 ? "∞" : quiz.intentos} intento${quiz.intentos !== 1 ? "s" : ""}`}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }}
          />
          <Chip
            label={`${preguntas.length} pregunta${preguntas.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.7rem" }}
          />
        </div>
      </div>

      {/* ── Lista de preguntas (solo visualización por ahora) ── */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #d9e4ee", padding: "20px 22px" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f2c38", mb: 2 }}>
          Preguntas del quiz
        </Typography>

        {preguntas.map((p, idx) => (
          <div key={p._id}>
            <div style={{ marginBottom: 16 }}>

              {/* Número + enunciado */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                <Chip
                  label={idx + 1}
                  size="small"
                  sx={{ bgcolor: "#e8f0fe", color: "#2d5be3", fontWeight: 700, minWidth: 28 }}
                />
                <div style={{ flex: 1 }}>
                  {/* Contexto FIB (enunciado padre) */}
                  {p.enunciado_contexto && (
                    <Typography variant="body2" sx={{ color: "#6793ba", mb: 0.5, fontStyle: "italic" }}
                      dangerouslySetInnerHTML={{ __html: p.enunciado_contexto }} />
                  )}
                  <Typography variant="body1" sx={{ color: "#1f2c38", fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: p.enunciado }} />
                </div>
                <Chip
                  label={`${p.puntos} pt${p.puntos !== 1 ? "s" : ""}`}
                  size="small"
                  sx={{ bgcolor: "#f0fdf4", color: "#16a34a", fontWeight: 600, fontSize: "0.7rem" }}
                />
              </div>

              {/* Items FIB */}
              {p.tipo === "fill_in_multiple_blanks" && p.items.length > 0 && (
                <div style={{ marginLeft: 38, display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.items.map((item) => (
                    <div key={item.id} style={{
                      background: "#f8fafc", border: "1px solid #e2eaf3",
                      borderRadius: 8, padding: "8px 12px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <Typography variant="caption" sx={{
                        color: "#2d5be3", fontWeight: 700, fontFamily: "monospace",
                        background: "#dbeafe", borderRadius: 4, px: 0.8, py: 0.3,
                        fontSize: 11, whiteSpace: "nowrap",
                      }}>
                        [{item.id}]
                      </Typography>
                      {item.enunciado && (
                        <Typography variant="body2" sx={{ color: "#374151", flex: 1 }}
                          dangerouslySetInnerHTML={{ __html: item.enunciado }} />
                      )}
                      <Chip
                        label={item.tipo_pimu}
                        size="small"
                        sx={{ bgcolor: "#f0f7ff", color: "#4A6D8C", fontSize: "0.65rem" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Opciones múltiple opción */}
              {(p.tipo === "multiple_choice" || p.tipo === "multiple_answers" || p.tipo === "true_false") && (
                <div style={{ marginLeft: 38, display: "flex", flexDirection: "column", gap: 4 }}>
                  {p.opciones.map((op) => (
                    <Typography key={op._id} variant="body2" sx={{ color: "#4b5563" }}>
                      • {op.texto}
                    </Typography>
                  ))}
                </div>
              )}

            </div>
            {idx < preguntas.length - 1 && <Divider sx={{ mb: 2 }} />}
          </div>
        ))}
      </div>

    </div>
  );
};

export default QuizLti;