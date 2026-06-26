import type { SyncStatus } from "@/types/entities";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ICanvasDeploymentClase {
  canvas_curso_id: number;
  canvas_id:       number | null;
  status:          SyncStatus;
  synced_at:       string | null;
  error_msg:       string;
}

export interface IClase {
  _id:                string;
  capitulo_id:        string;
  curso_id:           string;
  nombre:             string;
  position:           number;
  published_canvas:   boolean;
  published_api:      boolean;
  temas_count:        number;
  canvas_deployments: ICanvasDeploymentClase[];
  createdAt:          string;
  updatedAt:          string;
}

export interface ClaseState {
  clases:       IClase[];
  claseActiva:  IClase | null;
  isLoading:    boolean;
  error:        string | null;
}

const initialState: ClaseState = {
  clases:      [],
  claseActiva: null,
  isLoading:   false,
  error:       null,
};

export const claseMongoSlice = createSlice({
  name: "claseMongo",
  initialState,
  reducers: {
    setClases: (state, action: PayloadAction<IClase[]>) => {
      state.clases = action.payload;
    },
    setClaseActiva: (state, action: PayloadAction<IClase | null>) => {
      state.claseActiva = action.payload;
    },
    agregarClase: (state, action: PayloadAction<IClase>) => {
      state.clases.push(action.payload);
    },
    actualizarClase: (state, action: PayloadAction<IClase>) => {
      state.claseActiva = action.payload;
      const idx = state.clases.findIndex(c => c._id === action.payload._id);
      if (idx !== -1) state.clases[idx] = action.payload;
    },
    intercambiarClases: (state, action: PayloadAction<IClase[]>) => {
      state.clases = action.payload;
    },
    eliminarClaseState: (state, action: PayloadAction<string>) => {
      state.clases = state.clases.filter(c => c._id !== action.payload);
      if (state.claseActiva?._id === action.payload) {
        state.claseActiva = null;
      }
    },
    limpiarClases: (state) => {
      state.clases      = [];
      state.claseActiva = null;
    },
    startLoadingClase: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingClase: (state) => {
      state.isLoading = false;
    },
    setErrorClase: (state, action: PayloadAction<string | null>) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setClases,
  setClaseActiva,
  agregarClase,
  actualizarClase,
  intercambiarClases,
  eliminarClaseState,
  limpiarClases,
  startLoadingClase,
  endLoadingClase,
  setErrorClase,
} = claseMongoSlice.actions;