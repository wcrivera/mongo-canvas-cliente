import { fetchConToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";

import {
  startLoadingMongoCurso,
  endLoadingMongoCurso,
  setErrorMongoCurso,
  setCursos,
  setCursoActivo,
  agregarCurso,
  actualizarCurso,
} from "./mongoCursoSlice";

const MSG_ERROR = "Estamos teniendo problemas, vuelva a intentarlo más tarde";

// ─── Obtener todos los cursos Mongo ──────────────────────────────

export const obtenerMongoCursos = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingMongoCurso());
    try {
      const resp = await fetchConToken("api/cursos");
      const body = await resp.json();

      if (body.ok) {
        dispatch(setCursos(body.data));
        dispatch(endLoadingMongoCurso());
        return { ok: true, msg: "Cursos cargados" };
      } else {
        dispatch(setErrorMongoCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorMongoCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Obtener un curso por ID ──────────────────────────────────────

export const obtenerMongoCurso = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingMongoCurso());
    try {
      const resp = await fetchConToken(`api/cursos/${curso_id}`);
      const body = await resp.json();

      if (body.ok) {
        dispatch(setCursoActivo(body.data));
        dispatch(endLoadingMongoCurso());
        return { ok: true, msg: "Curso cargado" };
      } else {
        dispatch(setErrorMongoCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorMongoCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Crear curso en Mongo ─────────────────────────────────────────

export const crearMongoCurso = ({
  codigo,
  nombre,
  descripcion,
}: {
  codigo: string;
  nombre: string;
  descripcion?: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingMongoCurso());
    try {
      const resp = await fetchConToken(
        "api/cursos",
        { codigo, nombre, descripcion },
        "POST"
      );
      const body = await resp.json();

      if (body.ok) {
        dispatch(agregarCurso(body.data));
        dispatch(setCursoActivo(body.data));
        dispatch(endLoadingMongoCurso());
        return { ok: true, msg: "Curso creado", data: body.data };
      } else {
        dispatch(setErrorMongoCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorMongoCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Asociar curso Canvas al curso Mongo ─────────────────────────

export const asociarCanvasCurso = ({
  curso_id,
  canvas_id,
  nombre,
}: {
  curso_id: string;
  canvas_id: number;
  nombre: string;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingMongoCurso());
    try {
      const resp = await fetchConToken(
        `api/cursos/${curso_id}/canvas-cursos`,
        { canvas_id, nombre },
        "POST"
      );
      const body = await resp.json();

      if (body.ok) {
        dispatch(actualizarCurso(body.data));
        dispatch(endLoadingMongoCurso());
        return { ok: true, msg: "Curso Canvas asociado" };
      } else {
        dispatch(setErrorMongoCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorMongoCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Desactivar curso Canvas asociado ────────────────────────────

export const desactivarCanvasCurso = ({
  curso_id,
  canvas_id,
}: {
  curso_id: string;
  canvas_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingMongoCurso());
    try {
      const resp = await fetchConToken(
        `api/cursos/${curso_id}/canvas-cursos/${canvas_id}/desactivar`,
        {},
        "PATCH"
      );
      const body = await resp.json();

      if (body.ok) {
        dispatch(actualizarCurso(body.data));
        dispatch(endLoadingMongoCurso());
        return { ok: true, msg: "Curso Canvas desactivado" };
      } else {
        dispatch(setErrorMongoCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorMongoCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};

// ─── Eliminar curso Canvas asociado ──────────────────────────────

export const eliminarCanvasCurso = ({
  curso_id,
  canvas_id,
}: {
  curso_id: string;
  canvas_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoadingMongoCurso());
    try {
      const resp = await fetchConToken(
        `api/cursos/${curso_id}/canvas-cursos/${canvas_id}`,
        {},
        "DELETE"
      );
      const body = await resp.json();

      if (body.ok) {
        dispatch(actualizarCurso(body.data));
        dispatch(endLoadingMongoCurso());
        return { ok: true, msg: "Curso Canvas eliminado" };
      } else {
        dispatch(setErrorMongoCurso(body.msg));
        return { ok: false, msg: body.msg };
      }
    } catch (error) {
      console.log(error);
      dispatch(setErrorMongoCurso(MSG_ERROR));
      return { ok: false, msg: MSG_ERROR };
    }
  };
};