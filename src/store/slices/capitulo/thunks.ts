import { fetchConToken } from "@/helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingCapitulo,
  endLoadingCapitulo,
  setErrorCapitulo,
  setCapitulos,
  agregarCapitulo,
  actualizarCapitulo,
  intercambiarCapitulos,
  setCapituloActivo,
} from "./capituloSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

// ─── Obtener capítulos ────────────────────────────────────────────

export const obtenerCapitulos = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(`api/admin/capitulos/curso/${curso_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setCapitulos(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Obtener capítulos ────────────────────────────────────────────

export const obtenerCapituloActivo = ({
  capitulo_id,
}: {
  capitulo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(`api/admin/capitulos/${capitulo_id}`);
      const body = await resp.json();

      if (body.ok) {
        dispatch(setCapituloActivo(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Crear capítulo ───────────────────────────────────────────────

export const crearCapitulo = ({
  curso_id,
  nombre,
}: {
  curso_id: string;
  nombre: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(
        "api/admin/capitulos",
        { curso_id, nombre },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarCapitulo(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Editar capítulo ──────────────────────────────────────────────

export const editarCapitulo = ({
  capitulo_id,
  nombre,
  published_canvas,
  published_api,
}: {
  capitulo_id: string;
  nombre?: string;
  published_canvas?: boolean;
  published_api?: boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(
        `api/admin/capitulos/${capitulo_id}`,
        { nombre, published_canvas, published_api },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarCapitulo(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Eliminar capítulo ────────────────────────────────────────────

export const eliminarCapitulo = ({ capitulo_id }: { capitulo_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(
        `api/admin/capitulos/${capitulo_id}`,
        {},
        "DELETE",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(setCapitulos(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Reintentar capítulo ──────────────────────────────────────────

export const reintentarCapitulo = ({
  capitulo_id,
  canvas_curso_id,
}: {
  capitulo_id: string;
  canvas_curso_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(
        `api/admin/capitulos/${capitulo_id}/reintentar/${canvas_curso_id}`,
        {},
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarCapitulo(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Desplegar pendiente ──────────────────────────────────────────

export const desplegarPendienteCapitulo = ({
  capitulo_id,
  canvas_curso_id,
}: {
  capitulo_id: string;
  canvas_curso_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(
        `api/admin/capitulos/${capitulo_id}/pendiente/${canvas_curso_id}`,
        {},
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarCapitulo(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Cambiar posición ─────────────────────────────────────────────

export const cambiarPositionCapitulo = ({
  capitulo_id,
  direction,
}: {
  capitulo_id: string;
  direction: "up" | "down";
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCapitulo());
    try {
      const resp = await fetchConToken(
        `api/admin/capitulos/${capitulo_id}/position`,
        { direction },
        "PATCH",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(intercambiarCapitulos(body.data));
        dispatch(endLoadingCapitulo());
        return { ok: true };
      } else {
        dispatch(setErrorCapitulo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCapitulo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};
