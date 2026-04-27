// src/pages/diapositiva/revealStyles.ts
// ── Estilos compartidos para Reveal.js ───────────────────────────────────────
// Este bloque se usa tanto en el frontend (preview) como en el backend (compilar)
// para garantizar que lo que se ve en el editor = lo que se publica en Canvas

export const REVEAL_STYLES = `
/* ══════════════════════════════════════════════════════════════
   RESET Y BASE
   ══════════════════════════════════════════════════════════════ */
.reveal .slides        { text-align: left; }
.reveal h1,
.reveal h2,
.reveal h3,
.reveal h4             { text-align: left; margin-bottom: 0.4em; }
.reveal p              { margin: 0.5em 0; line-height: 1.6; }
.reveal section        { padding: 0 !important; }
.reveal pre            { box-shadow: none; width: 100%; margin: 0.8em 0; }
.reveal code           { font-size: 0.85em; }
.reveal blockquote     { width: 100%; box-shadow: none; font-style: italic; border-left: 4px solid #aaa; padding-left: 1em; }

/* ══════════════════════════════════════════════════════════════
   LISTAS
   ══════════════════════════════════════════════════════════════ */
.reveal ul,
.reveal ol             { display: block; margin: 0.5em 0 0.5em 1.6em; padding: 0; text-align: left; }
.reveal ul              { list-style-type: disc; }
.reveal ol              { list-style-type: decimal; }
.reveal ul ul           { list-style-type: circle; margin-top: 0.3em; }
.reveal ul ul ul        { list-style-type: square; }
.reveal li              { margin-bottom: 0.35em; line-height: 1.5; }
.reveal li > ul,
.reveal li > ol        { margin-top: 0.3em; }

/* ══════════════════════════════════════════════════════════════
   TABLAS
   ══════════════════════════════════════════════════════════════ */
.reveal table          { width: 100%; border-collapse: collapse; font-size: 0.82em; margin: 0.8em 0; }
.reveal table th       { background: rgba(74,109,140,0.15); font-weight: 600; padding: 0.5em 0.8em; border: 1px solid rgba(0,0,0,0.15); text-align: left; }
.reveal table td       { padding: 0.45em 0.8em; border: 1px solid rgba(0,0,0,0.1); vertical-align: top; }
.reveal table tr:nth-child(even) td { background: rgba(0,0,0,0.04); }
.reveal table tr:hover td { background: rgba(74,109,140,0.08); }

/* ══════════════════════════════════════════════════════════════
   DOS COLUMNAS (layout)
   ══════════════════════════════════════════════════════════════ */
.reveal .two-col       { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; width: 100%; }
.reveal .two-col-left  { display: grid; grid-template-columns: 1fr 2fr; gap: 2em; width: 100%; }
.reveal .two-col-right { display: grid; grid-template-columns: 2fr 1fr; gap: 2em; width: 100%; }
.reveal .col           { min-width: 0; }

/* ══════════════════════════════════════════════════════════════
   COMPONENTES MATEMÁTICOS
   ══════════════════════════════════════════════════════════════ */

/* ── Base compartida ── */
.reveal .math-block {
  border-radius: 6px;
  padding: 0.7em 1em;
  margin: 0.6em 0;
  font-size: 0.85em;
  line-height: 1.65;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}
.reveal .math-block-title {
  font-weight: 700;
  font-size: 0.9em;
  letter-spacing: 0.03em;
  margin-bottom: 0.35em;
  text-transform: uppercase;
}
.reveal .math-block-body { margin: 0; }

/* ── Definición — azul ── */
.reveal .definicion {
  background: rgba(37, 99, 180, 0.07);
  border-left: 4px solid #2563b4;
}
.reveal .definicion .math-block-title { color: #1d4ed8; }

/* ── Teorema — verde oscuro ── */
.reveal .teorema {
  background: rgba(21, 128, 61, 0.07);
  border-left: 4px solid #15803d;
}
.reveal .teorema .math-block-title { color: #166534; }

/* ── Proposición — morado ── */
.reveal .proposicion {
  background: rgba(109, 40, 217, 0.07);
  border-left: 4px solid #7c3aed;
}
.reveal .proposicion .math-block-title { color: #6d28d9; }

/* ── Corolario — azul cielo ── */
.reveal .corolario {
  background: rgba(2, 132, 199, 0.07);
  border-left: 4px solid #0284c7;
}
.reveal .corolario .math-block-title { color: #0369a1; }

/* ── Lema — teal ── */
.reveal .lema {
  background: rgba(13, 148, 136, 0.07);
  border-left: 4px solid #0d9488;
}
.reveal .lema .math-block-title { color: #0f766e; }

/* ── Ejemplo — naranja ── */
.reveal .ejemplo {
  background: rgba(234, 88, 12, 0.07);
  border-left: 4px solid #ea580c;
}
.reveal .ejemplo .math-block-title { color: #c2410c; }

/* ── Demostración — gris, cursiva ── */
.reveal .demostracion {
  background: rgba(100, 116, 139, 0.06);
  border-left: 4px solid #94a3b8;
  font-style: italic;
}
.reveal .demostracion .math-block-title {
  color: #475569;
  font-style: normal;
}
.reveal .demostracion::after {
  content: '∎';
  display: block;
  text-align: right;
  font-style: normal;
  font-size: 1.1em;
  margin-top: 0.3em;
  color: #64748b;
}

/* ── Observación — amarillo ── */
.reveal .observacion {
  background: rgba(202, 138, 4, 0.08);
  border-left: 4px solid #ca8a04;
}
.reveal .observacion .math-block-title { color: #92400e; }

/* ══════════════════════════════════════════════════════════════
   CÓDIGO
   ══════════════════════════════════════════════════════════════ */
.reveal pre code.hljs  { padding: 1em; border-radius: 6px; font-size: 0.85em; }
.reveal .inline-code   { background: rgba(0,0,0,0.08); padding: 0.1em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.88em; }

/* ══════════════════════════════════════════════════════════════
   UTILIDADES
   ══════════════════════════════════════════════════════════════ */
.reveal .text-sm       { font-size: 0.75em; }
.reveal .text-center   { text-align: center; }
.reveal .text-right    { text-align: right; }
.reveal .mt-1          { margin-top: 0.5em; }
.reveal .mt-2          { margin-top: 1em; }
.reveal .mb-1          { margin-bottom: 0.5em; }
.reveal .mb-2          { margin-bottom: 1em; }
.reveal .highlight     { background: rgba(250, 204, 21, 0.35); padding: 0 0.2em; border-radius: 2px; }
`;

// ── Helpers para generar HTML de componentes matemáticos ────────────────────

export type ComponenteMatematico =
  | "definicion"
  | "teorema"
  | "proposicion"
  | "corolario"
  | "lema"
  | "ejemplo"
  | "demostracion"
  | "observacion";

export const COMPONENTES_LABELS: Record<ComponenteMatematico, string> = {
  definicion:   "Definición",
  teorema:      "Teorema",
  proposicion:  "Proposición",
  corolario:    "Corolario",
  lema:         "Lema",
  ejemplo:      "Ejemplo",
  demostracion: "Demostración",
  observacion:  "Observación",
};

export const COMPONENTES_COLORS: Record<ComponenteMatematico, string> = {
  definicion:   "#1d4ed8",
  teorema:      "#166534",
  proposicion:  "#6d28d9",
  corolario:    "#0369a1",
  lema:         "#0f766e",
  ejemplo:      "#c2410c",
  demostracion: "#475569",
  observacion:  "#92400e",
};

/**
 * Genera el HTML de un componente matemático para incluir en un slide.
 * Se usa en el compilador tanto del frontend como del backend.
 */
export const htmlComponente = (
  tipo: ComponenteMatematico,
  titulo: string,  // ej: "Teorema de Bolzano" — puede estar vacío
  cuerpo: string,  // HTML del contenido
): string => {
  const label = COMPONENTES_LABELS[tipo];
  const tituloCompleto = titulo.trim()
    ? `${label} <span style="font-weight:400;text-transform:none;">(${titulo})</span>`
    : label;

  return `<div class="math-block ${tipo}">
  <div class="math-block-title">${tituloCompleto}</div>
  <div class="math-block-body">${cuerpo}</div>
</div>`;
};