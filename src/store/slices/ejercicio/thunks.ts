import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import type {
  TipoPreguntaEjercicio,
  IOpcionEjercicio,
  IParEjercicio,
  IRespuestaNumericaEjercicio,
} from "./ejercicioSlice";
import {
  startLoadingEjercicio,
  endLoadingEjercicio,
  setErrorEjercicio,
  setEjercicios,
  agregarEjercicio,
  actualizarEjercicio,
  intercambiarEjercicios,
} from "./ejercicioSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

// ─── Obtener ──────────────────────────────────────────────────────────────

export const obtenerEjerciciosPorCapitulo = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(`api/ejercicios/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setEjercicios(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerEjerciciosPorCurso = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(`api/ejercicios/curso/${curso_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setEjercicios(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Crear ────────────────────────────────────────────────────────────────

export const crearEjercicio = ({
  capitulo_id,
  nombre,
  enunciado,
  tipo_pregunta,
  opciones,
  pares,
  respuesta_numerica,
  puntos,
  published_canvas,
  published_api,

}: {
  capitulo_id:         string;
  nombre:              string;
  enunciado:           string;
  tipo_pregunta:       TipoPreguntaEjercicio;
  opciones:            IOpcionEjercicio[];
  pares?:              IParEjercicio[];
  respuesta_numerica?: IRespuestaNumericaEjercicio;
  puntos:              number;
  published_canvas:    boolean;
  published_api:       boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(
        "api/ejercicios",
        {
          capitulo_id, nombre, enunciado, tipo_pregunta,
          opciones,
          pares:              pares ?? [],
          respuesta_numerica: respuesta_numerica ?? null,
          puntos,
          published_canvas,
          published_api,
        },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarEjercicio(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Editar ───────────────────────────────────────────────────────────────

export const editarEjercicio = ({
  ejercicio_id,
  nombre,
  enunciado,
  published_canvas,
  published_api,
  opciones,
  pares,
  respuesta_numerica,
}: {
  ejercicio_id:        string;
  nombre?:             string;
  enunciado?:          string;
  published_canvas?:    boolean;
  published_api?:       boolean;
  opciones?:           IOpcionEjercicio[];
  pares?:              IParEjercicio[];
  respuesta_numerica?: IRespuestaNumericaEjercicio;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(
        `api/ejercicios/${ejercicio_id}`,
        { nombre, enunciado, published_canvas, published_api, opciones, pares, respuesta_numerica },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarEjercicio(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Eliminar ─────────────────────────────────────────────────────────────
// El backend retorna la lista renumerada — usamos setEjercicios para
// actualizar el store completo con las nuevas posiciones.

export const eliminarEjercicio = ({ ejercicio_id }: { ejercicio_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(`api/ejercicios/${ejercicio_id}`, {}, "DELETE");
      const body = await resp.json();
      if (body.ok) {
        dispatch(setEjercicios(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Cambiar posición ─────────────────────────────────────────────────────

export const cambiarPositionEjercicio = ({
  ejercicio_id,
  direction,
}: {
  ejercicio_id: string;
  direction:    "up" | "down";
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(
        `api/ejercicios/${ejercicio_id}/position`,
        { direction },
        "PATCH",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(intercambiarEjercicios(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Reintentar deploy ────────────────────────────────────────────────────

export const reintentarEjercicio = ({
  ejercicio_id,
  canvas_curso_id,
}: {
  ejercicio_id:    string;
  canvas_curso_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingEjercicio());
    try {
      const resp = await fetchConToken(
        `api/ejercicios/${ejercicio_id}/reintentar/${canvas_curso_id}`,
        {},
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarEjercicio(body.data));
        dispatch(endLoadingEjercicio());
        return { ok: true };
      } else {
        dispatch(setErrorEjercicio(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorEjercicio(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};