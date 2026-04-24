import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Inicio from "../pages/inicio/Inicio";
import Capitulos from "../pages/capitulo/Capitulos";
import Clases from "../pages/clases/Clases";
import Quiz from "../pages/quiz/Quiz";
import Ayudantias from "../pages/ayudantia/Ayudantias";
import Ejercicios from "../pages/ejercicios/Ejercicios";
import AuthCallback from "../pages/auth/AuthCallback";
import Login from "../pages/auth/Login";
import TokenCanvas from "../pages/auth/TokenCanvas";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route
          path="/token-canvas"
          element={
            <PrivateRoute requireCanvasToken={false}>
              <TokenCanvas />
            </PrivateRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <Inicio />
            </PrivateRoute>
          }
        />

        <Route
          path="/cursos/:curso_id/capitulos"
          element={
            <PrivateRoute>
              <Capitulos />
            </PrivateRoute>
          }
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases"
          element={
            <PrivateRoute>
              <Clases />
            </PrivateRoute>
          }
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id/quiz/:recurso_id"
          element={
            <PrivateRoute>
              <Quiz />
            </PrivateRoute>
          }
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ayudantias/:ayudantia_id/quiz/:recurso_id"
          element={
            <PrivateRoute>
              <Quiz />
            </PrivateRoute>
          }
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ayudantias"
          element={
            <PrivateRoute>
              <Ayudantias />
            </PrivateRoute>
          }
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ejercicios"
          element={
            <PrivateRoute>
              <Ejercicios />
            </PrivateRoute>
          }
        />

        {/* Redirección */}
        <Route path="/*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
