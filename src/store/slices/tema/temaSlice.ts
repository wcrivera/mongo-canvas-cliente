import type { SyncStatus } from "@/types/entities";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ICanvasDeploymentTema {
  canvas_curso_id: number;
  canvas_id:       number | null;
  status:          SyncStatus
  synced_at:       string | null;
  error_msg:       string;
}

export interface ITema {
  _id:                string;
  clase_id:           string;
  capitulo_id:        string;
  curso_id:           string;
  nombre:             string;
  position:           number;
  published_canvas:   boolean;
  published_api:      boolean;
  canvas_deployments: ICanvasDeploymentTema[];
  createdAt:          string;
  updatedAt:          string;
}

export interface TemaState {
  temas:     ITema[];
  isLoading: boolean;
  error:     string | null;
}

const initialState: TemaState = {
  temas:     [],
  isLoading: false,
  error:     null,
};

export const temaMongoSlice = createSlice({
  name: "temaMongo",
  initialState,
  reducers: {
    setTemas: (state, action: PayloadAction<ITema[]>) => {
      state.temas = action.payload;
    },
    agregarTema: (state, action: PayloadAction<ITema>) => {
      state.temas.push(action.payload);
    },
    actualizarTema: (state, action: PayloadAction<ITema>) => {
      const idx = state.temas.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.temas[idx] = action.payload;
    },
    // Usado al eliminar — reemplaza la lista completa con posiciones renumeradas
    eliminarTemaState: (state, action: PayloadAction<string>) => {
      state.temas = state.temas.filter((t) => t._id !== action.payload);
    },
    // Usado al cambiar posición — actualiza posiciones de los afectados
    intercambiarTemas: (state, action: PayloadAction<ITema[]>) => {
      state.temas = action.payload;
    },
    limpiarTemas: (state) => {
      state.temas = [];
    },
    startLoadingTema: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingTema: (state) => {
      state.isLoading = false;
    },
    setErrorTema: (state, action: PayloadAction<string | null>) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setTemas,
  agregarTema,
  actualizarTema,
  eliminarTemaState,
  intercambiarTemas,
  limpiarTemas,
  startLoadingTema,
  endLoadingTema,
  setErrorTema,
} = temaMongoSlice.actions;