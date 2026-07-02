// src/components/CKEditor/mathEditorShared.ts
//
// Núcleo COMPARTIDO de los editores CKEditor (MathTextEditor / MathTextEditorInline /
// MathTextEditorDiapositiva). Aquí vive solo lo PURO y estático que hoy está
// triplicado idéntico en los tres: tipos de estado de los modales, sus constantes
// "cerrado", la config de htmlSupport y la paleta de colores de texto.
//
// Objetivo (P1.1): que los tres editores importen de aquí en vez de mantener
// copias divergentes. La divergencia que quede en cada editor debe ser real
// (clase de editor, plugins/toolbar, escalado de slide), no copia.
//
// NOTA IMPORTANTE sobre HTML_SUPPORT_CONFIG:
//   Esta es la versión CANÓNICA (la del editor base). NO incluye la regla
//   permisiva `{ name: /.*/, attributes: true, classes: true, styles: true }`.
//   Esa regla, que estaba activa solo en el Inline, hacía que GHS capturara los
//   spans de math antes de que el MathPlugin los convirtiera a nodo `mathInline`,
//   provocando que getData() devolviera el formato intermedio en vez de \(...\)
//   (causa raíz del bug de alternativas vacías en Canvas). Al centralizar aquí,
//   el Inline queda corregido de paso.

import type { TipoEntorno } from "./plugins/MathBlockPlugin";

// ── Tipos de estado de los modales ───────────────────────────────────────────

export interface LatexModalState {
  open: boolean;
  latex: string;
  type: "inline" | "block";
  onSave: ((latex: string, type: "inline" | "block") => void) | null;
}

export interface UrlModalState {
  open: boolean;
  tab?: 0 | 1;
}

export interface EnvModalState {
  open: boolean;
  tipo: TipoEntorno;
  subtituloActual: string;
  modoInsertar: boolean;
  onSave: ((subtitulo: string) => void) | null;
}

// ── Constantes "modal cerrado" ───────────────────────────────────────────────

export const LATEX_MODAL_CLOSED: LatexModalState = {
  open: false,
  latex: "",
  type: "inline",
  onSave: null,
};

export const ENV_MODAL_CLOSED: EnvModalState = {
  open: false,
  tipo: "definicion",
  subtituloActual: "",
  modoInsertar: true,
  onSave: null,
};

// ── htmlSupport (GeneralHtmlSupport) — versión canónica, sin regla permisiva ──

export const HTML_SUPPORT_CONFIG = {
  allow: [
    { name: "ol", attributes: { type: true }, classes: true, styles: true },
    { name: "div", attributes: true, classes: true, styles: true },
    { name: "section", attributes: true, classes: true, styles: true },
    {
      name: "iframe",
      attributes: [
        "src",
        "width",
        "height",
        "style",
        "scrolling",
        "allowfullscreen",
        "fullscreen",
        "frameborder",
        "border",
      ],
      classes: false,
      styles: true,
      module: "GeneralHtmlSupport",
    },
    {
      name: "table",
      attributes: ["border", "cellpadding", "cellspacing", "align"],
      classes: false,
      styles: true,
    },
    {
      name: "td",
      attributes: ["width", "valign", "align"],
      classes: false,
      styles: true,
    },
    {
      name: "th",
      attributes: ["width", "valign", "align"],
      classes: false,
      styles: true,
    },
    { name: "tbody", attributes: ["align"], classes: false, styles: false },
    { name: "center", attributes: false, classes: false, styles: false },
    { name: "u", attributes: false, classes: false, styles: false },
    { name: "h5", attributes: false, classes: false, styles: true },
    { name: /.*/, attributes: /^data-/, classes: false, styles: false },
  ],
};

// ── Paleta de color de texto — calza 1:1 con TEXT_COLOR_CLASS del InlineStylesPlugin

export const FONT_COLORS = [
  { color: "#0f172a", label: "Slate" },
  { color: "#64748b", label: "Gris" },
  { color: "#0d9488", label: "Teal" },
  { color: "#16a34a", label: "Verde" },
  { color: "#dc2626", label: "Rojo" },
];
