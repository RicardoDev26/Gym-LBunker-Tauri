import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

interface UsuarioState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsuarioState = {
  status: 'idle',
  error: null,
};

export const renovarMensualidad = createAsyncThunk(
  'usuario/renovarMensualidad',
  async ({ usuarioId, duracionRenovacion }: { usuarioId: number; duracionRenovacion: number }) => {
    await invoke('renovar_mensualidad', { usuarioId, duracionRenovacion });
    return { usuarioId, duracionRenovacion };
  }
);

export const renovarMembresia = createAsyncThunk(
  'usuario/renovarMembresia',
  async (usuarioId: number) => {
    await invoke('renovar_membresia', { usuarioId });
    return usuarioId;
  }
);

const membresiasSlice = createSlice({
  name: 'usuario',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(renovarMensualidad.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(renovarMensualidad.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(renovarMensualidad.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(renovarMembresia.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(renovarMembresia.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(renovarMembresia.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default membresiasSlice.reducer;