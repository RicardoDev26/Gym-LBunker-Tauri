import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

interface MembresiaState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MembresiaState = {
  status: 'idle',
  error: null,
};

// Thunk para renovar mensualidad
export const renovarMensualidad = createAsyncThunk('membresias/renovarMensualidad', async ({ usuarioId, duracion }: { usuarioId: number; duracion: number }) => {
  const response: string = await invoke('renovar_mensualidad', { usuario_id: usuarioId, duracion_renovacion: duracion });
  return response;
});

// Thunk para renovar membresía
export const renovarMembresia = createAsyncThunk('membresias/renovarMembresia', async (usuarioId: number) => {
  const response: string = await invoke('renovar_membresia', { usuario_id: usuarioId });
  return response;
});

// Slice de membresías
const membresiasSlice = createSlice({
  name: 'membresias',
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
        state.error = action.error.message || 'Error al renovar mensualidad';
      })
      .addCase(renovarMembresia.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(renovarMembresia.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(renovarMembresia.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error al renovar membresía';
      });
  },
});

export default membresiasSlice.reducer;