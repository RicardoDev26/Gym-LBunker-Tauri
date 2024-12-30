import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalStateEnum } from "../constans/types";


interface ModalState {
    modalState: ModalStateEnum;
  }
  
  const initialState: ModalState = {
    modalState: ModalStateEnum.NULL,
  };
  
  const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
      setModalState: (state, action: PayloadAction<ModalStateEnum>) => {
        state.modalState = action.payload;
      },
      resetModalState: (state) => {
        state.modalState = ModalStateEnum.NULL;
      },
    },
  });
  
  export const { setModalState, resetModalState } = modalSlice.actions;
  
  export default modalSlice.reducer;