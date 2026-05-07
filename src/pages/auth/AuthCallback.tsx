import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredenciales } from "../../store/slices/auth/authSlice";
import { cargarPerfil } from "../../store/slices/auth/thunks";
import type { AppDispatch } from "../../store";

const decodeJWT = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload);
};

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login?error=no_token", { replace: true });
      return;
    }

    const iniciarSesion = async () => {
      try {
        const payload = decodeJWT(token);

        dispatch(
          setCredenciales({
            token,
            email: payload.email,
            role: payload.role,
            id: payload.id,
          }),
        );

        sessionStorage.setItem("auth_token", token);

        // Cargar perfil completo para saber si tiene token Canvas
        await dispatch(cargarPerfil());

        // Redirigir según rol
        const destino = payload.role === "admin" ? "/inicio" : "/plataforma";
        navigate(destino, { replace: true });
      } catch (e) {
        console.error("Error en callback:", e);
        navigate("/login?error=invalid_token", { replace: true });
      }
    };

    iniciarSesion();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Iniciando sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallback;