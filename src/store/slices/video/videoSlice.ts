import type { SyncStatus } from "@/types/entities";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ContextoVideo = "clase" | "ayudantia";

export interface ICanvasDeploymentVideo {
  canvas_curso_id: number;
  canvas_module_id: number | null;
  canvas_page_id: number | null;
  canvas_page_url: string;
  canvas_item_id: number | null;
  status: SyncStatus;
  synced_at: string | null;
  error_msg: string;
}

export interface IVideo {
  _id: string;
  contexto: ContextoVideo;
  tema_id: string | null;
  ayudantia_id: string | null;
  capitulo_id: string;
  curso_id: string;
  titulo: string;
  url: string;
  position: number;
  published_canvas: boolean;
  published_api: boolean;
  canvas_deployments: ICanvasDeploymentVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoState {
  videos: IVideo[];
  isLoading: boolean;
  error: string | null;
}

const initialState: VideoState = { videos: [], isLoading: false, error: null };

export const videoMongoSlice = createSlice({
  name: "videoMongo",
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<IVideo[]>) => {
      state.videos = action.payload;
    },
    agregarVideo: (state, action: PayloadAction<IVideo>) => {
      state.videos.push(action.payload);
    },
    actualizarVideo: (state, action: PayloadAction<IVideo>) => {
      const idx = state.videos.findIndex((v) => v._id === action.payload._id);
      if (idx !== -1) state.videos[idx] = action.payload;
    },
    eliminarVideoState: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter((v) => v._id !== action.payload);
    },
    limpiarVideos: (state) => {
      state.videos = [];
    },
    startLoadingVideo: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endLoadingVideo: (state) => {
      state.isLoading = false;
    },
    setErrorVideo: (state, action: PayloadAction<string | null>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setVideos,
  agregarVideo,
  actualizarVideo,
  eliminarVideoState,
  limpiarVideos,
  startLoadingVideo,
  endLoadingVideo,
  setErrorVideo,
} = videoMongoSlice.actions;
