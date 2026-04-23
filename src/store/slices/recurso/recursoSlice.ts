import { createSlice } from "@reduxjs/toolkit";

export type TipoRecurso     = 'diapositiva' | 'video' | 'quiz';
export type ContextoRecurso = 'clase' | 'ayudantia' | 'ejercicio';

export interface ICanvasDeploymentRecurso {
  canvas_curso_id:  number;
  canvas_id:        number | null;
  canvas_page_url?: string;
  canvas_quiz_id?:  number;
  status:           'pending' | 'synced' | 'dirty' | 'missing' | 'error';
  synced_at:        string | null;
  error_msg:        string;
}

export interface IRecurso {
  _id:                string;
  contexto:           ContextoRecurso;
  tema_id?:           string;
  ayudantia_id?:      string;
  ejercicio_id?:      string;
  clase_id?:          string;
  capitulo_id:        string;
  curso_id:           string;
  tipo:               TipoRecurso;
  titulo:             string;
  contenido?:         string;
  position:           number;
  canvas_deployments: ICanvasDeploymentRecurso[];
  createdAt:          string;
  updatedAt:          string;
}

export interface RecursoState {
  recursos:  IRecurso[];
  isLoading: boolean;
  error:     string | null;
}

const initialState: RecursoState = {
  recursos:  [],
  isLoading: false,
  error:     null,
};

export const recursoMongoSlice = createSlice({
  name: "recursoMongo",
  initialState,
  reducers: {
    setRecursos: (state, action) => {
      state.recursos = action.payload;
    },
    agregarRecurso: (state, action) => {
      state.recursos.push(action.payload);
    },
    agregarRecursos: (state, action) => {
      action.payload.forEach((recurso: IRecurso) => {
        const idx = state.recursos.findIndex(r => r._id === recurso._id);
        if (idx !== -1) {
          state.recursos[idx] = recurso;
        } else {
          state.recursos.push(recurso);
        }
      });
    },
    actualizarRecurso: (state, action) => {
      const idx = state.recursos.findIndex(r => r._id === action.payload._id);
      if (idx !== -1) state.recursos[idx] = action.payload;
    },
    eliminarRecursoState: (state, action) => {
      state.recursos = state.recursos.filter(r => r._id !== action.payload);
    },
    limpiarRecursos: (state) => {
      state.recursos = [];
    },
    startLoadingRecurso: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingRecurso: (state) => {
      state.isLoading = false;
    },
    setErrorRecurso: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setRecursos,
  agregarRecurso,
  agregarRecursos,
  actualizarRecurso,
  eliminarRecursoState,
  limpiarRecursos,
  startLoadingRecurso,
  endLoadingRecurso,
  setErrorRecurso,
} = recursoMongoSlice.actions;