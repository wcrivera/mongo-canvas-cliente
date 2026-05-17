// src/pages/auth/Login.tsx
import { useState } from "react";
import { fetchSinToken } from "../../helpers/fetch";

// ── Datos decorativos ─────────────────────────────────────────────────────────

const FORMULAS = [
  "∫₀^∞ e⁻ˣ² dx = √π/2",
  "eⁱᵖⁱ + 1 = 0",
  "∑_{n=1}^∞ 1/n² = π²/6",
  "det(A) = ad − bc",
  "lim_{h→0} [f(x+h)−f(x)]/h",
  "∇²φ = ρ/ε₀",
  "P(A|B) = P(A∩B)/P(B)",
  "∂²u/∂t² = c²∇²u",
  "∑ aₙxⁿ",
  "ℝⁿ → ℝᵐ",
  "‖v‖ = √(v·v)",
  "Ax = λx",
];

const STATS = [
  { value: "+1.200", label: "ejercicios" },
  { value: "+300",   label: "videos"     },
  { value: "8",      label: "cursos"     },
];

const RECURSOS = [
  { label: "Diapositivas", color: "#F59E0B" },
  { label: "Videos",       color: "#EF4444" },
  { label: "Quizzes",      color: "#2563EB" },
];

// ── Íconos SVG inline ─────────────────────────────────────────────────────────

const MicrosoftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 21 21"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
    <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
    <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0, marginTop: 1 }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8"  x2="12.01" y2="8" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────────

const Login = () => {
  
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleLoginMicrosoft = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchSinToken("api/auth/login");
      const body = await resp.json();
      if (body.ok) {
        window.location.href = body.url;
      } else {
        setError("No se pudo obtener la URL de login.");
        setLoading(false);
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A1020] p-4">
      <div
        className="w-full overflow-hidden flex flex-col sm:flex-row"
        style={{
          maxWidth: 780,
          minHeight: 480,
          borderRadius: 18,
          border: "0.5px solid rgba(255,255,255,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >

        {/* ── Panel izquierdo: branding ────────────────────────────────── */}
        <div
          className="relative flex flex-col justify-between overflow-hidden sm:w-[52%]"
          style={{ background: "#0F172A", padding: "36px 36px 32px" }}
        >
          {/* Línea de acento vertical derecha */}
          <div
            className="absolute top-0 right-0 bottom-0"
            style={{ width: 2, background: "linear-gradient(to bottom, #2563EB 0%, transparent 100%)" }}
            aria-hidden="true"
          />

          {/* Fórmulas decorativas de fondo */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            {FORMULAS.map((f, i) => (
              <span
                key={i}
                className="absolute font-serif whitespace-nowrap"
                style={{
                  color:     "rgba(255,255,255,0.032)",
                  fontSize:  `${13 + (i % 5) * 3.5}px`,
                  top:       `${5 + i * 7.5}%`,
                  left:      `${(i % 3) * 18 - 6}%`,
                  transform: `rotate(${i % 2 === 0 ? -0.8 : 0.8}deg)`,
                  fontStyle: "italic",
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* ── Logo + nombre ── */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-9">
              <div
                className="flex items-center justify-center flex-shrink-0 font-bold font-serif"
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: "#2563EB",
                  border: "1px solid #3B82F6",
                  fontSize: 17,
                  color: "white",
                }}
              >
                M
              </div>
              <div>
                <p className="font-serif leading-none" style={{ fontSize: 14, color: "white", letterSpacing: "0.01em" }}>
                  Manthano
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", marginTop: 2 }}>
                  Canvas Matemáticas UC
                </p>
              </div>
            </div>

            {/* Badge */}
            <div
              className="inline-flex items-center"
              style={{
                background:   "rgba(37,99,235,0.18)",
                border:       "0.5px solid rgba(37,99,235,0.38)",
                borderRadius: 20,
                padding:      "3px 11px",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 10, color: "#93C5FD", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Apoyo académico
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-serif leading-snug"
              style={{ fontSize: 28, color: "white", fontWeight: "normal", marginBottom: 12 }}
            >
              Aprende,{" "}
              <em style={{ color: "#60A5FA", fontStyle: "italic" }}>practica</em>
              <br />y domina.
            </h1>

            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, maxWidth: 230 }}>
              Ejercicios interactivos, videos y diapositivas integrados con Canvas UC.
            </p>
          </div>

          {/* ── Pills de recursos + stats ── */}
          <div className="relative z-10">
            {/* Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {RECURSOS.map(({ label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5"
                  style={{
                    background:   "rgba(255,255,255,0.06)",
                    border:       "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                    padding:      "5px 10px",
                    fontSize:     11,
                    color:        "rgba(255,255,255,0.52)",
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  {label}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex-1 text-center"
                  style={{
                    background:   "rgba(255,255,255,0.05)",
                    border:       "0.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding:      "9px 10px",
                  }}
                >
                  <p style={{ fontSize: 15, color: "white", fontWeight: 600, lineHeight: 1 }}>
                    {value}
                  </p>
                  <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel derecho: formulario ────────────────────────────────── */}
        <div
          className="flex items-center justify-center sm:w-[48%]"
          style={{ background: "#FAFBFC", padding: "40px 36px" }}
        >
          <div style={{ width: "100%", maxWidth: 252 }}>

            {/* Dot indicador */}
            <div
              style={{
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#2563EB",
                marginBottom: 20,
              }}
            />

            <h2
              className="font-serif"
              style={{ fontSize: 22, color: "#0F172A", fontWeight: "normal", marginBottom: 6, lineHeight: 1.2 }}
            >
              Bienvenid@
            </h2>
            <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginBottom: 28 }}>
              Usa tu cuenta institucional para acceder a los recursos de tu curso.
            </p>

            {/* Error */}
            {error && (
              <p
                role="alert"
                style={{
                  fontSize: 13, color: "#DC2626",
                  background: "#FEF2F2",
                  border: "0.5px solid #FECACA",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 16,
                }}
              >
                {error}
              </p>
            )}

            {/* Botón Microsoft */}
            <button
              onClick={handleLoginMicrosoft}
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                border: "0.5px solid #E2E8F0",
                borderRadius: 10,
                padding: "11px 16px",
                background: "white",
                color: "#1E293B",
                fontSize: 13.5,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.55 : 1,
                transition: "background 0.15s, border-color 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "white";
              }}
            >
              <MicrosoftIcon />
              {loading ? "Redirigiendo..." : "Iniciar sesión con Microsoft"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#CBD5E1", marginTop: 10 }}>
              Cuenta{" "}
              <span style={{ color: "#94A3B8", fontWeight: 500 }}>@uc.cl</span>
            </p>

            {/* Divisor */}
            <div
              style={{
                margin: "24px 0",
                borderTop: "0.5px solid #F1F5F9",
              }}
            />

            {/* Disclaimer */}
            <div
              className="flex items-start gap-2"
              style={{
                background: "#F8FAFC",
                border: "0.5px solid #EEF2F7",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <span style={{ color: "#CBD5E1" }}>
                <InfoIcon />
              </span>
              <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>
                Plataforma{" "}
                <span style={{ fontWeight: 500, color: "#64748B" }}>no oficial</span>{" "}
                · Apoyo académico independiente. No pertenece a la PUC.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;