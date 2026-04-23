import { createSlice } from "@reduxjs/toolkit";

export interface ICanvasDeploymentVideo {
  canvas_curso_id:  number;
  canvas_page_id:   number | null;
  canvas_page_url:  string;
  canvas_item_id:   number | null;
  status:           'pending' | 'synced' | 'dirty' | 'missing' | 'error';
  synced_at:        string | null;
  error_msg:        string;
}

export interface IVideo {
  _id:                string;
  recurso_id:         string;
  tema_id:            string;
  clase_id:           string;
  capitulo_id:        string;
  curso_id:           string;
  url:                string;
  canvas_deployments: ICanvasDeploymentVideo[];
  createdAt:          string;
  updatedAt:          string;
}

export interface VideoState {
  videos:    IVideo[];
  isLoading: boolean;
  error:     string | null;
}

const initialState: VideoState = {
  videos:    [],
  isLoading: false,
  error:     null,
};

export const videoMongoSlice = createSlice({
  name: "videoMongo",
  initialState,
  reducers: {
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
    agregarVideo: (state, action) => {
      const idx = state.videos.findIndex(
        v => v.recurso_id === action.payload.recurso_id
      );
      if (idx !== -1) {
        state.videos[idx] = action.payload;
      } else {
        state.videos.push(action.payload);
      }
    },
    actualizarVideo: (state, action) => {
      const idx = state.videos.findIndex(v => v._id === action.payload._id);
      if (idx !== -1) state.videos[idx] = action.payload;
    },
    limpiarVideos: (state) => {
      state.videos = [];
    },
    startLoadingVideo: (state) => {
      state.isLoading = true;
      state.error     = null;
    },
    endLoadingVideo: (state) => {
      state.isLoading = false;
    },
    setErrorVideo: (state, action) => {
      state.isLoading = false;
      state.error     = action.payload;
    },
  },
});

export const {
  setVideos,
  agregarVideo,
  actualizarVideo,
  limpiarVideos,
  startLoadingVideo,
  endLoadingVideo,
  setErrorVideo,
} = videoMongoSlice.actions;