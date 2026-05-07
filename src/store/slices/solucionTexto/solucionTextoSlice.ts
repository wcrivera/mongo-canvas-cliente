import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasDeploymentSolucion {
  canvas_curso_id: number;
  canvas_page_id:  number | null;
  canvas_page_url: string;
  canvas_item_id:  number | null;
  status:          'pending' | 'synced' | 'dirty' | 'missing' | 'error';
  synced_at:       string | null;
  error_msg:       string;
}

export interface ISolucionTexto {
  _id:                string;
  ayudantia_id:       string;
  published_canvas:   boolean;
  published_api:      boolean;
  capitulo_id:        string;
  curso_id:           string;
  texto:              string;
  canvas_deployments: ICanvasDeploymentSolucion[];
  createdAt:          string;
  updatedAt:          string;
}

export interface SolucionTextoState {
  soluciones: ISolucionTexto[];
  isLoading:  boolean;
  error:      string | null;
}

const initialState: SolucionTextoState = {
  soluciones: [],
  isLoading:  false,
  error:      null,
};

export const solucionTextoMongoSlice = createSlice({
  name: "solucionTextoMongo",
  initialState,
  reducers: {
    setSoluciones: (state, action) => {
      state.soluciones = action.payload;
    },
    agregarSolucion: (state, action) => {
      const idx = state.soluciones.findIndex(
        s => s.ayudantia_id === action.payload.ayudantia_id
      );
      if (idx !== -1) {
        state.soluciones[idx] = action.payload;
      } else {
        state.soluciones.push(action.payload);
      }
    },
    eliminarSolucionState: (state, action) => {
      state.soluciones = state.soluciones.filter((s) => s._id !== action.payload);
    },
    actualizarSolucion: (state, action) => {
      const idx = state.soluciones.findIndex(
        s => s._id === action.payload._id
      );
      if (idx !== -1) state.soluciones[idx] = action.payload;
    },
    limpiarSoluciones: (state) => {
      state.soluciones = [];
    },
    startLoadingSolucion: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingSolucion: (state) => {
      state.isLoading = false;
    },
    setErrorSolucion: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setSoluciones,
  agregarSolucion,
  eliminarSolucionState,
  actualizarSolucion,
  limpiarSoluciones,
  startLoadingSolucion,
  endLoadingSolucion,
  setErrorSolucion,
} = solucionTextoMongoSlice.actions;