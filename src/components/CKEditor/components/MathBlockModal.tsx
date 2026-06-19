import { useState, useRef, useCallback, useEffect } from "react";
import type { TipoEntorno } from "../plugins/MathBlockPlugin";
import { ENTORNO_LABELS, ENTORNO_COLORS } from "../plugins/MathBlockPlugin";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  tipo: TipoEntorno;
  subtituloActual: string;
  modoInsertar?: boolean;
  onSave:  (subtitulo: string) => void;
  onClose: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
//
// El estado inicial de subtitulo se fija con la prop subtituloActual en el
// useState — no se sincroniza via useEffect para evitar el warning
// react-hooks/set-state-in-effect. El padre siempre desmonta/remonta el modal
// al cambiar tipo (key={tipo} en MathTextEditor), así que la inicialización
// por useState es suficiente y correcta.

const MathBlockModal = ({
  tipo,
  subtituloActual,
  modoInsertar = false,
  onSave,
  onClose,
}: Props) => {
  const [subtitulo, setSubtitulo] = useState(subtituloActual);
  const inputRef = useRef<HTMLInputElement>(null);
  const colors   = ENTORNO_COLORS[tipo];
  const label    = ENTORNO_LABELS[tipo];

  // Focus automático al montar
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const handleConfirm = useCallback(() => {
    onSave(subtitulo.trim());
  }, [subtitulo, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter")  { e.preventDefault(); handleConfirm(); }
      if (e.key === "Escape") onClose();
    },
    [handleConfirm, onClose],
  );

  const tituloPreview = subtitulo.trim() ? `${label} (${subtitulo})` : label;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "24px 28px",
          width: "420px",
          maxWidth: "calc(100vw - 32px)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            display: "inline-block",
            width: "10px", height: "10px",
            borderRadius: "50%",
            background: colors.border,
            flexShrink: 0,
          }} />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
            {modoInsertar ? `Insertar ${label}` : `Editar ${label}`}
          </span>
        </div>

        {/* Input subtítulo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Subtítulo{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>
              (opcional)
            </span>
          </label>
          <input
            ref={inputRef}
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ej: Teorema de Bolzano, Prop. 2.3, ..."
            style={{
              border: "1.5px solid #e2e8f0",
              borderRadius: "7px",
              padding: "8px 12px",
              fontSize: "14px",
              color: "#1e293b",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = colors.border)}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* Preview */}
        <div style={{
          borderLeft: `4px solid ${colors.border}`,
          // background: colors.bg,
          borderRadius: "6px",
          padding: "10px 14px",
        }}>
          <div style={{
            color: colors.label,
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>
            {tituloPreview}
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
            Contenido del bloque...
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              borderRadius: "7px",
              border: "1.5px solid #e2e8f0",
              background: "#f8fafc",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "7px 18px",
              borderRadius: "7px",
              border: "none",
              background: colors.border,
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {modoInsertar ? "Insertar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathBlockModal;