// src/pages/auth/AuthCallback.tsx
// Esta página recibe el JWT desde el backend tras el login con Microsoft
// y lo guarda en memoria (Redux store), nunca en localStorage

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredenciales } from '../../store/slices/authSlice';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login?error=no_token');
      return;
    }

    // Decodificar JWT para obtener info básica (sin verificar, solo leer)
    const payload = JSON.parse(atob(token.split('.')[1]));

    dispatch(setCredenciales({
      token,
      email: payload.email,
      role:  payload.role,
      id:    payload.id,
    }));

    // Redirigir al inicio
    navigate('/inicio');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Iniciando sesión...</p>
    </div>
  );
};

export default AuthCallback;