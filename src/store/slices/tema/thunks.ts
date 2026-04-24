import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingTema,
  endLoadingTema,
  setErrorTema,
  setTemas,
  agregarTema,
  actualizarTema,
  eliminarTemaState,
} from "./temaSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerTemas = ({ clase_id }: { clase_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingTema());
    try {
      const resp = await fetchConToken(`api/temas/clase/${clase_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setTemas(body.data));
        dispatch(endLoadingTema());
        return { ok: true };
      } else {
        dispatch(setErrorTema(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorTema(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerTemasPorCapitulo = ({
  capitulo_id,
}: {
  capitulo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingTema());
    try {
      const resp = await fetchConToken(`api/temas/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setTemas(body.data));
        dispatch(endLoadingTema());
        return { ok: true };
      } else {
        dispatch(setErrorTema(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorTema(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearTema = ({
  clase_id,
  nombre,
}: {
  clase_id: string;
  nombre: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingTema());
    try {
      const resp = await fetchConToken(
        "api/temas",
        { clase_id, nombre },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarTema(body.data));
        dispatch(endLoadingTema());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorTema(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorTema(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarTema = ({
  tema_id,
  nombre,
}: {
  tema_id: string;
  nombre: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingTema());
    try {
      const resp = await fetchConToken(
        `api/temas/${tema_id}`,
        { nombre },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarTema(body.data));
        dispatch(endLoadingTema());
        return { ok: true };
      } else {
        dispatch(setErrorTema(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorTema(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const eliminarTema = ({ tema_id }: { tema_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingTema());
    try {
      const resp = await fetchConToken(`api/temas/${tema_id}`, {}, "DELETE");
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarTemaState(tema_id));
        dispatch(endLoadingTema());
        return { ok: true };
      } else {
        dispatch(setErrorTema(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorTema(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerTemasPorCurso = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingTema());
    try {
      const resp = await fetchConToken(`api/temas/curso/${curso_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setTemas(body.data));
        dispatch(endLoadingTema());
        return { ok: true };
      } else {
        dispatch(setErrorTema(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorTema(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};
