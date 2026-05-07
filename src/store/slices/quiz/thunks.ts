// src/store/slices/quiz/thunks.ts
import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import type { TipoPregunta } from "./quizSlice";
import {
  startLoadingQuiz, endLoadingQuiz, setErrorQuiz,
  setQuizzes, agregarQuiz, actualizarQuiz, eliminarQuizState,
  setQuizActivo, setPreguntas, agregarPregunta,
  intercambiarPreguntas, eliminarPreguntaState, actualizarPreguntaState,
} from "./quizSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

// ─── Obtener ──────────────────────────────────────────────────────────────────

export const obtenerQuizzesPorCapitulo = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) { dispatch(setQuizzes(body.data)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const obtenerQuizPorTema = ({ tema_id }: { tema_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/tema/${tema_id}`);
      const body = await resp.json();
      if (body.ok) { dispatch(setQuizActivo(body.data)); dispatch(endLoadingQuiz()); return { ok: true, data: body.data }; }
      if (resp.status === 404) { dispatch(setQuizActivo(null)); dispatch(endLoadingQuiz()); return { ok: false }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const obtenerEjercicios = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/ejercicios/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) { dispatch(setQuizzes(body.data)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const obtenerPreguntas = ({ quiz_id }: { quiz_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/${quiz_id}/preguntas`);
      const body = await resp.json();
      if (body.ok) { dispatch(setPreguntas(body.data)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

// ─── Crear ────────────────────────────────────────────────────────────────────

export const crearQuiz = ({
  contexto, tema_id, ayudantia_id, capitulo_id, curso_id,
  titulo, descripcion, tiempo_limite, intentos, umbral_aprobacion,
}: {
  contexto:           "clase" | "ayudantia" | "ejercicio";
  tema_id?:           string;
  ayudantia_id?:      string;
  capitulo_id:        string;
  curso_id:           string;
  titulo:             string;
  descripcion?:       string;
  tiempo_limite?:     number | null;
  intentos?:          number;
  umbral_aprobacion?: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        "api/admin/quizzes",
        { contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, descripcion, tiempo_limite, intentos, umbral_aprobacion },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) { dispatch(agregarQuiz(body.data)); dispatch(endLoadingQuiz()); return { ok: true, data: body.data }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

// ─── Editar ───────────────────────────────────────────────────────────────────

export const editarQuiz = ({
  quiz_id, titulo, descripcion, tiempo_limite, intentos,
  umbral_aprobacion, published_canvas, published_api,
}: {
  quiz_id:            string;
  titulo?:            string;
  descripcion?:       string;
  tiempo_limite?:     number | null;
  intentos?:          number;
  umbral_aprobacion?: number;
  published_canvas?:  boolean;
  published_api?:     boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/admin/quizzes/${quiz_id}`,
        { titulo, descripcion, tiempo_limite, intentos, umbral_aprobacion, published_canvas, published_api },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) { dispatch(actualizarQuiz(body.data)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export const eliminarQuiz = ({ quiz_id }: { quiz_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/${quiz_id}`, {}, "DELETE");
      const body = await resp.json();
      if (body.ok) { dispatch(eliminarQuizState(quiz_id)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

// ─── Preguntas ────────────────────────────────────────────────────────────────

export const crearPregunta = ({
  quiz_id, enunciado, tipo, puntos, tipo_pimu, respuesta_lti,
  opciones, pares, respuesta_numerica, formula, variables, decimales_resultado,
}: {
  quiz_id:             string;
  enunciado:           string;
  tipo:                TipoPregunta;
  puntos:              number;
  tipo_pimu?:          string | null;
  respuesta_lti?:      string | null;
  opciones?:           { texto: string; es_correcta: boolean; blank_id?: string | null }[];
  pares?:              { izquierda: string; derecha: string }[];
  respuesta_numerica?: { tipo: "exact" | "range" | "precision"; exacto?: number; margen?: number; minimo?: number; maximo?: number; precision?: number };
  formula?:            string;
  variables?:          { nombre: string; minimo: number; maximo: number; decimales: number }[];
  decimales_resultado?: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/admin/quizzes/${quiz_id}/preguntas`,
        { quiz_id, enunciado, tipo, puntos, tipo_pimu, respuesta_lti, opciones, pares, respuesta_numerica, formula, variables, decimales_resultado },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) { dispatch(agregarPregunta(body.data)); dispatch(endLoadingQuiz()); return { ok: true, data: body.data }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const editarPregunta = ({
  pregunta_id, enunciado, puntos, tipo_pimu, respuesta_lti,
  opciones, pares, respuesta_numerica,
}: {
  pregunta_id:         string;
  enunciado?:          string;
  puntos?:             number;
  tipo_pimu?:          string | null;
  respuesta_lti?:      string | null;
  opciones?:           { texto: string; es_correcta: boolean; blank_id?: string | null }[];
  pares?:              { izquierda: string; derecha: string }[];
  respuesta_numerica?: { tipo: "exact" | "range" | "precision"; exacto?: number; margen?: number; minimo?: number; maximo?: number; precision?: number };
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/admin/quizzes/preguntas/${pregunta_id}`,
        { enunciado, puntos, tipo_pimu, respuesta_lti, opciones, pares, respuesta_numerica },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) { dispatch(actualizarPreguntaState(body.data)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const eliminarPregunta = ({ pregunta_id }: { pregunta_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/preguntas/${pregunta_id}`, {}, "DELETE");
      const body = await resp.json();
      if (body.ok) { dispatch(eliminarPreguntaState(pregunta_id)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const cambiarPositionPregunta = ({ pregunta_id, direction }: { pregunta_id: string; direction: "up" | "down" }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/admin/quizzes/preguntas/${pregunta_id}/position`, { direction }, "PATCH");
      const body = await resp.json();
      if (body.ok) { dispatch(intercambiarPreguntas(body.data)); dispatch(endLoadingQuiz()); return { ok: true }; }
      dispatch(setErrorQuiz(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorQuiz(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};