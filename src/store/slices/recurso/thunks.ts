import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import type { TipoRecurso, ContextoRecurso } from "./recursoSlice";
import {
  startLoadingRecurso,
  endLoadingRecurso,
  setErrorRecurso,
  // setRecursos,
  agregarRecurso,
  agregarRecursos,
  eliminarRecursoState,
} from "./recursoSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerRecursosPorCapitulo = ({
  capitulo_id,
  contexto,
}: {
  capitulo_id: string;
  contexto?:   ContextoRecurso;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingRecurso());
    try {
      const query = contexto ? `?contexto=${contexto}` : '';
      const resp  = await fetchConToken(
        `api/recursos/capitulo/${capitulo_id}${query}`
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarRecursos(body.data));
        dispatch(endLoadingRecurso());
        return { ok: true };
      } else {
        dispatch(setErrorRecurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorRecurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerRecursosPorClase = ({
  clase_id,
}: {
  clase_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingRecurso());
    try {
      const resp = await fetchConToken(`api/recursos/clase/${clase_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarRecursos(body.data));
        dispatch(endLoadingRecurso());
        return { ok: true };
      } else {
        dispatch(setErrorRecurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorRecurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerRecursosPorAyudantia = ({
  ayudantia_id,
}: {
  ayudantia_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingRecurso());
    try {
      const resp = await fetchConToken(
        `api/recursos/ayudantia/${ayudantia_id}`
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarRecursos(body.data));
        dispatch(endLoadingRecurso());
        return { ok: true };
      } else {
        dispatch(setErrorRecurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorRecurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerRecursos = ({ tema_id }: { tema_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingRecurso());
    try {
      const resp = await fetchConToken(`api/recursos/tema/${tema_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarRecursos(body.data));
        dispatch(endLoadingRecurso());
        return { ok: true };
      } else {
        dispatch(setErrorRecurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorRecurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearRecurso = ({
  contexto,
  tipo,
  titulo,
  contenido,
  tema_id,
  ayudantia_id,
  ejercicio_id,
}: {
  contexto:      ContextoRecurso;
  tipo:          TipoRecurso;
  titulo:        string;
  contenido?:    string;
  tema_id?:      string;
  ayudantia_id?: string;
  ejercicio_id?: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingRecurso());
    try {
      const resp = await fetchConToken(
        "api/recursos",
        { contexto, tipo, titulo, contenido, tema_id, ayudantia_id, ejercicio_id },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarRecurso(body.data));
        dispatch(endLoadingRecurso());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorRecurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorRecurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const eliminarRecurso = ({ recurso_id }: { recurso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingRecurso());
    try {
      const resp = await fetchConToken(
        `api/recursos/${recurso_id}`,
        {},
        "DELETE"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarRecursoState(recurso_id));
        dispatch(endLoadingRecurso());
        return { ok: true };
      } else {
        dispatch(setErrorRecurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorRecurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};