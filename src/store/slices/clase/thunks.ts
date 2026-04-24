import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingClase,
  endLoadingClase,
  setErrorClase,
  setClases,
  agregarClase,
  actualizarClase,
  intercambiarClases,
  eliminarClaseState,
} from "./claseSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerClases = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(`api/clases/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setClases(body.data));
        dispatch(endLoadingClase());
        return { ok: true };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearClase = ({
  capitulo_id,
  nombre,
  published,
}: {
  capitulo_id: string;
  nombre:      string;
  published:   boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(
        "api/clases",
        { capitulo_id, nombre, published },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarClase(body.data));
        dispatch(endLoadingClase());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarClase = ({
  clase_id,
  nombre,
  published,
}: {
  clase_id:   string;
  nombre?:    string;
  published?: boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(
        `api/clases/${clase_id}`,
        { nombre, published },
        "PUT"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarClase(body.data));
        dispatch(endLoadingClase());
        return { ok: true };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const eliminarClase = ({ clase_id }: { clase_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(
        `api/clases/${clase_id}`,
        {},
        "DELETE"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarClaseState(clase_id));
        dispatch(endLoadingClase());
        return { ok: true };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const cambiarPositionClase = ({
  clase_id,
  direction,
}: {
  clase_id:  string;
  direction: 'up' | 'down';
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(
        `api/clases/${clase_id}/position`,
        { direction },
        "PATCH"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(intercambiarClases(body.data));
        dispatch(endLoadingClase());
        return { ok: true };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const reintentarClase = ({
  clase_id,
  canvas_curso_id,
}: {
  clase_id:        string;
  canvas_curso_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(
        `api/clases/${clase_id}/reintentar/${canvas_curso_id}`,
        {},
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarClase(body.data));
        dispatch(endLoadingClase());
        return { ok: true };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerClasesPorCurso = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingClase());
    try {
      const resp = await fetchConToken(`api/clases/curso/${curso_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setClases(body.data));
        dispatch(endLoadingClase());
        return { ok: true };
      } else {
        dispatch(setErrorClase(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorClase(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};