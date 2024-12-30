import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./sliceModal";
import usersReducer from "./usersSlice";
import crearUsuarioReducer from "./newUserSlice";
import membresiasReducer from "./sliceMembers";
import userUIIDReducer from "./obtenerUserUID";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    usuarios: usersReducer,
    newUser: crearUsuarioReducer,
    membresias: membresiasReducer,
    userUIID: userUIIDReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;