// src/store/slices/diapositiva/thunks.ts
import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingDiapositiva,
  endLoadingDiapositiva,
  setErrorDiapositiva,
  setDiapositivas,
  agregarDiapositiva,
  actualizarDiapositiva,
  eliminarDiapositivaState,
} from "./diapositivaSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

// ─── Obtener por tema ─────────────────────────────────────────────────────────

export const obtenerDiapositivasPorCapitulo = ({
  capitulo_id,
}: {
  capitulo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/capitulo/${capitulo_id}`,
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(setDiapositivas(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerDiapositivasPorTema = ({
  tema_id,
}: {
  tema_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/tema/${tema_id}`,
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(setDiapositivas(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Crear ────────────────────────────────────────────────────────────────────

export const crearDiapositiva = ({
  contexto,
  tema_id,
  ayudantia_id,
  capitulo_id,
  curso_id,
  titulo,
  url,
}: {
  contexto: "clase" | "ayudantia";
  tema_id?: string;
  ayudantia_id?: string;
  capitulo_id: string;
  curso_id: string;
  titulo: string;
  url: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        "api/admin/diapositivas",
        { contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, url },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true, data: body.data };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Editar URL ───────────────────────────────────────────────────────────────

export const editarUrlDiapositiva = ({
  diapositiva_id,
  url,
}: {
  diapositiva_id: string;
  url: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/${diapositiva_id}/url`,
        { url },
        "PATCH",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Editar published_canvas / published_api ──────────────────────────────────

export const editarDiapositiva = ({
  diapositiva_id,
  published_canvas,
  published_api,
}: {
  diapositiva_id: string;
  published_canvas?: boolean;
  published_api?: boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/${diapositiva_id}`,
        { published_canvas, published_api },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export const eliminarDiapositiva = ({
  diapositiva_id,
}: {
  diapositiva_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/${diapositiva_id}`,
        {},
        "DELETE",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarDiapositivaState(diapositiva_id));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Publicar desde editor ────────────────────────────────────────────────────

export const publicarDiapositivaDesdeEditor = ({
  diapositiva_id,
}: {
  diapositiva_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/${diapositiva_id}/publicar`,
        {},
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Reintentar ───────────────────────────────────────────────────────────────

export const reintentarDiapositiva = ({
  diapositiva_id,
  canvas_curso_id,
}: {
  diapositiva_id: string;
  canvas_curso_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingDiapositiva());
    try {
      const resp = await fetchConToken(
        `api/admin/diapositivas/${diapositiva_id}/reintentar/${canvas_curso_id}`,
        {},
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarDiapositiva(body.data));
        dispatch(endLoadingDiapositiva());
        return { ok: true };
      }
      dispatch(setErrorDiapositiva(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorDiapositiva(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};
