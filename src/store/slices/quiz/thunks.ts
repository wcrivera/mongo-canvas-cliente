import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import type { TipoPregunta } from "./quizSlice";
import {
  startLoadingQuiz,
  endLoadingQuiz,
  setErrorQuiz,
  setQuizzes,
  agregarQuiz,
  actualizarQuiz,
  setQuizActivo,
  setPreguntas,
  agregarPregunta,
  intercambiarPreguntas,
  eliminarPreguntaState,
} from "./quizSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerQuizzesPorCapitulo = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/quizzes/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setQuizzes(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerQuizPorRecurso = ({ recurso_id }: { recurso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/quizzes/recurso/${recurso_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setQuizActivo(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearQuiz = ({
  recurso_id, titulo, descripcion, tiempo_limite, intentos,
}: {
  recurso_id:     string;
  titulo:         string;
  descripcion?:   string;
  tiempo_limite?: number | null;
  intentos?:      number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        "api/quizzes",
        { recurso_id, titulo, descripcion, tiempo_limite, intentos },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarQuiz(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarQuiz = ({
  quiz_id, titulo, descripcion, tiempo_limite, intentos, publicado,
}: {
  quiz_id:        string;
  titulo?:        string;
  descripcion?:   string;
  tiempo_limite?: number | null;
  intentos?:      number;
  publicado?:     boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/quizzes/${quiz_id}`,
        { titulo, descripcion, tiempo_limite, intentos, publicado },
        "PUT"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarQuiz(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerPreguntas = ({ quiz_id }: { quiz_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(`api/quizzes/${quiz_id}/preguntas`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setPreguntas(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearPregunta = ({
  quiz_id, enunciado, tipo, puntos,
  opciones, pares, respuesta_numerica,
  formula, variables, decimales_resultado,
}: {
  quiz_id:             string;
  enunciado:           string;
  tipo:                TipoPregunta;
  puntos:              number;
  opciones?:           { texto: string; es_correcta: boolean }[];
  pares?:              { izquierda: string; derecha: string }[];
  respuesta_numerica?: {
    tipo:       "exact" | "range" | "precision";
    exacto?:    number;
    margen?:    number;
    minimo?:    number;
    maximo?:    number;
    precision?: number;
  };
  formula?:            string;
  variables?:          { nombre: string; minimo: number; maximo: number; decimales: number }[];
  decimales_resultado?: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/quizzes/${quiz_id}/preguntas`,
        {
          quiz_id, enunciado, tipo, puntos,
          opciones, pares, respuesta_numerica,
          formula, variables, decimales_resultado,
        },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarPregunta(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const eliminarPregunta = ({ pregunta_id }: { pregunta_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/quizzes/preguntas/${pregunta_id}`,
        {},
        "DELETE"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarPreguntaState(pregunta_id));
        dispatch(endLoadingQuiz());
        return { ok: true };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const cambiarPositionPregunta = ({
  pregunta_id, direction,
}: {
  pregunta_id: string;
  direction:   "up" | "down";
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingQuiz());
    try {
      const resp = await fetchConToken(
        `api/quizzes/preguntas/${pregunta_id}/position`,
        { direction },
        "PATCH"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(intercambiarPreguntas(body.data));
        dispatch(endLoadingQuiz());
        return { ok: true };
      } else {
        dispatch(setErrorQuiz(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorQuiz(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};