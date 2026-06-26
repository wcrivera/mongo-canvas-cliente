// src/pages/auth/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredenciales } from "@/store/slices/auth/authSlice";
import { cargarPerfil }    from "@/store/slices/auth/thunks";
import type { AppDispatch } from "@/store";

const decodeJWT = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64    = base64Url.replace(/-/g, "+").replace(/_/g, "/");
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
  const navigate       = useNavigate();
  const dispatch       = useDispatch<AppDispatch>();

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
            role:  payload.role,
            id:    payload.id,
          }),
        );

        sessionStorage.setItem("auth_token", token);

        await dispatch(cargarPerfil());

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
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "100vh",
        background:     "#0A1020",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

        {/* Logo M */}
        <div
          style={{
            width:        40,
            height:       40,
            borderRadius: 11,
            background:   "#2563EB",
            border:       "1px solid #3B82F6",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontSize:     19,
            color:        "white",
            fontFamily:   "Georgia, serif",
            fontWeight:   "bold",
          }}
        >
          M
        </div>

        {/* Spinner */}
        <div
          style={{
            width:        28,
            height:       28,
            borderRadius: "50%",
            border:       "2.5px solid rgba(255,255,255,0.08)",
            borderTop:    "2.5px solid #2563EB",
            animation:    "spin 0.75s linear infinite",
          }}
        />

        {/* Texto */}
        <p
          style={{
            fontSize:   13,
            color:      "rgba(255,255,255,0.35)",
            fontFamily: "-apple-system, sans-serif",
            margin:     0,
          }}
        >
          Iniciando sesión...
        </p>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;