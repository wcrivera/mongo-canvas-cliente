import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingSolucion,
  endLoadingSolucion,
  setErrorSolucion,
  setSoluciones,
  agregarSolucion,
  actualizarSolucion,
  eliminarSolucionState,
} from "./solucionTextoSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerSolucionesPorCapitulo = ({
  capitulo_id,
}: {
  capitulo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingSolucion());
    try {
      const resp = await fetchConToken(
        `api/admin/soluciones-texto/capitulo/${capitulo_id}`
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(setSoluciones(body.data));
        dispatch(endLoadingSolucion());
        return { ok: true };
      } else {
        dispatch(setErrorSolucion(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorSolucion(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearSolucionTexto = ({
  ayudantia_id,
  texto,
}: {
  ayudantia_id: string;
  texto:        string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingSolucion());
    try {
      const resp = await fetchConToken(
        "api/admin/soluciones-texto",
        { ayudantia_id, texto },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarSolucion(body.data));
        dispatch(endLoadingSolucion());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorSolucion(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorSolucion(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarSolucionTexto = ({
  solucion_id,
  texto,
}: {
  solucion_id: string;
  texto:       string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingSolucion());
    try {
      const resp = await fetchConToken(
        `api/admin/soluciones-texto/${solucion_id}`,
        { texto },
        "PUT"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarSolucion(body.data));
        dispatch(endLoadingSolucion());
        return { ok: true };
      } else {
        dispatch(setErrorSolucion(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorSolucion(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const eliminarSolucionTexto = ({ solucion_id }: { solucion_id: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchConToken(`api/admin/soluciones-texto/${solucion_id}`, {}, "DELETE");
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarSolucionState(solucion_id));
        return { ok: true };
      }
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      return { ok: false };
    }
  };
};