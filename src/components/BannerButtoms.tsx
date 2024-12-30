import React from "react"
import { ModalStateEnum } from "../constans/types";
import { useDispatch } from "react-redux";
import { setModalState } from "../hooks/sliceModal";

const BannerButtons = () => {

    const dispatch = useDispatch()

    const OpenVerify = () => dispatch(setModalState(ModalStateEnum.MODAL_VERIFY))
    const OpenModalForm = () => dispatch(setModalState(ModalStateEnum.MODAL_FORM))

    return (
    <div className="w-full h-[80px] bg-[rgb(255,87,34)] flex justify-around items-center fixed bottom-0 left-0 right-0 z-10">
        {/* <button onClick={onPress} className="px-4 py-2 bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded hover:bg-black">
          Cargar Clientes
        </button> */}
      <button onClick={OpenModalForm} className="px-4 py-2 bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded hover:bg-black">
          Ingresar Cliente
        </button>
        <button onClick={OpenVerify} className="px-4 py-2 bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded hover:bg-black">
          Verificar Cliente
        </button>
      </div>
    )
}

export default BannerButtons