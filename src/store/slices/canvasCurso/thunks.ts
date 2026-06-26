import { fetchConToken } from "@/helpers/fetch";
import type { AppDispatch } from "../..";

import {
  startLoadingCanvasCurso,
  endLoadingCanvasCurso,
  setErrorCanvasCurso,
  setTodos,
  setDisponibles,
} from "./canvasCursoSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

// ─── Obtener todos los cursos Canvas del profesor ─────────────────

export const obtenerCanvasCursos = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCanvasCurso());
    
    try {
      const resp = await fetchConToken("api/admin/canvas/cursos");
      const body = await resp.json();

      if (body.ok) {
        dispatch(setTodos(body.data));
        dispatch(endLoadingCanvasCurso());
        return { ok: true, msg: "Cursos Canvas cargados" };
      } else {
        dispatch(setErrorCanvasCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCanvasCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Obtener cursos Canvas disponibles para un curso Mongo ────────

export const obtenerCanvasCursosDisponibles = ({
  curso_mongo_id,
}: {
  curso_mongo_id: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingCanvasCurso());
    try {
      const resp = await fetchConToken(
        `api/admin/canvas/cursos/disponibles/${curso_mongo_id}`
      );
      const body = await resp.json();

      if (body.ok) {
        dispatch(setDisponibles(body.data));
        dispatch(endLoadingCanvasCurso());
        return { ok: true, msg: "Cursos disponibles cargados" };
      } else {
        dispatch(setErrorCanvasCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorCanvasCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};