import { createSlice } from "@reduxjs/toolkit";

export interface PageState {
  page_id: number;
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

export interface PagesState {
  pages: Array<PageState>;
  page: PageState;
  pages_clase: Array<PageState>;
  page_clase: PageState;
  pages_ayudantia: Array<PageState>;
  page_ayudantia: PageState;
  pages_ejercicio: Array<PageState>;
  page_ejercicio: PageState;
  isLoading: boolean;
}

const initialState: PagesState = {
  page_clase: {
    page_id: 0,
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
  pages_clase: [
    {
      page_id: 0,
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
  pages_ayudantia: [
    {
      page_id: 0,
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
  page_ayudantia: {
    page_id: 0,
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
  pages_ejercicio: [
    {
      page_id: 0,
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
  page_ejercicio: {
    page_id: 0,
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
  pages: [
    {
      page_id: 0,
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
  page: {
    page_id: 0,
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

export const pageSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    setPages: (state, action) => {
      state.pages = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    startLoadingPage: (state) => {
      state.isLoading = true;
    },
    endLoadingPage: (state) => {
      state.isLoading = false;
    },
    setPageClase: (state, action) => {
      state.page_clase = action.payload;
    },
    setPagesClase: (state, action) => {
      state.pages_clase = action.payload;
    },
    setPageAyudantia: (state, action) => {
      state.page_ayudantia = action.payload;
    },
    setPagesAyudantia: (state, action) => {
      state.pages_ayudantia = action.payload;
    },
    setPageEjercicio: (state, action) => {
      state.page_ejercicio = action.payload;
    },
    setPagesEjercicio: (state, action) => {
      state.pages_ejercicio = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setPages,
  setPage,
  startLoadingPage,
  endLoadingPage,
  setPageClase,
  setPageAyudantia,
  setPageEjercicio,
  setPagesClase,
  setPagesAyudantia,
  setPagesEjercicio,
} = pageSlice.actions;
