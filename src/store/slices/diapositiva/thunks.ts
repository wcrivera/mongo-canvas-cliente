import { fetchSinToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingDiapositiva,
  endLoadingDiapositiva,
  setErrorDiapositiva,
  setDiapositivas,
  agregarDiapositiva,
  actualizarDiapositiva,
} from "./diapositivaSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerDiapositivasPorCapitulo = ({
  capitulo_id,
}: {
  capitulo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchSinToken(
        `api/diapositivas/capitulo/${capitulo_id}`
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(setDiapositivas(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      } else {
        dispatch(setErrorDiapositiva(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearDiapositiva = ({
  recurso_id,
  url,
}: {
  recurso_id: string;
  url:        string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchSinToken(
        "api/diapositivas",
        { recurso_id, url },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorDiapositiva(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarUrlDiapositiva = ({
  diapositiva_id,
  url,
}: {
  diapositiva_id: string;
  url:            string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchSinToken(
        `api/diapositivas/${diapositiva_id}/url`,
        { url },
        "PUT"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      } else {
        dispatch(setErrorDiapositiva(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};