// src/store/slices/quiz/quizSlice.ts
import type { SyncStatus } from "@/types/entities";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ContextoQuiz = "clase" | "ayudantia" | "ejercicio";

export type TipoPregunta =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay"
  | "multiple_answers"
  | "matching"
  | "numerical"
  | "calculated"
  | "fill_in_multiple_blanks"
  | "multiple_dropdowns"
  | "text_only_question";

export interface ICanvasDeploymentQuiz {
  canvas_curso_id: number;
  canvas_module_id: number | null;
  canvas_quiz_id: number | null;
  canvas_item_id: number | null;
  status: SyncStatus
  synced_at: string | null;
  error_msg: string;
}

export interface IOpcion {
  _id: string;
  texto: string;
  es_correcta: boolean;
  blank_id?: string | null;
  tipo_pimu?: string | null;
  canvas_id?: number;
}

export interface IParCoincidencia {
  _id: string;
  izquierda: string;
  derecha: string;
}

export interface IRespuestaNumerica {
  tipo: "exact" | "range" | "precision";
  exacto?: number;
  margen?: number;
  minimo?: number;
  maximo?: number;
  precision?: number;
}

export interface IVariableFormula {
  nombre: string;
  minimo: number;
  maximo: number;
  decimales: number;
}

// ── Ítem individual de fill_in_multiple_blanks ────────────────────────────────
export interface IItemFIB {
  id: string; // "blanco1", "blanco2", ...
  enunciado: string; // enunciado del sub-ítem (vacío si = enunciado_contexto)
  respuesta: string; // respuesta esperada
  tipo_pimu: string; // tipo de validación LTI
}

export interface IPregunta {
  _id: string;
  quiz_id: string;
  capitulo_id: string;
  curso_id: string;
  enunciado: string;
  // ── Campos FIB ────────────────────────────────────────────────────────────
  enunciado_contexto: string;
  items: IItemFIB[];
  columnas: number;
  // ─────────────────────────────────────────────────────────────────────────
  tipo: TipoPregunta;
  tipo_pimu?: string | null;
  respuesta_lti?: string | null;
  puntos: number;
  position: number;
  opciones: IOpcion[];
  pares: IParCoincidencia[];
  respuesta_numerica?: IRespuestaNumerica;
  formula?: string;
  variables?: IVariableFormula[];
  decimales_resultado?: number;
  canvas_ids: { canvas_curso_id: number; canvas_question_id: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface IQuiz {
  _id: string;
  contexto: ContextoQuiz;
  tema_id: string | null;
  ayudantia_id: string | null;
  capitulo_id: string;
  curso_id: string;
  titulo: string;
  descripcion: string;
  tiempo_limite: number | null;
  intentos: number;
  umbral_aprobacion: number;
  position: number;
  published_canvas: boolean;
  published_api: boolean;
  canvas_deployments: ICanvasDeploymentQuiz[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizState {
  quizzes: IQuiz[];
  quizActivo: IQuiz | null;
  preguntas: IPregunta[];
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  quizActivo: null,
  preguntas: [],
  isLoading: false,
  error: null,
};

export const quizMongoSlice = createSlice({
  name: "quizMongo",
  initialState,
  reducers: {
    setQuizzes: (state, action: PayloadAction<IQuiz | IQuiz[]>) => {
      // Upsert por _id: para cada quiz que llega, reemplaza si ya existe,
      // agrega si no existe. No borra nada que no esté en el payload.
      const nuevos: IQuiz[] = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      const nuevosIds = new Set(nuevos.map((q) => q._id));
      // Mantener los que NO vienen en el payload + reemplazar los que sí vienen
      state.quizzes = [
        ...state.quizzes.filter((q) => !nuevosIds.has(q._id)),
        ...nuevos,
      ];
    },
    agregarQuiz: (state, action: PayloadAction<IQuiz>) => {
      state.quizzes.push(action.payload);
    },
    actualizarQuiz: (state, action: PayloadAction<IQuiz>) => {
      const idx = state.quizzes.findIndex((q) => q._id === action.payload._id);
      if (idx !== -1) state.quizzes[idx] = action.payload;
      if (state.quizActivo?._id === action.payload._id)
        state.quizActivo = action.payload;
    },
    eliminarQuizState: (state, action: PayloadAction<string>) => {
      state.quizzes = state.quizzes.filter((q) => q._id !== action.payload);
      if (state.quizActivo?._id === action.payload) state.quizActivo = null;
    },
    setQuizActivo: (state, action: PayloadAction<IQuiz | null>) => {
      state.quizActivo = action.payload;
    },
    limpiarQuizActivo: (state) => {
      state.quizActivo = null;
      state.preguntas = [];
    },
    limpiarQuizzes: (state) => {
      state.quizzes = [];
      state.preguntas = [];
    },
    setPreguntas: (state, action: PayloadAction<IPregunta[]>) => {
      // action.payload = IPregunta[] de un quiz específico
      // Hacer upsert: reemplazar las de ese quiz_id, mantener las demás
      const nuevas: IPregunta[] = action.payload;
      if (nuevas.length === 0) return;
      const quiz_id = nuevas[0].quiz_id;
      // Eliminar las existentes de ese quiz y agregar las nuevas
      state.preguntas = [
        ...state.preguntas.filter((p) => p.quiz_id !== quiz_id),
        ...nuevas,
      ];
    },
    agregarPregunta: (state, action: PayloadAction<IPregunta>) => {
      state.preguntas.push(action.payload);
    },
    actualizarPreguntaState: (
      state,
      action: PayloadAction<IPregunta | IPregunta[]>,
    ) => {
      // Puede recibir una sola pregunta o array (cuando viene de editarItemFIB)
      const updated = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      for (const p of updated) {
        const idx = state.preguntas.findIndex((pr) => pr._id === p._id);
        if (idx !== -1) state.preguntas[idx] = p;
      }
    },
    intercambiarPreguntas: (state, action: PayloadAction<IPregunta[]>) => {
      const [p1, p2] = action.payload;
      const i1 = state.preguntas.findIndex((p) => p._id === p1._id);
      const i2 = state.preguntas.findIndex((p) => p._id === p2._id);
      if (i1 !== -1) state.preguntas[i1] = p1;
      if (i2 !== -1) state.preguntas[i2] = p2;
      state.preguntas.sort((a, b) => a.position - b.position);
    },
    eliminarPreguntaState: (state, action: PayloadAction<string>) => {
      state.preguntas = state.preguntas.filter((p) => p._id !== action.payload);
    },
    startLoadingQuiz: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endLoadingQuiz: (state) => {
      state.isLoading = false;
    },
    setErrorQuiz: (state, action: PayloadAction<string | null>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setQuizzes,
  agregarQuiz,
  actualizarQuiz,
  eliminarQuizState,
  setQuizActivo,
  limpiarQuizActivo,
  limpiarQuizzes,
  setPreguntas,
  agregarPregunta,
  actualizarPreguntaState,
  intercambiarPreguntas,
  eliminarPreguntaState,
  startLoadingQuiz,
  endLoadingQuiz,
  setErrorQuiz,
} = quizMongoSlice.actions;

export default quizMongoSlice.reducer;
