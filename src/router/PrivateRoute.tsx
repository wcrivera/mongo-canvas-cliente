import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface Props {
  children: ReactNode;
  requireCanvasToken?: boolean;
}

const PrivateRoute = ({ children, requireCanvasToken = true }: Props) => {
  const token             = useAppSelector((state) => state.auth.token);
  const tieneTokenCanvas  = useAppSelector((state) => state.auth.tiene_token_canvas);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireCanvasToken && !tieneTokenCanvas) {
    return <Navigate to="/token-canvas" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;