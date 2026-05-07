// src/router/AdminRoute.tsx
// Protege rutas que requieren rol "admin".
// Redirige a /inicio si el usuario está autenticado pero no es admin.
// Redirige a /login si no hay sesión.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Navbar from '../components/Navbar/Navbar';
import { CircularProgress } from '@mui/material';

interface Props {
  children: ReactNode;
}

const AdminRoute = ({ children }: Props) => {
  const token         = useAppSelector((state) => state.auth.token);
  const role          = useAppSelector((state) => state.auth.role);
  const perfilCargado = useAppSelector((state) => state.auth.perfilCargado);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Esperar a que el perfil esté cargado antes de decidir
  if (!perfilCargado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress sx={{ color: '#4A6D8C' }} />
      </div>
    );
  }

  if (role !== 'admin') {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default AdminRoute;