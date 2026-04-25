import { createSlice } from "@reduxjs/toolkit";

// ─── Tipos ────────────────────────────────────────────────────────────────
export type TipoPreguntaEjercicio =
  | "multiple_choice"
  | "multiple_answers"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "numerical";

// ─── Interfaces ───────────────────────────────────────────────────────────
export interface IOpcionEjercicio {
  texto:       string;
  es_correcta: boolean;
}

export interface IParEjercicio {
  izquierda: string;
  derecha:   string;
}

export interface IRespuestaNumericaEjercicio {
  tipo:       "exact" | "range" | "precision";
  exacto?:    number;
  margen?:    number;
  minimo?:    number;
  maximo?:    number;
  precision?: number;
}

export interface ICanvasDeploymentEjercicio {
  canvas_curso_id: number;
  canvas_quiz_id:  number | null;
  canvas_item_id:  number | null;
  status:          "pending" | "synced" | "dirty" | "missing" | "error";
  synced_at:       string | null;
  error_msg:       string;
}

export interface IEjercicio {
  _id:                 string;
  capitulo_id:         string;
  curso_id:            string;
  nombre:              string;
  enunciado:           string;
  tipo_pregunta:       TipoPreguntaEjercicio;
  opciones:            IOpcionEjercicio[];
  pares:               IParEjercicio[];
  respuesta_numerica?: IRespuestaNumericaEjercicio;
  puntos:              number;
  position:            number;
  published:           boolean;
  canvas_deployments:  ICanvasDeploymentEjercicio[];
  createdAt:           string;
  updatedAt:           string;
}

export interface EjercicioState {
  ejercicios: IEjercicio[];
  isLoading:  boolean;
  error:      string | null;
}

// ─── Slice ────────────────────────────────────────────────────────────────
const initialState: EjercicioState = {
  ejercicios: [],
  isLoading:  false,
  error:      null,
};

export const ejercicioMongoSlice = createSlice({
  name: "ejercicioMongo",
  initialState,
  reducers: {
    setEjercicios: (state, action) => {
      state.ejercicios = action.payload;
    },
    agregarEjercicio: (state, action) => {
      state.ejercicios.push(action.payload);
    },
    actualizarEjercicio: (state, action) => {
      const idx = state.ejercicios.findIndex(e => e._id === action.payload._id);
      if (idx !== -1) state.ejercicios[idx] = action.payload;
    },
    intercambiarEjercicios: (state, action) => {
      action.payload.forEach((e: IEjercicio) => {
        const idx = state.ejercicios.findIndex(x => x._id === e._id);
        if (idx !== -1) state.ejercicios[idx] = e;
      });
      state.ejercicios.sort((a, b) => a.position - b.position);
    },
    eliminarEjercicioState: (state, action) => {
      state.ejercicios = state.ejercicios.filter(e => e._id !== action.payload);
    },
    limpiarEjercicios: (state) => {
      state.ejercicios = [];
    },
    startLoadingEjercicio: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingEjercicio: (state) => {
      state.isLoading = false;
    },
    setErrorEjercicio: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setEjercicios,
  agregarEjercicio,
  actualizarEjercicio,
  intercambiarEjercicios,
  eliminarEjercicioState,
  limpiarEjercicios,
  startLoadingEjercicio,
  endLoadingEjercicio,
  setErrorEjercicio,
} = ejercicioMongoSlice.actions;