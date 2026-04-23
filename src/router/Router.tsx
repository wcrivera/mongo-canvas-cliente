import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Inicio from "../pages/inicio/Inicio";
import Capitulos from "../pages/capitulo/Capitulos";
import Clases from "../pages/clases/Clases";
import Quiz from "../pages/quiz/Quiz";
import Ayudantias from "../pages/ayudantia/Ayudantias";
import Ejercicios from "../pages/ejercicios/Ejercicios";
import AuthCallback from "../pages/auth/AuthCallback";
import Login from "../pages/auth/Login";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Inicio */}
        <Route path="/inicio" element={<Inicio />} />

        {/* Capítulo */}
        <Route path="/cursos/:curso_id/capitulos" element={<Capitulos />} />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases"
          element={<Clases />}
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id/quiz/:recurso_id"
          element={<Quiz />}
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ayudantias/:ayudantia_id/quiz/:recurso_id"
          element={<Quiz />}
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ayudantias"
          element={<Ayudantias />}
        />

        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ejercicios"
          element={<Ejercicios />}
        />

        {/* Redirección */}
        <Route path="/*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
