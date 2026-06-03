// src/components/quiz/PreguntaViewer.tsx
// Componente de solo lectura para mostrar una pregunta con sus opciones/pares/respuesta.
// Usado en: PreguntaCard (quiz), EjercicioCard (ejercicios)

import { Typography, Divider, Chip } from "@mui/material";
import TiptapRenderer from "../CKEditor/TiptapRenderer";

// ── Tipos exportados ──────────────────────────────────────────────────────────

export interface IOpcion {
  texto: string;
  es_correcta: boolean;
  blank_id?: string | null;
  tipo_pimu?: string | null;
}

export interface IPar {
  izquierda: string;
  derecha: string;
}

export interface IRespuestaNumerica {
  tipo: "exact" | "range" | "precision";
  exacto?: number;
  margen?: number;
  minimo?: number;
  maximo?: number;
  precision?: number;
}

export interface IItemFIBViewer {
  id: string;
  enunciado: string;
  respuesta: string;
  tipo_pimu: string;
}

export type TipoPreguntaViewer =
  | "multiple_choice"
  | "multiple_answers"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "numerical"
  | "calculated"
  | "fill_in_multiple_blanks"
  | "multiple_dropdowns"
  | "text_only_question";

// ── Labels PIMU ───────────────────────────────────────────────────────────────

const PIMU_LABELS: Record<string, string> = {
  numero: "Número",
  formula: "Fórmula",
  antiderivada: "Antiderivada",
  conjunto: "Conjunto",
  intervalo: "Intervalo",
  ecuacion: "Ecuación",
  punto: "Punto",
  factorizacion: "Factorización",
  formulaN: "Fórmula (n)",
  formulaT: "Fórmula (t)",
  vector: "Vector",
  "conjunto-vectores": "Conjunto vectores",
};

const colClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  tipo: TipoPreguntaViewer;
  enunciado: string;
  // FIB nuevo schema
  enunciado_contexto?: string;
  items?: IItemFIBViewer[];
  columnas?: number;
  // otros tipos
  opciones?: IOpcion[];
  pares?: IPar[];
  respuesta_numerica?: IRespuestaNumerica;
  tipo_pimu?: string | null;
  respuesta_lti?: string | null;
}

// ── Componente ────────────────────────────────────────────────────────────────

const PreguntaViewer = ({
  tipo,
  enunciado,
  enunciado_contexto,
  items = [],
  columnas = 1,
  opciones = [],
  pares = [],
  respuesta_numerica,
  tipo_pimu,
  respuesta_lti,
}: Props) => {
  const esMultiple = tipo === "multiple_answers";
  const esFib = tipo === "fill_in_multiple_blanks";
  const esDropdown = tipo === "multiple_dropdowns";
  const esFIBItems = esFib && items.length > 0;

  const mostrarOpciones =
    tipo === "multiple_choice" ||
    tipo === "multiple_answers" ||
    tipo === "true_false";

  return (
    <div className="flex flex-col gap-2">
      {/* ── Enunciado / Enunciado de contexto ── */}
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "#1f2c38" }}>
        {(esFIBItems ? enunciado_contexto || enunciado : enunciado) ? (
          <TiptapRenderer>
            {esFIBItems ? enunciado_contexto || enunciado : enunciado}
          </TiptapRenderer>
        ) : (
          <span style={{ color: "#8daecb", fontStyle: "italic" }}>
            Sin enunciado
          </span>
        )}
      </div>

      {/* ── FIB con items[] — grid de blancos ── */}
      {esFIBItems && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div
            className={`grid ${colClass[Math.max(1, Math.min(3, Number(columnas) || 1)) as 1 | 2 | 3] ?? "grid-cols-1"} gap-3`}
          >
            {items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div className="flex items-center justify-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "#4A6D8C", fontWeight: 700 }}
                  >
                    Ítem {idx + 1}
                  </Typography>
                  <Chip
                    label={PIMU_LABELS[item.tipo_pimu] ?? item.tipo_pimu}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 18,
                      bgcolor: "#e0f0ff",
                      color: "#1d4ed8",
                    }}
                  />
                </div>
                {item.enunciado && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", fontSize: 13 }}
                  >
                    <TiptapRenderer>{item.enunciado}</TiptapRenderer>
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{ color: "#065f46", fontWeight: 600, fontSize: 13 }}
                >
                  ✓ {item.respuesta}
                </Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── FIB schema viejo (sin items[]) — tipo_pimu + respuesta_lti ── */}
      {esFib && !esFIBItems && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex items-center gap-2 flex-wrap">
            {tipo_pimu && (
              <Chip
                label={`LTI · ${PIMU_LABELS[tipo_pimu] ?? tipo_pimu}`}
                size="small"
                sx={{
                  bgcolor: "#e0f0ff",
                  color: "#1d4ed8",
                  fontWeight: 600,
                  fontSize: "0.65rem",
                }}
              />
            )}
            {respuesta_lti && (
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Respuesta: <strong>{respuesta_lti}</strong>
              </Typography>
            )}
          </div>
        </>
      )}

      {/* ── Opciones multiple_choice / multiple_answers / true_false ── */}
      {mostrarOpciones && opciones.length > 0 && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-1">
            {opciones.map((op, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2 py-1 rounded-lg"
                style={{
                  background: op.es_correcta ? "#f0fdf4" : "transparent",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    flexShrink: 0,
                    borderRadius: esMultiple ? "3px" : "50%",
                    border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                    background: op.es_correcta ? "#1a9e5c" : "transparent",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: op.es_correcta ? "#065f46" : "#3d3d3d",
                    fontWeight: op.es_correcta ? 600 : 400,
                    fontSize: 13,
                  }}
                >
                  {op.texto ? (
                    <TiptapRenderer>{op.texto}</TiptapRenderer>
                  ) : (
                    <em style={{ color: "#8daecb" }}>vacío</em>
                  )}
                </Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── multiple_dropdowns ── */}
      {esDropdown && opciones.length > 0 && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-2">
            {[...new Set(opciones.map((o) => o.blank_id ?? ""))].map((bid) => (
              <div key={bid} className="flex flex-col gap-0.5">
                <Typography
                  variant="caption"
                  sx={{ color: "#6793ba", fontWeight: 600 }}
                >
                  [{bid}]
                </Typography>
                {opciones
                  .filter((o) => o.blank_id === bid)
                  .map((op, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2 py-0.5"
                      style={{
                        background: op.es_correcta ? "#f0fdf4" : "transparent",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          flexShrink: 0,
                          border: `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                          background: op.es_correcta
                            ? "#1a9e5c"
                            : "transparent",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 12,
                          color: op.es_correcta ? "#065f46" : "#64748b",
                        }}
                      >
                        <TiptapRenderer>{op.texto}</TiptapRenderer>
                      </Typography>
                    </div>
                  ))}
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
                <span style={{ flex: 1, color: "#1e293b" }}>
                  {par.izquierda}
                </span>
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

      {/* ── Essay / short_answer ── */}
      {(tipo === "essay" || tipo === "short_answer") && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <Typography
            variant="caption"
            sx={{ color: "#8daecb", fontStyle: "italic" }}
          >
            {tipo === "essay"
              ? "Respuesta de desarrollo — corrección manual"
              : "Respuesta corta"}
          </Typography>
        </>
      )}
    </div>
  );
};

export default PreguntaViewer;
