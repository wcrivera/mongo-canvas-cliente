import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasDeploymentDiapositiva {
  canvas_curso_id:  number;
  canvas_page_id:   number | null;
  canvas_page_url:  string;
  canvas_item_id:   number | null;
  status:           'pending' | 'synced' | 'dirty' | 'missing' | 'error';
  synced_at:        string | null;
  error_msg:        string;
}

export interface IDiapositiva {
  _id:                string;
  recurso_id:         string;
  tema_id:            string;
  clase_id:           string;
  capitulo_id:        string;
  curso_id:           string;
  url:                string;
  slides:             object[];
  canvas_deployments: ICanvasDeploymentDiapositiva[];
  createdAt:          string;
  updatedAt:          string;
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
      const idx = state.diapositivas.findIndex(
        d => d.recurso_id === action.payload.recurso_id
      );
      if (idx !== -1) {
        state.diapositivas[idx] = action.payload;
      } else {
        state.diapositivas.push(action.payload);
      }
    },
    actualizarDiapositiva: (state, action) => {
      const idx = state.diapositivas.findIndex(d => d._id === action.payload._id);
      if (idx !== -1) state.diapositivas[idx] = action.payload;
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
  limpiarDiapositivas,
  startLoadingDiapositiva,
  endLoadingDiapositiva,
  setErrorDiapositiva,
} = diapositivaMongoSlice.actions;