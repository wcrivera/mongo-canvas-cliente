import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingAyudantia, endLoadingAyudantia, setErrorAyudantia,
  setAyudantias, agregarAyudantia, actualizarAyudantia, intercambiarAyudantias,
} from "./ayudantiaSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerAyudantiasPorCapitulo = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAyudantia());
    try {
      const resp = await fetchConToken(`api/admin/ayudantias/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) { dispatch(setAyudantias(body.data)); dispatch(endLoadingAyudantia()); return { ok: true }; }
      dispatch(setErrorAyudantia(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorAyudantia(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const crearAyudantia = ({
  capitulo_id, nombre, enunciado,
}: {
  capitulo_id: string;
  nombre:      string;
  enunciado:   string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAyudantia());
    try {
      const resp = await fetchConToken("api/admin/ayudantias", { capitulo_id, nombre, enunciado }, "POST");
      const body = await resp.json();
      if (body.ok) { dispatch(agregarAyudantia(body.data)); dispatch(endLoadingAyudantia()); return { ok: true, data: body.data }; }
      dispatch(setErrorAyudantia(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorAyudantia(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const editarAyudantia = ({
  ayudantia_id, nombre, enunciado, published_canvas, published_api,
}: {
  ayudantia_id:      string;
  nombre?:           string;
  enunciado?:        string;
  published_canvas?: boolean;
  published_api?:    boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAyudantia());
    try {
      const resp = await fetchConToken(
        `api/admin/ayudantias/${ayudantia_id}`,
        { nombre, enunciado, published_canvas, published_api },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) { dispatch(actualizarAyudantia(body.data)); dispatch(endLoadingAyudantia()); return { ok: true }; }
      dispatch(setErrorAyudantia(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorAyudantia(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const eliminarAyudantia = ({ ayudantia_id }: { ayudantia_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAyudantia());
    try {
      const resp = await fetchConToken(`api/admin/ayudantias/${ayudantia_id}`, {}, "DELETE");
      const body = await resp.json();
      if (body.ok) { dispatch(setAyudantias(body.data)); dispatch(endLoadingAyudantia()); return { ok: true }; }
      dispatch(setErrorAyudantia(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorAyudantia(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};

export const cambiarPositionAyudantia = ({ ayudantia_id, direction }: { ayudantia_id: string; direction: "up" | "down" }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAyudantia());
    try {
      const resp = await fetchConToken(`api/admin/ayudantias/${ayudantia_id}/position`, { direction }, "PATCH");
      const body = await resp.json();
      if (body.ok) { dispatch(intercambiarAyudantias(body.data)); dispatch(endLoadingAyudantia()); return { ok: true }; }
      dispatch(setErrorAyudantia(body.msg)); return { ok: false, msg: body.msg };
    } catch (error) { console.log(error); dispatch(setErrorAyudantia(MSG_ERROR)); return { ok: false, msg: MSG_ERROR }; }
  };
};