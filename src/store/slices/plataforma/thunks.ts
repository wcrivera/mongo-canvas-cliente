import { fetchConToken } from "@/helpers/fetch";
import type { AppDispatch } from "@/..";
import {
  startLoading, endLoading, setError,
  setCursos, setCapitulos, setClases, setAyudantias, setEjercicios, setTemas,
} from "./plataformaSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

export const obtenerCursosPlataforma = () => async (dispatch: AppDispatch) => {
  dispatch(startLoading());
  try {
    const resp = await fetchConToken("api/plataforma/cursos");
    const body = await resp.json();
    if (body.ok) { dispatch(setCursos(body.data)); dispatch(endLoading()); return { ok: true }; }
    dispatch(setError(body.msg)); return { ok: false };
  } catch { dispatch(setError(MSG_ERROR)); return { ok: false }; }
};

export const obtenerCapitulosPlataforma = ({ curso_id }: { curso_id: string }) =>
  async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const resp = await fetchConToken(`api/plataforma/cursos/${curso_id}/capitulos`);
      const body = await resp.json();
      if (body.ok) { dispatch(setCapitulos(body.data)); dispatch(endLoading()); return { ok: true }; }
      dispatch(setError(body.msg)); return { ok: false };
    } catch { dispatch(setError(MSG_ERROR)); return { ok: false }; }
  };

export const obtenerCapituloPlataforma = ({ capitulo_id }: { capitulo_id: string }) =>
  async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const resp = await fetchConToken(`api/plataforma/capitulos/${capitulo_id}`);
      const body = await resp.json();
      if (body.ok) {
        dispatch(setClases(body.data.clases));
        dispatch(setAyudantias(body.data.ayudantias));
        dispatch(setEjercicios(body.data.ejercicios));
        dispatch(endLoading());
        return { ok: true };
      }
      dispatch(setError(body.msg)); return { ok: false };
    } catch { dispatch(setError(MSG_ERROR)); return { ok: false }; }
  };

export const obtenerClasePlataforma = ({ clase_id }: { clase_id: string }) =>
  async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const resp = await fetchConToken(`api/plataforma/clases/${clase_id}`);
      const body = await resp.json();
      if (body.ok) { dispatch(setTemas(body.data)); dispatch(endLoading()); return { ok: true }; }
      dispatch(setError(body.msg)); return { ok: false };
    } catch { dispatch(setError(MSG_ERROR)); return { ok: false }; }
  };