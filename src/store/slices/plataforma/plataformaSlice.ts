import { createSlice } from "@reduxjs/toolkit";
import type { IUltimoIntento } from "../../../helpers/indicadorIntento";

export interface ICursoPlataforma {
  _id:          string;
  codigo:       string;
  nombre:       string;
  descripcion:  string;
  published_api: boolean;
}

export interface ICapituloPlataforma {
  _id:          string;
  nombre:       string;
  position:     number;
  published_api: boolean;
}

export interface IClasePlataforma {
  _id:          string;
  nombre:       string;
  position:     number;
  published_api: boolean;
}

export interface IAyudantiaPlataforma {
  _id:          string;
  nombre:       string;
  position:     number;
  enunciado:    string;
  published_api: boolean;
}

export interface IEjercicioPlataforma {
  _id:               string;
  titulo:            string;
  position:          number;
  published_api:     boolean;
  intentos:          number;
  umbral_aprobacion: number;
  ultimo_intento?:   IUltimoIntento | null;
}

export interface IQuizPlataforma {
  _id:               string;
  titulo:            string;
  intentos:          number;
  umbral_aprobacion: number;
  published_api:     boolean;
  canvas_deployments: { canvas_curso_id: number; canvas_quiz_id: number | null }[];
  ultimo_intento?:   IUltimoIntento | null;
}

export interface IDiapositivaPlataforma {
  _id:             string;
  titulo:          string;
  url:             string;
  published_api:   boolean;
  canvas_deployments: { canvas_curso_id: number; canvas_page_url: string }[];
}

export interface IVideoPlataforma {
  _id:           string;
  titulo:        string;
  url:           string;
  published_api: boolean;
  canvas_deployments: { canvas_curso_id: number; canvas_page_url: string }[];
}

export interface ITemaPlatafroma {
  _id:          string;
  nombre:       string;
  position:     number;
  published_api: boolean;
  diapositivas: IDiapositivaPlataforma[];
  videos:       IVideoPlataforma[];
  quizzes:      IQuizPlataforma[];
}

export interface PlataformaState {
  cursos:     ICursoPlataforma[];
  capitulos:  ICapituloPlataforma[];
  clases:     IClasePlataforma[];
  ayudantias: IAyudantiaPlataforma[];
  ejercicios: IEjercicioPlataforma[];
  temas:      ITemaPlatafroma[];
  isLoading:  boolean;
  error:      string | null;
}

const initialState: PlataformaState = {
  cursos: [], capitulos: [], clases: [], ayudantias: [],
  ejercicios: [], temas: [], isLoading: false, error: null,
};

export const plataformaSlice = createSlice({
  name: "plataforma",
  initialState,
  reducers: {
    setCursos:      (state, action) => { state.cursos     = action.payload; },
    setCapitulos:   (state, action) => { state.capitulos  = action.payload; },
    setClases:      (state, action) => { state.clases     = action.payload; },
    setAyudantias:  (state, action) => { state.ayudantias = action.payload; },
    setEjercicios:  (state, action) => { state.ejercicios = action.payload; },
    setTemas:       (state, action) => { state.temas      = action.payload; },
    startLoading:   (state)         => { state.isLoading  = true;  state.error = null; },
    endLoading:     (state)         => { state.isLoading  = false; },
    setError:       (state, action) => { state.isLoading  = false; state.error = action.payload; },
    limpiarPlataforma: (state)      => { Object.assign(state, initialState); },
  },
});

export const {
  setCursos, setCapitulos, setClases, setAyudantias,
  setEjercicios, setTemas, startLoading, endLoading, setError, limpiarPlataforma,
} = plataformaSlice.actions;