import { fetchConToken } from '../../../helpers/fetch';
import type { AppDispatch } from '../..';
import {
  startLoadingAuth,
  endLoadingAuth,
  setErrorAuth,
  setPerfil,
  setTieneTokenCanvas,
} from './authSlice';

const MSG_ERROR = 'Estamos teniendo problemas, vuelva a intentarlo más tarde';

// ─── Cargar perfil del usuario autenticado ────────────────────────

export const cargarPerfil = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAuth());
    try {
      const resp = await fetchConToken('api/auth/me');
      const body = await resp.json();

      if (body.ok) {
        dispatch(setPerfil({
          nombre:             body.usuario.nombre,
          tiene_token_canvas: !!body.usuario.canvas_token,
        }));
        dispatch(endLoadingAuth());
        return { ok: true };
      } else {
        dispatch(setErrorAuth(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorAuth(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Guardar token Canvas ─────────────────────────────────────────

export const guardarTokenCanvas = ({ canvas_token }: { canvas_token: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAuth());
    try {
      const resp = await fetchConToken('api/auth/canvas-token', { canvas_token }, 'POST');
      const body = await resp.json();

      if (body.ok) {
        dispatch(setTieneTokenCanvas(true));
        dispatch(endLoadingAuth());
        return { ok: true };
      } else {
        dispatch(setErrorAuth(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorAuth(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Verificar token Canvas ───────────────────────────────────────

export const verificarTokenCanvas = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAuth());
    try {
      const resp = await fetchConToken('api/auth/canvas-token/verificar');
      const body = await resp.json();

      if (body.ok) {
        dispatch(setTieneTokenCanvas(true));
        dispatch(endLoadingAuth());
        return { ok: true, canvas_user: body.canvas_user };
      } else {
        dispatch(setTieneTokenCanvas(false));
        dispatch(endLoadingAuth());
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorAuth(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Eliminar token Canvas ────────────────────────────────────────

export const eliminarTokenCanvas = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingAuth());
    try {
      const resp = await fetchConToken('api/auth/canvas-token', {}, 'DELETE');
      const body = await resp.json();

      if (body.ok) {
        dispatch(setTieneTokenCanvas(false));
        dispatch(endLoadingAuth());
        return { ok: true };
      } else {
        dispatch(setErrorAuth(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorAuth(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};