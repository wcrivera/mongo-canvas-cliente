import { createSlice } from "@reduxjs/toolkit";

export interface ItemState {
  content_id: number;
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

export interface ItemsState {
  items: Array<ItemState>;
  item: ItemState;
  items_clase: Array<ItemState>;
  item_clase: ItemState;
  items_ayudantia: Array<ItemState>;
  item_ayudantia: ItemState;
  items_ejercicio: Array<ItemState>;
  item_ejercicio: ItemState;
  isLoading: boolean;
}

const initialState: ItemsState = {
  item_clase: {
    content_id: 0,
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
  items_clase: [
    {
      content_id: 0,
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
  items_ayudantia: [
    {
      content_id: 0,
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
  item_ayudantia: {
    content_id: 0,
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
  items_ejercicio: [
    {
      content_id: 0,
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
  item_ejercicio: {
    content_id: 0,
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
  items: [
    {
      content_id: 0,
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
  item: {
    content_id: 0,
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

export const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setItem: (state, action) => {
      state.item = action.payload;
    },
    startLoadingItem: (state) => {
      state.isLoading = true;
    },
    endLoadingItem: (state) => {
      state.isLoading = false;
    },
    setItemClase: (state, action) => {
      state.item_clase = action.payload;
    },
    setItemsClase: (state, action) => {
      state.items_clase = action.payload;
    },
    setItemAyudantia: (state, action) => {
      state.item_ayudantia = action.payload;
    },
    setItemsAyudantia: (state, action) => {
      state.items_ayudantia = action.payload;
    },
    setItemEjercicio: (state, action) => {
      state.item_ejercicio = action.payload;
    },
    setItemsEjercicio: (state, action) => {
      state.items_ejercicio = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setItems,
  setItem,
  startLoadingItem,
  endLoadingItem,
  setItemClase,
  setItemAyudantia,
  setItemEjercicio,
  setItemsClase,
  setItemsAyudantia,
  setItemsEjercicio,
} = itemSlice.actions;
