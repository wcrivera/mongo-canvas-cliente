// src/router/Router.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute      from "./PrivateRoute";
import AdminRoute        from "./AdminRoute";
import Inicio            from "../pages/inicio/Inicio";
import Plataforma          from "../pages/plataforma/Plataforma";
import CapitulosPlataforma from "../pages/plataforma/CapitulosPlataforma";
import CapituloPlataforma  from "../pages/plataforma/CapituloPlataforma";
import ClasePlataforma     from "../pages/plataforma/ClasePlataforma";
import AyudantiaPlataforma from "../pages/plataforma/AyudantiaPlataforma";
import EjercicioPlataforma from "../pages/plataforma/EjercicioPlataforma";
import QuizPlataforma      from "../pages/plataforma/QuizPlataforma";
import Capitulos         from "../pages/capitulo/Capitulos";
import Clases            from "../pages/clases/Clases";
import Quiz              from "../pages/quiz/Quiz";
import Ayudantias        from "../pages/ayudantia/Ayudantias";
import Ejercicios        from "../pages/ejercicios/Ejercicios";
import EditorDiapositiva from "../pages/diapositiva/EditorDiapositiva";
import AuthCallback      from "../pages/auth/AuthCallback";
import Login             from "../pages/auth/Login";
import TokenCanvas       from "../pages/auth/TokenCanvas";
import TestEditor        from "../pages/test/TestEditor";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas públicas ─────────────────────────────────────────────── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Token Canvas: cualquier autenticado */}
        <Route
          path="/token-canvas"
          element={
            <PrivateRoute requireCanvasToken={false}>
              <TokenCanvas />
            </PrivateRoute>
          }
        />

        {/* ── Rutas de plataforma (cualquier rol autenticado) ────────────── */}
        <Route path="/plataforma"
          element={<PrivateRoute requireCanvasToken={false}><Plataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id"
          element={<PrivateRoute requireCanvasToken={false}><CapitulosPlataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id/capitulos/:capitulo_id"
          element={<PrivateRoute requireCanvasToken={false}><CapituloPlataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id"
          element={<PrivateRoute requireCanvasToken={false}><ClasePlataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id/quiz/:recurso_id"
          element={<PrivateRoute requireCanvasToken={false}><QuizPlataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id/capitulos/:capitulo_id/ayudantias/:ayudantia_id"
          element={<PrivateRoute requireCanvasToken={false}><AyudantiaPlataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id/capitulos/:capitulo_id/ayudantias/:ayudantia_id/quiz/:recurso_id"
          element={<PrivateRoute requireCanvasToken={false}><QuizPlataforma /></PrivateRoute>} />
        <Route path="/plataforma/cursos/:curso_id/capitulos/:capitulo_id/ejercicios/:ejercicio_id"
          element={<PrivateRoute requireCanvasToken={false}><EjercicioPlataforma /></PrivateRoute>} />

        {/* ── Rutas de admin ─────────────────────────────────────────────── */}
        <Route
          path="/inicio"
          element={<AdminRoute><Inicio /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos"
          element={<AdminRoute><Capitulos /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases"
          element={<AdminRoute><Clases /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id/quiz/:recurso_id"
          element={<AdminRoute><Quiz /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ayudantias/:ayudantia_id/quiz/:recurso_id"
          element={<AdminRoute><Quiz /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ejercicios/quiz/:recurso_id"
          element={<AdminRoute><Quiz /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/clases/:clase_id/diapositiva/:recurso_id"
          element={<AdminRoute><EditorDiapositiva /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ayudantias"
          element={<AdminRoute><Ayudantias /></AdminRoute>}
        />
        <Route
          path="/cursos/:curso_id/capitulos/:capitulo_id/ejercicios"
          element={<AdminRoute><Ejercicios /></AdminRoute>}
        />
        <Route
          path="/inicio/test-editor"
          element={<AdminRoute><TestEditor /></AdminRoute>}
        />

        {/* ── Redirección por defecto ───────────────────────────────────── */}
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;