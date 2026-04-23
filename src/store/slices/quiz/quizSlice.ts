import { createSlice } from "@reduxjs/toolkit";

export type TipoPregunta =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay';

export interface ICanvasDeploymentQuiz {
  canvas_curso_id: number;
  canvas_quiz_id:  number | null;
  canvas_item_id:  number | null;
  status:          'pending' | 'synced' | 'dirty' | 'missing' | 'error';
  synced_at:       string | null;
  error_msg:       string;
}

export interface IOpcion {
  _id:         string;
  texto:       string;
  es_correcta: boolean;
  canvas_id?:  number;
}

export interface IPregunta {
  _id:        string;
  quiz_id:    string;
  enunciado:  string;
  tipo:       TipoPregunta;
  puntos:     number;
  position:   number;
  opciones:   IOpcion[];
  canvas_ids: { canvas_curso_id: number; canvas_question_id: number }[];
  createdAt:  string;
  updatedAt:  string;
}

export interface IQuiz {
  _id:                string;
  recurso_id:         string;
  tema_id:            string;
  clase_id:           string;
  capitulo_id:        string;
  curso_id:           string;
  titulo:             string;
  descripcion:        string;
  tiempo_limite:      number | null;
  intentos:           number;
  publicado:          boolean;
  canvas_deployments: ICanvasDeploymentQuiz[];
  createdAt:          string;
  updatedAt:          string;
}

export interface QuizState {
  quizzes:    IQuiz[];
  quizActivo: IQuiz | null;
  preguntas:  IPregunta[];
  isLoading:  boolean;
  error:      string | null;
}

const initialState: QuizState = {
  quizzes:    [],
  quizActivo: null,
  preguntas:  [],
  isLoading:  false,
  error:      null,
};

export const quizMongoSlice = createSlice({
  name: "quizMongo",
  initialState,
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
    },
    agregarQuiz: (state, action) => {
      const idx = state.quizzes.findIndex(
        q => q.recurso_id === action.payload.recurso_id
      );
      if (idx !== -1) {
        state.quizzes[idx] = action.payload;
      } else {
        state.quizzes.push(action.payload);
      }
    },
    actualizarQuiz: (state, action) => {
      state.quizActivo = action.payload;
      const idx = state.quizzes.findIndex(q => q._id === action.payload._id);
      if (idx !== -1) state.quizzes[idx] = action.payload;
    },
    setQuizActivo: (state, action) => {
      state.quizActivo = action.payload;
    },
    limpiarQuizActivo: (state) => {
      state.quizActivo = null;
      state.preguntas  = [];
    },
    limpiarQuizzes: (state) => {
      state.quizzes    = [];
      state.quizActivo = null;
      state.preguntas  = [];
    },
    setPreguntas: (state, action) => {
      state.preguntas = action.payload;
    },
    agregarPregunta: (state, action) => {
      state.preguntas.push(action.payload);
    },
    intercambiarPreguntas: (state, action) => {
      action.payload.forEach((p: IPregunta) => {
        const idx = state.preguntas.findIndex(q => q._id === p._id);
        if (idx !== -1) state.preguntas[idx] = p;
      });
      state.preguntas.sort((a, b) => a.position - b.position);
    },
    eliminarPreguntaState: (state, action) => {
      state.preguntas = state.preguntas.filter(p => p._id !== action.payload);
    },
    startLoadingQuiz: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingQuiz: (state) => {
      state.isLoading = false;
    },
    setErrorQuiz: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setQuizzes,
  agregarQuiz,
  actualizarQuiz,
  setQuizActivo,
  limpiarQuizActivo,
  limpiarQuizzes,
  setPreguntas,
  agregarPregunta,
  intercambiarPreguntas,
  eliminarPreguntaState,
  startLoadingQuiz,
  endLoadingQuiz,
  setErrorQuiz,
} = quizMongoSlice.actions;