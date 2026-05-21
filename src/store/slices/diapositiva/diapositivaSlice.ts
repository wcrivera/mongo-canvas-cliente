import { createSlice } from "@reduxjs/toolkit";
import type { ISlide } from "../../../pages/diapositiva/EditorDiapositiva";

export type ContextoDiapositiva = "clase" | "ayudantia";

export interface ICanvasDeploymentDiapositiva {
  canvas_curso_id:  number;
  canvas_module_id: number | null;
  canvas_file_id:   number | null;
  canvas_page_id:   number | null;
  canvas_page_url:  string;
  canvas_item_id:   number | null;
  status:           "pending" | "synced" | "dirty" | "missing" | "error";
  synced_at:        string | null;
  error_msg:        string;
}

export interface IDiapositiva {
  _id:              string;
  contexto:         ContextoDiapositiva;
  tema_id:          string | null;
  ayudantia_id:     string | null;
  capitulo_id:      string;
  curso_id:         string;
  titulo:           string;
  position:         number;
  published_canvas: boolean;
  published_api:    boolean;
  url:              string;
  slides:           ISlide[] | null;
  html_compilado:   string;
  config:           { tema: string; transicion: string; menu: boolean };
  canvas_deployments: ICanvasDeploymentDiapositiva[];
  createdAt:        string;
  updatedAt:        string;
}

export interface DiapositivaState {
  diapositivas: IDiapositiva[];
  isLoading:    boolean;
  error:        string | null;
}

const initialState: DiapositivaState = {
  diapositivas: [],
  isLoading:    false,
  error:        null,
};

export const diapositivaMongoSlice = createSlice({
  name: "diapositivaMongo",
  initialState,
  reducers: {
    setDiapositivas: (state, action) => {
      state.diapositivas = action.payload;
    },
    agregarDiapositiva: (state, action) => {
      state.diapositivas.push(action.payload);
    },
    actualizarDiapositiva: (state, action) => {
      const idx = state.diapositivas.findIndex((d) => d._id === action.payload._id);
      if (idx !== -1) state.diapositivas[idx] = action.payload;
    },
    eliminarDiapositivaState: (state, action) => {
      state.diapositivas = state.diapositivas.filter((d) => d._id !== action.payload);
    },
    limpiarDiapositivas: (state) => {
      state.diapositivas = [];
    },
    startLoadingDiapositiva: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingDiapositiva: (state) => {
      state.isLoading = false;
    },
    setErrorDiapositiva: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setDiapositivas,
  agregarDiapositiva,
  actualizarDiapositiva,
  eliminarDiapositivaState,
  limpiarDiapositivas,
  startLoadingDiapositiva,
  endLoadingDiapositiva,
  setErrorDiapositiva,
} = diapositivaMongoSlice.actions;