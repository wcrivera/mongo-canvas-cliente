import { useState } from "react";
import { fetchSinToken } from "../../helpers/fetch";

const FORMULAS = [
  "∫₀^∞ e⁻ˣ dx = 1",
  "ax² + bx + c = 0",
  "eⁱᵖⁱ + 1 = 0",
  "det(A) = ad − bc",
  "lim(h→0) [f(x+h)−f(x)]/h",
  "∇²φ = ρ/ε₀",
  "P(A|B) = P(A)·P(B|A)/P(B)",
  "∑ aₙxⁿ",
  "ℝⁿ → ℝᵐ",
  "∂f/∂x",
];

const STATS = [
  { value: "+1.200", label: "ejercicios" },
  { value: "+300",   label: "videos"     },
  { value: "8",      label: "cursos"     },
];

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
    <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
    <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const BookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const SlidesIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-xl flex flex-col sm:flex-row min-h-[400px]">

        {/* ── Panel izquierdo: branding ── */}
        <div className="relative flex flex-col justify-between bg-[#2563EB] p-10 sm:w-1/2 overflow-hidden">

          {/* Fórmulas decorativas */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            {FORMULAS.map((f, i) => (
              <span
                key={i}
                className="absolute text-white font-serif opacity-[0.07] whitespace-nowrap"
                style={{
                  fontSize: `${13 + (i % 4) * 4}px`,
                  top:  `${8 + i * 9}%`,
                  left: `${(i % 3) * 20 - 5}%`,
                  transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Logo + título */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                <span className="text-white text-lg font-bold font-serif">M</span>
              </div>
              <span className="text-white/65 text-xs font-medium tracking-wide">
                Canvas Matemáticas
              </span>
            </div>

            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2">
              Plataforma de apoyo académico
            </p>
            <h1 className="text-white text-[1.65rem] font-semibold leading-snug mb-3">
              Aprende y practica<br />matemáticas UC
            </h1>
            <p className="text-white/50 text-[13px] leading-relaxed">
              Ejercicios, videos y diapositivas<br />para estudiantes y profesores.
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex gap-2 mt-8">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex-1 bg-white/[0.08] border border-white/[0.14] rounded-xl px-3 py-2 text-center"
              >
                <p className="text-white text-[15px] font-semibold">{value}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho: formulario ── */}
        <div className="bg-white flex items-center justify-center sm:w-1/2 p-10">
          <div className="w-full max-w-[270px]">

            <h2 className="text-[1.25rem] font-semibold text-gray-800 mb-1">
              Bienvenid@
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-8">
              Inicia sesión para acceder a los recursos de tu curso.
            </p>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mb-4" role="alert">
                {error}
              </p>
            )}

            {/* Botón Microsoft */}
            <button
              onClick={handleLoginMicrosoft}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl px-5 py-3 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MicrosoftIcon />
              {loading ? "Redirigiendo..." : "Iniciar sesión con Microsoft"}
            </button>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              Usa tu cuenta institucional{" "}
              <span className="font-medium text-gray-500">@uc.cl</span>
            </p>

            {/* Disclaimer */}
            <div className="mt-7 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                <span className="text-gray-400 mt-0.5 shrink-0">
                  <InfoIcon />
                </span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Plataforma{" "}
                  <span className="font-medium text-gray-500">no oficial</span>{" "}
                  de apoyo académico. No es un sitio de la Pontificia Universidad Católica de Chile.
                </p>
              </div>
            </div>

            {/* Recursos */}
            <div className="mt-5 flex justify-center gap-4">
              {[
                { icon: <BookIcon />,   label: "Ejercicios"   },
                { icon: <PlayIcon />,   label: "Videos"       },
                { icon: <SlidesIcon />, label: "Diapositivas" },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-[11px] text-gray-400"
                >
                  {icon}
                  {label}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import { useState } from "react";
// import { fetchSinToken } from "../../helpers/fetch";

// const Login = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleLoginMicrosoft = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const resp = await fetchSinToken("api/auth/login");
//       const body = await resp.json();
//       if (body.ok) {
//         window.location.href = body.url;
//       } else {
//         setError("No se pudo obtener la URL de login.");
//         setLoading(false);
//       }
//     } catch {
//       setError("No se pudo conectar con el servidor. Intenta nuevamente.");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50">
//       <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
//         {/* Logo */}
//         <div className="mb-8">
//           <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center">
//             <span className="text-white text-2xl font-bold">M</span>
//           </div>
//           <h1 className="text-2xl font-semibold text-gray-800 mt-4">
//             Canvas Matemáticas
//           </h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Plataforma de gestión de contenidos
//           </p>
//         </div>

//         {/* Error */}
//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//         {/* Botón Microsoft */}
//         <button
//           onClick={handleLoginMicrosoft}
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
//         >
//           <svg width="20" height="20" viewBox="0 0 21 21">
//             <rect x="1" y="1" width="9" height="9" fill="#f25022" />
//             <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
//             <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
//             <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
//           </svg>
//           {loading ? "Redirigiendo..." : "Iniciar sesión con Microsoft"}
//         </button>

//         <p className="text-xs text-gray-400 mt-6">
//           Usa tu cuenta institucional @uc.cl
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
