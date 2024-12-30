import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';
import { obtenerUsuarios } from './usersSlice'; // Asegúrate de importar la acción obtenerUsuarios

export const crearUsuario = createAsyncThunk(
  'usuarios/crearUsuario',
  async (nuevoUsuario: { nombre: string; duracion_visita: number; foto: string | null }, thunkAPI) => {
    try {
      const response = await invoke('agregar_usuario', {
        nombre: nuevoUsuario.nombre,
        duracionVisita: nuevoUsuario.duracion_visita, // Este es el nombre correcto que el backend espera
        foto: nuevoUsuario.foto,
      });
      // Despachar la acción para obtener los usuarios actualizados
      thunkAPI.dispatch(obtenerUsuarios());
      return response;
    } catch (error) {
      throw new Error(error as string);
    }
  }
);

const crearUsuarioSlice = createSlice({
  name: 'crearUsuario',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(crearUsuario.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(crearUsuario.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(crearUsuario.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default crearUsuarioSlice.reducer;