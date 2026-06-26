import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { guardarTokenCanvas } from '@/store/slices/auth/thunks';

const TokenCanvas = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [token, setToken]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!token.trim()) {
      setError('Por favor ingresa tu token Canvas.');
      return;
    }
    setLoading(true);
    setError(null);

    const result = await dispatch(guardarTokenCanvas({ canvas_token: token.trim() }));

    if (result.ok) {
      navigate('/inicio', { replace: true });
    } else {
      setError(result.msg || 'Error al guardar el token.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">
            Configura tu token Canvas
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Para sincronizar tus cursos necesitas ingresar tu token de acceso de Canvas.
          </p>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <p className="font-medium mb-1">¿Cómo obtener tu token?</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Ve a <strong>cursos.canvas.uc.cl</strong></li>
            <li>Haz click en tu perfil → <strong>Configuración</strong></li>
            <li>Baja hasta <strong>Integraciones aprobadas</strong></li>
            <li>Click en <strong>+ Nuevo token de acceso</strong></li>
            <li>Copia el token generado y pégalo aquí</li>
          </ol>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Canvas
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Pega aquí tu token Canvas..."
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Botón */}
        <button
          onClick={handleGuardar}
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-xl px-6 py-3 font-medium hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar token'}
        </button>

      </div>
    </div>
  );
};

export default TokenCanvas;