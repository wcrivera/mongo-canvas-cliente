// src/components/BaseModal/BaseModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal base reutilizable para todo el admin.
// Todos los modales del sistema deben usar este componente como base.
//
// Uso:
//   <BaseModal
//     open
//     title="Editar curso"
//     icon={<MenuBookIcon sx={{ fontSize: 16, color: "white" }} />}
//     onClose={onClose}
//     actions={<Button onClick={handleGuardar}>Guardar</Button>}
//   >
//     ... contenido ...
//   </BaseModal>
//
// Para modales destructivos (eliminar), usar iconBg="#DC2626":
//   <BaseModal iconBg="#DC2626" iconBorder="#EF4444" ...>
// ─────────────────────────────────────────────────────────────────────────────

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { CHROME, PRIMARY, RADIUS } from "../../styles/tokens";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface BaseModalProps {
  // Contenido
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;

  // Acciones del footer — si no se pasa, no se renderiza DialogActions
  actions?: React.ReactNode;

  // Configuración del ícono
  iconBg?: string; // default: PRIMARY.main (#2563EB)
  iconBorder?: string; // default: #3B82F6

  // Dialog props
  open?: boolean; // default: true (el padre controla con condicional)
  maxWidth?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  onClose: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const BaseModal = ({
  title,
  icon,
  children,
  actions,
  iconBg = PRIMARY.main,
  iconBorder = "#3B82F6",
  open = true,
  maxWidth = "sm",
  fullWidth = true,
  onClose,
  onKeyDown,
}: BaseModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onKeyDown={onKeyDown}
      slotProps={{
        paper: {
          sx: { borderRadius: RADIUS.xxl, overflow: "hidden" },
        },
      }}
    >
      {/* ── Header oscuro con ícono ── */}
      <DialogTitle
        sx={{
          bgcolor: CHROME.header,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
          px: 3,
          fontFamily: "Georgia, serif",
          fontSize: "17px",
          fontWeight: "normal",
          lineHeight: 1.3,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {title}
      </DialogTitle>

      {/* ── Contenido ── */}
      <DialogContent
        sx={{
          pt: 3,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {children}
      </DialogContent>

      {/* ── Acciones ── */}
      {actions && (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
};

// ── Botones de acción estándar ────────────────────────────────────────────────

interface ModalCancelButtonProps {
  onClick: () => void;
  label?: string;
}

export const ModalCancelButton = ({
  onClick,
  label = "Cancelar",
}: ModalCancelButtonProps) => (
  <Button
    onClick={onClick}
    sx={{
      color: "#94A3B8",
      textTransform: "none",
      borderRadius: RADIUS.md,
      "&:hover": { bgcolor: "#F8FAFC" },
    }}
  >
    {label}
  </Button>
);

interface ModalSubmitButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  danger?: boolean; // si true, botón rojo
}

export const ModalSubmitButton = ({
  onClick,
  loading = false,
  disabled = false,
  label = "Guardar",
  loadingLabel = "Guardando...",
  danger = false,
}: ModalSubmitButtonProps) => (
  <Button
    onClick={onClick}
    variant="contained"
    disabled={loading || disabled}
    startIcon={
      loading ? <CircularProgress size={14} color="inherit" /> : undefined
    }
    sx={{
      bgcolor: danger ? "#DC2626" : PRIMARY.main,
      borderRadius: RADIUS.md,
      px: 2.5,
      fontWeight: 500,
      fontSize: "13px",
      textTransform: "none",
      boxShadow: "none",
      "&:hover": { bgcolor: danger ? "#B91C1C" : "#1D4ED8", boxShadow: "none" },
    }}
  >
    {loading ? loadingLabel : label}
  </Button>
);

export default BaseModal;
