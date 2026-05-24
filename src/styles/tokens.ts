// src/styles/tokens.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fuente única de verdad para el sistema de diseño del admin.
// Importar desde aquí en todos los componentes — nunca hardcodear colores.
// ─────────────────────────────────────────────────────────────────────────────

// ── Colores de texto ──────────────────────────────────────────────────────────
export const TEXT = {
  primary: "#0F172A",
  secondary: "#475569",
  tertiary: "#64748B",
  muted: "#94A3B8",
  placeholder: "#CBD5E1",
} as const;

// ── Colores de fondo ──────────────────────────────────────────────────────────
export const BG = {
  page: "#F4F5F7", // fondo de página
  surface: "#FFFFFF", // cards, modales
  subtle: "#F8FAFC", // zonas secundarias dentro de cards
  muted: "#FAFAFA", // zona de temas dentro de ClaseCard
} as const;

// ── Bordes ────────────────────────────────────────────────────────────────────
export const BORDER = {
  default: "#E2E8F0",
  subtle: "#F1F5F9",
  strong: "#CBD5E1",
} as const;

// ── Colores primarios ─────────────────────────────────────────────────────────
export const PRIMARY = {
  main: "#2563EB",
  hover: "#1D4ED8",
  light: "#EFF6FF",
  border: "#BFDBFE",
  borderHover: "#93C5FD",
  dark: "#1E3A8A",
  text: "#1E3A8A",
} as const;

// ── Colores de estado ─────────────────────────────────────────────────────────
export const STATE = {
  // Éxito
  successText: "#166534",
  successBg: "#DCFCE7",
  successBorder: "#BBF7D0",
  // Error / eliminar
  errorMain: "#DC2626",
  errorHover: "#B91C1C",
  errorText: "#991B1B",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  // Warning
  warningText: "#854D0E",
  warningBg: "#FEF9C3",
  warningBorder: "#FDE68A",
  // Pending
  pendingText: "#78350F",
  pendingBg: "#FFFBEB",
} as const;

// ── Colores del navbar / headers de página ────────────────────────────────────
export const CHROME = {
  navbar: "#1E293B", // navbar global
  header: "#1E293B", // header de páginas (Capitulos, Clases, etc.)
  headerText: "rgba(255,255,255,0.88)",
  headerMuted: "rgba(255,255,255,0.35)",
  headerBorder: "rgba(255,255,255,0.15)",
  headerSubtle: "rgba(255,255,255,0.08)",
} as const;

// ── Colores semánticos de recursos ────────────────────────────────────────────
export const RECURSO = {
  diapositiva: "#F59E0B", // ámbar
  video: "#EF4444", // rojo
  quiz: "#2563EB", // azul (=PRIMARY.main)
  solucion: "#0D9488", // teal
} as const;

// ── Paleta de cursos — 6 colores cíclicos ─────────────────────────────────────
export const CURSO_PALETTE = [
  {
    border: "#2563EB",
    pillBg: "#EFF6FF",
    pillBorder: "#BFDBFE",
    pillText: "#1E3A8A",
    accent: "#2563EB",
  },
  {
    border: "#7C3AED",
    pillBg: "#F5F3FF",
    pillBorder: "#DDD6FE",
    pillText: "#4C1D95",
    accent: "#7C3AED",
  },
  {
    border: "#0D9488",
    pillBg: "#F0FDFA",
    pillBorder: "#99F6E4",
    pillText: "#134E4A",
    accent: "#0D9488",
  },
  {
    border: "#D97706",
    pillBg: "#FFFBEB",
    pillBorder: "#FDE68A",
    pillText: "#78350F",
    accent: "#D97706",
  },
  {
    border: "#DB2777",
    pillBg: "#FDF2F8",
    pillBorder: "#FBCFE8",
    pillText: "#831843",
    accent: "#DB2777",
  },
  {
    border: "#475569",
    pillBg: "#F8FAFC",
    pillBorder: "#CBD5E1",
    pillText: "#1E293B",
    accent: "#475569",
  },
] as const;

// ── Border radius ─────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  xxl: "14px", // modales
  full: "20px", // pills
} as const;

// ── Sombras ───────────────────────────────────────────────────────────────────
export const SHADOW = {
  card: "0 1px 4px rgba(0,0,0,0.04)",
  cardHover: "0 4px 20px rgba(0,0,0,0.08)",
  dragging: "0 8px 24px rgba(0,0,0,0.12)",
  modal: "0 4px 16px rgba(0,0,0,0.08)",
} as const;

// ── Tipografía ────────────────────────────────────────────────────────────────
export const FONT = {
  serif: "Georgia, serif",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'Cascadia Code', monospace",
} as const;

// ── Estilos de menú desplegable (Menú ⋯) ─────────────────────────────────────
export const MENU_PAPER_SX = {
  mt: 0.5,
  minWidth: 150,
  borderRadius: RADIUS.md,
  border: `0.5px solid ${BORDER.default}`,
  boxShadow: SHADOW.modal,
} as const;
