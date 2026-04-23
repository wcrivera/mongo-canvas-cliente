import { createSlice } from "@reduxjs/toolkit";

export type SyncStatus = "pending" | "synced" | "dirty" | "missing" | "error";

export interface ICanvasDeployment {
  canvas_curso_id: number;
  canvas_id: number | null;
  canvas_url: string;
  status: SyncStatus;
  synced_at: string | null;
  error_msg: string;
}

export interface ICapitulo {
  _id: string;
  curso_id: string;
  nombre: string;
  position: number;
  published: boolean;
  clases_count?: number;
  temas_count?: number;
  canvas_deployments: ICanvasDeployment[];
  createdAt: string;
  updatedAt: string;
}

export interface CapituloState {
  capitulos: ICapitulo[];
  capituloActivo: ICapitulo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CapituloState = {
  capitulos: [],
  capituloActivo: null,
  isLoading: false,
  error: null,
};

export const capituloMongoSlice = createSlice({
  name: "capituloMongo",
  initialState,
  reducers: {
    setCapitulos: (state, action) => {
      state.capitulos = action.payload;
    },
    setCapituloActivo: (state, action) => {
      state.capituloActivo = action.payload;
    },
    agregarCapitulo: (state, action) => {
      state.capitulos.push(action.payload);
    },
    actualizarCapitulo: (state, action) => {
      state.capituloActivo = action.payload;
      const idx = state.capitulos.findIndex(
        (c) => c._id === action.payload._id,
      );
      if (idx !== -1) state.capitulos[idx] = action.payload;
    },
    // Recibe array de dos capítulos intercambiados
    intercambiarCapitulos: (state, action) => {
      action.payload.forEach((cap: ICapitulo) => {
        const idx = state.capitulos.findIndex((c) => c._id === cap._id);
        if (idx !== -1) state.capitulos[idx] = cap;
      });
      // Reordenar el array por position
      state.capitulos.sort((a, b) => a.position - b.position);
    },
    eliminarCapituloState: (state, action) => {
      state.capitulos = state.capitulos.filter((c) => c._id !== action.payload);
      if (state.capituloActivo?._id === action.payload) {
        state.capituloActivo = null;
      }
    },
    limpiarCapitulos: (state) => {
      state.capitulos = [];
      state.capituloActivo = null;
    },
    startLoadingCapitulo: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endLoadingCapitulo: (state) => {
      state.isLoading = false;
    },
    setErrorCapitulo: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setCapitulos,
  setCapituloActivo,
  agregarCapitulo,
  actualizarCapitulo,
  intercambiarCapitulos,
  eliminarCapituloState,
  limpiarCapitulos,
  startLoadingCapitulo,
  endLoadingCapitulo,
  setErrorCapitulo,
} = capituloMongoSlice.actions;
