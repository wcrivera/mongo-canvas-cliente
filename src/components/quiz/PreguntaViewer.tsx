// src/components/quiz/PreguntaViewer.tsx
// Componente de solo lectura para mostrar una pregunta con sus opciones/pares/respuesta
// Usado en: PreguntaCard (quiz), EjercicioCard (ejercicios)

import { useMemo }         from "react";
import { Typography, Divider } from "@mui/material";
import katex               from "katex";
import LatexRenderer       from "../LaTeX/LatexRenderer";
import "katex/dist/katex.min.css";

export interface IOpcion {
  texto:       string;
  es_correcta: boolean;
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
  | "numerical";

interface Props {
  tipo:                TipoPreguntaViewer;
  enunciado:           string;
  opciones?:           IOpcion[];
  pares?:              IPar[];
  respuesta_numerica?: IRespuestaNumerica;
}

// Renderiza \(...\) y \[...\] dentro de HTML con KaTeX
const renderLatexEnHtml = (html: string): string =>
  html
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
      try {
        return `<div style="text-align:center;margin:0.8em 0">${katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch { return `\\[${latex}\\]`; }
    })
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
      } catch { return `\\(${latex}\\)`; }
    });

const EnunciadoRenderer = ({ children }: { children: string }) => {
  const html = useMemo(() => {
    if (!children) return "";
    // HTML de CKEditor (empieza con "<")
    if (children.trimStart().startsWith("<")) {
      return renderLatexEnHtml(children);
    }
    return children;
  }, [children]);

  if (!children) return null;

  if (children.trimStart().startsWith("<")) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ lineHeight: 1.75, fontSize: 14, color: "#1f2c38" }}
      />
    );
  }

  // Texto plano legacy con LaTeX
  return <LatexRenderer>{children}</LatexRenderer>;
};

const PreguntaViewer = ({
  tipo,
  enunciado,
  opciones = [],
  pares = [],
  respuesta_numerica,
}: Props) => {
  const esMultiple = tipo === "multiple_answers";
  const mostrarOpciones =
    tipo === "multiple_choice" ||
    tipo === "multiple_answers" ||
    tipo === "true_false";

  return (
    <div className="flex flex-col gap-2">

      {/* ── Enunciado ── */}
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "#1f2c38" }}>
        {enunciado
          ? <EnunciadoRenderer>{enunciado}</EnunciadoRenderer>
          : <span style={{ color: "#8daecb", fontStyle: "italic" }}>Sin enunciado</span>
        }
      </div>

      {/* ── Opciones ── */}
      {mostrarOpciones && opciones.length > 0 && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-1.5">
            {opciones.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: op.es_correcta ? "#d1fae5" : "#f9f9f9",
                  border:     `1px solid ${op.es_correcta ? "#6ee7b7" : "#e0e0e0"}`,
                }}>
                <div style={{
                  width: 12, height: 12, flexShrink: 0,
                  borderRadius: esMultiple ? "3px" : "50%",
                  border:       `2px solid ${op.es_correcta ? "#1a9e5c" : "#ccc"}`,
                  background:   op.es_correcta ? "#1a9e5c" : "transparent",
                }} />
                <Typography variant="body2" sx={{
                  color:      op.es_correcta ? "#065f46" : "#3d3d3d",
                  fontWeight: op.es_correcta ? 600 : 400,
                  fontSize:   "0.85rem",
                }}>
                  <LatexRenderer>{op.texto}</LatexRenderer>
                </Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Respuesta corta / ensayo ── */}
      {(tipo === "short_answer" || tipo === "essay") && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="rounded-lg px-3 py-2"
            style={{ background: "#f0f4f8", border: "1px solid #d9e4ee" }}>
            <Typography variant="caption" sx={{ color: "#6793ba", fontStyle: "italic" }}>
              {tipo === "short_answer"
                ? "El estudiante ingresa una respuesta corta"
                : "El estudiante redacta un ensayo"}
            </Typography>
          </div>
        </>
      )}

      {/* ── Matching ── */}
      {tipo === "matching" && pares.length > 0 && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="flex flex-col gap-1.5">
            {pares.map((par, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: "#f0f4f8", border: "1px solid #d9e4ee" }}>
                <Typography variant="caption" sx={{ color: "#1f2c38", fontWeight: 500, flex: 1 }}>
                  {par.izquierda}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8daecb" }}>↔</Typography>
                <Typography variant="caption" sx={{ color: "#1f2c38", flex: 1 }}>
                  {par.derecha}
                </Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Numérica ── */}
      {tipo === "numerical" && respuesta_numerica && (
        <>
          <Divider sx={{ borderColor: "#f0f0f0" }} />
          <div className="rounded-lg px-3 py-2"
            style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
            <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 500 }}>
              {respuesta_numerica.tipo === "exact" &&
                `Respuesta: ${respuesta_numerica.exacto} ± ${respuesta_numerica.margen}`}
              {respuesta_numerica.tipo === "range" &&
                `Rango: ${respuesta_numerica.minimo} — ${respuesta_numerica.maximo}`}
              {respuesta_numerica.tipo === "precision" &&
                `Exacto: ${respuesta_numerica.exacto} (${respuesta_numerica.precision} decimales)`}
            </Typography>
          </div>
        </>
      )}

    </div>
  );
};

export default PreguntaViewer;