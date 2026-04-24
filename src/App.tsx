import { useEffect } from 'react';
import Router from './router/Router';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { cargarPerfil } from './store/slices/auth/thunks';

const App = () => {
  const dispatch = useAppDispatch();
  const token    = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    // Si hay token (desde sessionStorage), cargar perfil para obtener tiene_token_canvas
    if (token) {
      dispatch(cargarPerfil());
    }
  }, [dispatch, token]);

  return <Router />;
};

export default App;