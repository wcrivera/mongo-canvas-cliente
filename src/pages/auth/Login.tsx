import { useState } from "react";
import { fetchSinToken } from "../../helpers/fetch";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">
            Canvas Matemáticas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Plataforma de gestión de contenidos
          </p>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Botón Microsoft */}
        <button
          onClick={handleLoginMicrosoft}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          {loading ? "Redirigiendo..." : "Iniciar sesión con Microsoft"}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Usa tu cuenta institucional @uc.cl
        </p>
      </div>
    </div>
  );
};

export default Login;
