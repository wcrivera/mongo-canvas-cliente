import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasDeploymentAyudantia {
  canvas_curso_id: number;
  canvas_page_id:  number | null;
  canvas_page_url: string;
  canvas_item_id:  number | null;
  status:          'pending' | 'synced' | 'dirty' | 'missing' | 'error';
  synced_at:       string | null;
  error_msg:       string;
}

export interface IAyudantia {
  _id:                string;
  capitulo_id:        string;
  curso_id:           string;
  nombre:             string;
  enunciado:          string;
  position:           number;
  published:          boolean;
  canvas_deployments: ICanvasDeploymentAyudantia[];
  createdAt:          string;
  updatedAt:          string;
}

export interface AyudantiaState {
  ayudantias:  IAyudantia[];
  isLoading:   boolean;
  error:       string | null;
}

const initialState: AyudantiaState = {
  ayudantias: [],
  isLoading:  false,
  error:      null,
};

export const ayudantiaMongoSlice = createSlice({
  name: "ayudantiaMongo",
  initialState,
  reducers: {
    setAyudantias: (state, action) => {
      state.ayudantias = action.payload;
    },
    agregarAyudantia: (state, action) => {
      state.ayudantias.push(action.payload);
    },
    actualizarAyudantia: (state, action) => {
      const idx = state.ayudantias.findIndex(
        a => a._id === action.payload._id
      );
      if (idx !== -1) state.ayudantias[idx] = action.payload;
    },
    intercambiarAyudantias: (state, action) => {
      action.payload.forEach((a: IAyudantia) => {
        const idx = state.ayudantias.findIndex(x => x._id === a._id);
        if (idx !== -1) state.ayudantias[idx] = a;
      });
      state.ayudantias.sort((a, b) => a.position - b.position);
    },
    eliminarAyudantiaState: (state, action) => {
      state.ayudantias = state.ayudantias.filter(
        a => a._id !== action.payload
      );
    },
    limpiarAyudantias: (state) => {
      state.ayudantias = [];
    },
    startLoadingAyudantia: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingAyudantia: (state) => {
      state.isLoading = false;
    },
    setErrorAyudantia: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setAyudantias,
  agregarAyudantia,
  actualizarAyudantia,
  intercambiarAyudantias,
  eliminarAyudantiaState,
  limpiarAyudantias,
  startLoadingAyudantia,
  endLoadingAyudantia,
  setErrorAyudantia,
} = ayudantiaMongoSlice.actions;