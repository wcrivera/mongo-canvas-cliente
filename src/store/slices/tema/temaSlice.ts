import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasDeploymentTema {
  canvas_curso_id: number;
  canvas_id:       number | null;
  status:          "pending" | "synced" | "dirty" | "missing" | "error";
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
  published:          boolean;   // ← nuevo
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
    setTemas: (state, action) => {
      state.temas = action.payload;
    },
    agregarTema: (state, action) => {
      state.temas.push(action.payload);
    },
    actualizarTema: (state, action) => {
      const idx = state.temas.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.temas[idx] = action.payload;
    },
    // Usado al eliminar — reemplaza la lista completa con posiciones renumeradas
    eliminarTemaState: (state, action) => {
      state.temas = state.temas.filter((t) => t._id !== action.payload);
    },
    // Usado al cambiar posición — actualiza posiciones de los afectados
    intercambiarTemas: (state, action) => {
      action.payload.forEach((tema: ITema) => {
        const idx = state.temas.findIndex((t) => t._id === tema._id);
        if (idx !== -1) state.temas[idx] = tema;
      });
      state.temas.sort((a, b) => a.position - b.position);
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
    setErrorTema: (state, action) => {
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