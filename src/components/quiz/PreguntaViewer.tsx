// src/components/quiz/PreguntaViewer.tsx
// Componente de solo lectura para mostrar una pregunta con sus opciones/pares/respuesta
// Usado en: PreguntaCard (quiz), EjercicioCard (ejercicios)

import { Typography, Divider, Chip } from "@mui/material";
import TiptapRenderer from "../CKEditor/TiptapRenderer";

export interface IOpcion {
  texto:       string;
  es_correcta: boolean;
  blank_id?:   string | null;
}

export interface IPar {
  izquierda: string;
  derecha:   string;
}

export interface IRespuestaNumerica {
  tipo:       "exact" | "range" | "precision";
  exacto?:    number;
  margen?:    number;
  minimo?:    number;
  maximo?:    number;
  precision?: number;
}

export type TipoPreguntaViewer =
  | "multiple_choice"
  | "multiple_answers"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "numerical"
  | "fill_in_multiple_blanks"
  | "text_only_question";

// Etiquetas para tipo PIMU
const PIMU_LABELS: Record<string, string> = {
  numero:            "Número",
  formula:           "Fórmula",
  antiderivada:      "Antiderivada",
  conjunto:          "Conjunto",
  intervalo:         "Intervalo",
  ecuacion:          "Ecuación",
  punto:             "Punto",
  factorizacion:     "Factorización",
  formulaN:          "Fórmula (n)",
  formulaT:          "Fórmula (t)",
  vector:            "Vector",
  "conjunto-vectores": "Conjunto vectores",
};

interface Props {
  tipo:               TipoPreguntaViewer;
  enunciado:          string;
  opciones?:          IOpcion[];
  pares?:             IPar[];
  respuesta_numerica?: IRespuestaNumerica;
  // Campos LTI — solo para fill_in_multiple_blanks
  tipo_pimu?:         string | null;
  respuesta_lti?:     string | null;
}

const PreguntaViewer = ({
  tipo,
  enunciado,
  opciones = [],
  pares = [],
  respuesta_numerica,
  tipo_pimu,
  respuesta_lti,
}: Props) => {
  const esMultiple = tipo === "multiple_answers";
  const esFib      = tipo === "fill_in_multiple_blanks";

  const mostrarOpciones =
    tipo === "multiple_choice" ||
    tipo === "multiple_answers" ||
    tipo === "true_false";

  return (
    <div className="flex flex-col gap-2">

      {/* ── Enunciado ── */}
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "#1f2c38" }}>
        {enunciado ? (
          <TiptapRenderer>{enunciado}</TiptapRenderer>
        ) : (
          <span style={{ color: "#8daecb", fontStyle: "italic" }}>Sin enunciado</span>
        )}
      </div>

      {/* ── Info LTI para fill_in_multiple_blanks ── */}
      {esFib && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600 }}>
              Validación LTI:
            </Typography>
            {tipo_pimu && (
              <Chip
                label={PIMU_LABELS[tipo_pimu] ?? tipo_pimu}
                size="small"
                sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#e0f0ff", color: "#1d4ed8", fontWeight: 600 }}
              />
            )}
            {respuesta_lti && (
              <code style={{
                background: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                color: "#0f172a",
                fontFamily: "monospace",
              }}>
                {respuesta_lti}
              </code>
            )}
          </div>
        </>
      )}

      {/* ── Opciones ── */}
      {mostrarOpciones && opciones.length > 0 && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-1.5">
            {opciones.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                  border: `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                }}>
                <div style={{
                  width: 12, height: 12, flexShrink: 0,
                  borderRadius: esMultiple ? "3px" : "50%",
                  border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                  background: op.es_correcta ? "#1a9e5c" : "transparent",
                }} />
                <Typography variant="body2"
                  sx={{ color: op.es_correcta ? "#065f46" : "#3d3d3d",
                    fontWeight: op.es_correcta ? 600 : 400, fontSize: 13 }}>
                  {op.texto || <em style={{ color: "#8daecb" }}>vacío</em>}
                </Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Pares matching ── */}
      {tipo === "matching" && pares.length > 0 && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-1.5">
            {pares.map((par, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span style={{ flex: 1, color: "#1e293b" }}>{par.izquierda}</span>
                <span style={{ color: "#8daecb" }}>→</span>
                <span style={{ flex: 1, color: "#1e293b" }}>{par.derecha}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Respuesta numérica ── */}
      {tipo === "numerical" && respuesta_numerica && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <Typography variant="caption" sx={{ color: "#6793ba" }}>
            {respuesta_numerica.tipo === "exact" &&
              `Respuesta: ${respuesta_numerica.exacto} ± ${respuesta_numerica.margen}`}
            {respuesta_numerica.tipo === "range" &&
              `Rango: [${respuesta_numerica.minimo}, ${respuesta_numerica.maximo}]`}
            {respuesta_numerica.tipo === "precision" &&
              `Valor: ${respuesta_numerica.exacto} (${respuesta_numerica.precision} decimales)`}
          </Typography>
        </>
      )}

      {/* ── Essay / short_answer / text_only_question ── */}
      {(tipo === "essay" || tipo === "short_answer") && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <Typography variant="caption" sx={{ color: "#8daecb", fontStyle: "italic" }}>
            {tipo === "essay" ? "Respuesta de desarrollo — corrección manual" : "Respuesta corta"}
          </Typography>
        </>
      )}
    </div>
  );
};

export default PreguntaViewer;