// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { canvasAPI } from '../api/canvasAPI';

interface AuthState {
  token:            string | null;
  email:            string | null;
  nombre:           string | null;
  role:             'admin' | 'profesor' | null;
  id:               string | null;
  tiene_token_canvas: boolean;
  loading:          boolean;
  error:            string | null;
}

const initialState: AuthState = {
  token:              null,
  email:              null,
  nombre:             null,
  role:               null,
  id:                 null,
  tiene_token_canvas: false,
  loading:            false,
  error:              null,
};

// Thunk: cargar perfil completo desde backend
export const cargarPerfil = createAsyncThunk(
  'auth/cargarPerfil',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await canvasAPI.get('/auth/me');
      return response.data.usuario;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || 'Error al cargar perfil');
    }
  }
);

// Thunk: guardar token Canvas
export const guardarTokenCanvas = createAsyncThunk(
  'auth/guardarTokenCanvas',
  async (canvas_token: string, { rejectWithValue }) => {
    try {
      await canvasAPI.post('/auth/canvas-token', { canvas_token });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || 'Error al guardar token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredenciales: (state, action: PayloadAction<{
      token: string;
      email: string;
      role:  'admin' | 'profesor';
      id:    string;
    }>) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.role  = action.payload.role;
      state.id    = action.payload.id;
    },
    logout: (state) => {
      state.token              = null;
      state.email              = null;
      state.nombre             = null;
      state.role               = null;
      state.id                 = null;
      state.tiene_token_canvas = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarPerfil.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(cargarPerfil.fulfilled, (state, action) => {
        state.loading            = false;
        state.nombre             = action.payload.nombre;
        state.email              = action.payload.email;
        state.role               = action.payload.role;
        state.tiene_token_canvas = !!action.payload.canvas_token;
      })
      .addCase(cargarPerfil.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })
      .addCase(guardarTokenCanvas.fulfilled, (state) => {
        state.tiene_token_canvas = true;
      });
  },
});

export const { setCredenciales, logout } = authSlice.actions;
export default authSlice.reducer;