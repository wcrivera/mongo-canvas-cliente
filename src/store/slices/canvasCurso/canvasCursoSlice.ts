import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasCursoDisponible {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  created_at: string;
  start_at: string | null;
  end_at: string | null;
}

export interface CanvasCursoState {
  todos: ICanvasCursoDisponible[];
  disponibles: ICanvasCursoDisponible[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CanvasCursoState = {
  todos: [],
  disponibles: [],
  isLoading: false,
  error: null,
};

export const canvasCursoSlice = createSlice({
  name: "canvasCurso",
  initialState,
  reducers: {
    setTodos: (state, action) => {
      state.todos = action.payload;
    },
    setDisponibles: (state, action) => {
      state.disponibles = action.payload;
    },
    limpiarDisponibles: (state) => {
      state.disponibles = [];
    },
    startLoadingCanvasCurso: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endLoadingCanvasCurso: (state) => {
      state.isLoading = false;
    },
    setErrorCanvasCurso: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setTodos,
  setDisponibles,
  limpiarDisponibles,
  startLoadingCanvasCurso,
  endLoadingCanvasCurso,
  setErrorCanvasCurso,
} = canvasCursoSlice.actions;
