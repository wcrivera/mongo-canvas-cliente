// src/store/slices/video/thunks.ts
import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingVideo,
  endLoadingVideo,
  setErrorVideo,
  setVideos,
  agregarVideo,
  actualizarVideo,
  eliminarVideoState,
} from "./videoSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerVideosPorCapitulo = ({
  capitulo_id,
}: {
  capitulo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchConToken(
        `api/admin/videos/capitulo/${capitulo_id}`,
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(setVideos(body.data));
        dispatch(endLoadingVideo());
        return { ok: true };
      }
      dispatch(setErrorVideo(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const obtenerVideosPorTema = ({ tema_id }: { tema_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchConToken(`api/admin/videos/tema/${tema_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setVideos(body.data));
        dispatch(endLoadingVideo());
        return { ok: true };
      }
      dispatch(setErrorVideo(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearVideo = ({
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
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchConToken(
        "api/admin/videos",
        { contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, url },
        "POST",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarVideo(body.data));
        dispatch(endLoadingVideo());
        return { ok: true, data: body.data };
      }
      dispatch(setErrorVideo(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarUrlVideo = ({
  video_id,
  url,
}: {
  video_id: string;
  url: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchConToken(
        `api/admin/videos/${video_id}/url`,
        { url },
        "PATCH",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarVideo(body.data));
        dispatch(endLoadingVideo());
        return { ok: true };
      }
      dispatch(setErrorVideo(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const editarVideo = ({
  video_id,
  published_canvas,
  published_api,
}: {
  video_id: string;
  published_canvas?: boolean;
  published_api?: boolean;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchConToken(
        `api/admin/videos/${video_id}`,
        { published_canvas, published_api },
        "PUT",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarVideo(body.data));
        dispatch(endLoadingVideo());
        return { ok: true };
      }
      dispatch(setErrorVideo(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const eliminarVideo = ({ video_id }: { video_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchConToken(
        `api/admin/videos/${video_id}`,
        {},
        "DELETE",
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(eliminarVideoState(video_id));
        dispatch(endLoadingVideo());
        return { ok: true };
      }
      dispatch(setErrorVideo(body.msg));
      return { ok: false, msg: body.msg };
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};
