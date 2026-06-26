import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Navbar from '@/components/Navbar/Navbar';
import { CircularProgress } from '@mui/material';

interface Props {
  children: ReactNode;
  requireCanvasToken?: boolean;
}

const PrivateRoute = ({ children, requireCanvasToken = true }: Props) => {
  const token            = useAppSelector((state) => state.auth.token);
  const tieneTokenCanvas = useAppSelector((state) => state.auth.tiene_token_canvas);
  const perfilCargado    = useAppSelector((state) => state.auth.perfilCargado);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Esperar a que el perfil esté cargado antes de decidir redirección
  if (!perfilCargado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress sx={{ color: '#4A6D8C' }} />
      </div>
    );
  }

  if (requireCanvasToken && !tieneTokenCanvas) {
    return <Navigate to="/token-canvas" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default PrivateRoute;