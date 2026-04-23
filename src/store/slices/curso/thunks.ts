import { fetchSinToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";

import { endLoadingCurso, setCurso, setCursos } from "./cursoSlice";

export const obtenerCursos = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchSinToken(`curso/obtener`);
      const body = await resp.json();

      if (body.ok) {
        const { cursos } = body;
        dispatch(setCursos(cursos));
        dispatch(endLoadingCurso());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingCurso());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingCurso());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

export const obtenerCurso = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchSinToken(`curso/obtener/${curso_id}`);
      const body = await resp.json();

      if (body.ok) {
        const { curso } = body;
        dispatch(setCurso(curso));
        dispatch(endLoadingCurso());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingCurso());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingCurso());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};
