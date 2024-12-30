import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';
import { Usuario } from '../constans/types';

interface UsersState {
  items: Usuario[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
  usuarioActual: Usuario | null;
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
  usuarioActual: null,
};

export const obtenerUsuarioPorUUID = createAsyncThunk('usuarios/obtenerUsuarioPorUUID', async (uuid: string, { rejectWithValue }) => {
  try {
    const response: Usuario = await invoke('obtener_usuario_por_uuid', { uuid });
    return response;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    // return rejectWithValue('Usuario no encontrado');
  }
});

const userUIID = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerUsuarioPorUUID.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.usuarioActual = null;
      })
      .addCase(obtenerUsuarioPorUUID.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.usuarioActual = action.payload;
      })
      .addCase(obtenerUsuarioPorUUID.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default userUIID.reducer;