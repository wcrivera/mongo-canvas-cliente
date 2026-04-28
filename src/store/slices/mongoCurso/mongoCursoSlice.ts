import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasCursoAsociado {
  canvas_id:   number;
  nombre:      string;
  activo:      boolean;
  agregado_at: string;
}

export interface IMongoCurso {
  _id:          string;
  codigo:       string;
  nombre:       string;
  descripcion?: string;
  canvas_cursos: ICanvasCursoAsociado[];
  createdAt:    string;
  updatedAt:    string;
}

export interface MongoCursoState {
  cursos:      IMongoCurso[];
  cursoActivo: IMongoCurso | null;
  isLoading:   boolean;
  error:       string | null;
}

const initialState: MongoCursoState = {
  cursos:      [],
  cursoActivo: null,
  isLoading:   false,
  error:       null,
};

export const mongoCursoSlice = createSlice({
  name: "mongoCurso",
  initialState,
  reducers: {
    setCursos: (state, action) => {
      state.cursos = action.payload;
    },
    setCursoActivo: (state, action) => {
      state.cursoActivo = action.payload;
    },
    agregarCurso: (state, action) => {
      state.cursos.push(action.payload);
    },
    actualizarCurso: (state, action) => {
      state.cursoActivo = action.payload;
      const idx = state.cursos.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) state.cursos[idx] = action.payload;
    },
    eliminarCursoState: (state, action) => {
      state.cursos = state.cursos.filter((c) => c._id !== action.payload);
      if (state.cursoActivo?._id === action.payload) {
        state.cursoActivo = null;
      }
    },
    limpiarCursoActivo: (state) => {
      state.cursoActivo = null;
    },
    startLoadingMongoCurso: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingMongoCurso: (state) => {
      state.isLoading = false;
    },
    setErrorMongoCurso: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setCursos,
  setCursoActivo,
  agregarCurso,
  actualizarCurso,
  eliminarCursoState,
  limpiarCursoActivo,
  startLoadingMongoCurso,
  endLoadingMongoCurso,
  setErrorMongoCurso,
} = mongoCursoSlice.actions;