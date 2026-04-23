import { createSlice } from "@reduxjs/toolkit";

export interface ActividadState {
  id: number;
  position: number;
  title: string;
  indent: number;
  quiz_lti: boolean;
  type: string;
  module_id: number;
  html_url: string;
  page_url: string;
  publish_at: string | null;
  url: string;
  published: boolean;
  unpublishable: boolean;
}

export interface ActividadesState {
  actividades: Array<ActividadState>;
  actividad: ActividadState;
  isLoading: boolean;
}

const initialState: ActividadesState = {
  actividades: [
    {
      id: 0,
      position: 0,
      title: "",
      indent: 0,
      quiz_lti: false,
      type: "",
      module_id: 0,
      html_url: "",
      page_url: "",
      publish_at: null,
      url: "",
      published: false,
      unpublishable: false,
    },
  ],
  actividad: {
    id: 0,
    position: 0,
    title: "",
    indent: 0,
    quiz_lti: false,
    type: "",
    module_id: 0,
    html_url: "",
    page_url: "",
    publish_at: null,
    url: "",
    published: false,
    unpublishable: false,
  },
  isLoading: true,
};

export const actividadSlice = createSlice({
  name: "actividades",
  initialState,
  reducers: {
    setActividades: (state, action) => {
      state.actividades = action.payload;
    },
    setActividad: (state, action) => {
      state.actividad = action.payload;
    },
    startLoadingActividad: (state) => {
      state.isLoading = true;
    },
    endLoadingActividad: (state) => {
      state.isLoading = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setActividades, setActividad, startLoadingActividad, endLoadingActividad } =
  actividadSlice.actions;
