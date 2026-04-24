import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const tokenGuardado = sessionStorage.getItem("auth_token");
const payloadGuardado = tokenGuardado ? decodeJWT(tokenGuardado) : null;

export interface AuthState {
  token: string | null;
  email: string | null;
  nombre: string | null;
  role: "admin" | "profesor" | null;
  id: string | null;
  tiene_token_canvas: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: tokenGuardado,
  email: payloadGuardado?.email || null,
  nombre: null,
  role: payloadGuardado?.role || null,
  id: payloadGuardado?.id || null,
  tiene_token_canvas: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredenciales: (
      state,
      action: PayloadAction<{
        token: string;
        email: string;
        role: "admin" | "profesor";
        id: string;
      }>,
    ) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.id = action.payload.id;
    },
    setPerfil: (
      state,
      action: PayloadAction<{
        nombre: string;
        tiene_token_canvas: boolean;
      }>,
    ) => {
      state.nombre = action.payload.nombre;
      state.tiene_token_canvas = action.payload.tiene_token_canvas;
    },
    setTieneTokenCanvas: (state, action: PayloadAction<boolean>) => {
      state.tiene_token_canvas = action.payload;
    },
    startLoadingAuth: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endLoadingAuth: (state) => {
      state.isLoading = false;
    },
    setErrorAuth: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      sessionStorage.removeItem("auth_token");
      state.token = null;
      state.email = null;
      state.nombre = null;
      state.role = null;
      state.id = null;
      state.tiene_token_canvas = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setCredenciales,
  setPerfil,
  setTieneTokenCanvas,
  startLoadingAuth,
  endLoadingAuth,
  setErrorAuth,
  logout,
} = authSlice.actions;
