import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';
import { Usuario } from '../constans/types';

interface UsersState {
  items: Usuario[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const obtenerUsuarios = createAsyncThunk('usuarios/obtenerUsuarios', async () => {
  try {
    const response: Usuario[] = await invoke('obtener_usuarios');
    console.log('Usuarios obtenidos del backend:', response);
    return response;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
});

const usersSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerUsuarios.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(obtenerUsuarios.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(obtenerUsuarios.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default usersSlice.reducer;