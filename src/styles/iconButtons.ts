// src/styles/iconButtons.ts
// ─────────────────────────────────────────────────────────────────────────────
// Estilos sx para IconButton reutilizables en todo el admin.
// Importar directamente: import { iconBtnSx, iconBtnActiveSx } from "@/styles/iconButtons"
// ─────────────────────────────────────────────────────────────────────────────

import { PRIMARY, BORDER, BG } from "./tokens";

// ── Tamaño estándar (30×30) ───────────────────────────────────────────────────

/** Botón con borde — estado inactivo / neutral */
export const iconBtnSx = {
  width: 30,
  height: 30,
  borderRadius: "7px",
  border: `0.5px solid ${BORDER.default}`,
  bgcolor: BG.subtle,
  color: "#94A3B8",
  "&:hover": {
    bgcolor: "#F1F5F9",
    color: "#475569",
    borderColor: BORDER.strong,
  },
} as const;

/** Botón con borde — estado activo (publicado, seleccionado) */
export const iconBtnActiveSx = {
  ...iconBtnSx,
  color: PRIMARY.main,
  bgcolor: PRIMARY.light,
  borderColor: PRIMARY.border,
  "&:hover": {
    bgcolor: "#DBEAFE",
    color: PRIMARY.hover,
    borderColor: PRIMARY.borderHover,
  },
} as const;

/** Botón con borde — estado activo verde (publicado/synced) */
export const iconBtnSuccessSx = {
  ...iconBtnSx,
  color: "#16A34A",
  bgcolor: "#F0FDF4",
  borderColor: "#BBF7D0",
  "&:hover": { bgcolor: "#DCFCE7", color: "#15803D", borderColor: "#86EFAC" },
} as const;

// ── Tamaño pequeño (26×26) — para ClaseCard / TemaRow ────────────────────────

/** Botón con borde pequeño — estado inactivo */
export const iconBtnSmSx = {
  width: 26,
  height: 26,
  borderRadius: "6px",
  border: `0.5px solid ${BORDER.default}`,
  bgcolor: BG.subtle,
  color: "#94A3B8",
  "&:hover": {
    bgcolor: "#F1F5F9",
    color: "#475569",
    borderColor: BORDER.strong,
  },
} as const;

/** Botón con borde pequeño — estado activo */
export const iconBtnSmActiveSx = {
  ...iconBtnSmSx,
  color: PRIMARY.main,
  bgcolor: PRIMARY.light,
  borderColor: PRIMARY.border,
  "&:hover": {
    bgcolor: "#DBEAFE",
    color: PRIMARY.hover,
    borderColor: PRIMARY.borderHover,
  },
} as const;

// ── Tamaño extra-pequeño (24×24) — para TemaRow ───────────────────────────────

/** Botón con borde extra pequeño — estado inactivo */
export const iconBtnXsSx = {
  width: 24,
  height: 24,
  borderRadius: "6px",
  border: `0.5px solid ${BORDER.default}`,
  bgcolor: BG.subtle,
  color: "#94A3B8",
  "&:hover": {
    bgcolor: "#F1F5F9",
    color: "#475569",
    borderColor: BORDER.strong,
  },
} as const;

/** Botón con borde extra pequeño — estado activo */
export const iconBtnXsActiveSx = {
  ...iconBtnXsSx,
  color: PRIMARY.main,
  bgcolor: PRIMARY.light,
  borderColor: PRIMARY.border,
  "&:hover": {
    bgcolor: "#DBEAFE",
    color: PRIMARY.hover,
    borderColor: PRIMARY.borderHover,
  },
} as const;

// ── Menú ⋯ compartido ─────────────────────────────────────────────────────────

/** MenuItem normal */
export const menuItemSx = {
  gap: 1.5,
  py: 1,
  "&:hover": { bgcolor: BG.subtle },
} as const;

/** MenuItem destructivo (eliminar) */
export const menuItemDangerSx = {
  gap: 1.5,
  py: 1,
  "&:hover": { bgcolor: "#FFF5F5" },
} as const;
