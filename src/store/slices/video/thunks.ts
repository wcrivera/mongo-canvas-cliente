import { fetchSinToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import {
  startLoadingVideo,
  endLoadingVideo,
  setErrorVideo,
  setVideos,
  agregarVideo,
  actualizarVideo,
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
      const resp = await fetchSinToken(`api/videos/capitulo/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setVideos(body.data));
        dispatch(endLoadingVideo());
        return { ok: true };
      } else {
        dispatch(setErrorVideo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

export const crearVideo = ({
  recurso_id,
  url,
}: {
  recurso_id: string;
  url:        string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchSinToken(
        "api/videos",
        { recurso_id, url },
        "POST"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(agregarVideo(body.data));
        dispatch(endLoadingVideo());
        return { ok: true, data: body.data };
      } else {
        dispatch(setErrorVideo(body.msg));
        return { ok: false, msg: body.msg };
      }
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
  url:      string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingVideo());
    try {
      const resp = await fetchSinToken(
        `api/videos/${video_id}/url`,
        { url },
        "PUT"
      );
      const body = await resp.json();
      if (body.ok) {
        dispatch(actualizarVideo(body.data));
        dispatch(endLoadingVideo());
        return { ok: true };
      } else {
        dispatch(setErrorVideo(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorVideo(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};