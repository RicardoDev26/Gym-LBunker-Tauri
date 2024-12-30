import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../hooks/store";
import { resetModalState } from "../../hooks/sliceModal";
import { obtenerUsuarioPorUUID } from "../../hooks/obtenerUserUID"; // Asegúrate de que la importación sea correcta
import { ModalStateEnum } from "../../constans/types"; // Asegúrate de que la importación sea correcta
import IconSend from "../icons/IconSendSvg.svg";
import SinFondo from "../../assets/file.png";

const ModalVerifyClient: React.FC = () => {
  const modalState = useSelector((state: RootState) => state.modal.modalState);
  const usuarioActual = useSelector((state: RootState) => state.userUIID.usuarioActual); // Ajusta el nombre del slice si es necesario
  const error = useSelector((state: RootState) => state.userUIID.error);
  const dispatch = useDispatch<AppDispatch>();
  
  const [uuid, setUUID] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInput, setShowInput] = useState(true);

  if (modalState !== ModalStateEnum.MODAL_VERIFY) return null;

  const handleSend = () => {
    if (uuid.toLowerCase() === "cerrar") {
      setUUID(''); // Restablecer el valor del input
      dispatch(resetModalState());
      return;
    }
    
    setIsProcessing(true);
    setShowInput(false);
    dispatch(obtenerUsuarioPorUUID(uuid))
      .then(() => {
        setIsProcessing(false);
        // Volver a mostrar el input de ingresar UUID después de 15 segundos
        setTimeout(() => {
          setUUID(''); // Restablecer el valor del input
          setShowInput(true);
        }, 15000);
      })
      .catch(() => {
        setIsProcessing(false);
        // Volver a mostrar el input de ingresar UUID después de 15 segundos
        setTimeout(() => {
          setUUID(''); // Restablecer el valor del input
          setShowInput(true);
        }, 15000);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="relative rounded-3xl px-3 bg-[#FF5722] w-[600px] h-[400px] flex flex-col items-center justify-center gap-7 shadow-lg">
        {/* <h1 className="text-3xl text-black font-bold">Verificar Cliente</h1> */}
        {isProcessing ? (
          <div className="text-center text-white text-xl justify-center items-center flex flex-col gap-2">
            <p>Procesando...</p>
          </div>
        ) : showInput ? (
          <div className="flex flex-col gap-8 items-center">
            <label className="text-black text-4xl font-bold">Ingresa ID</label>
            <div className="relative">
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUUID(e.target.value)}
                placeholder="#####"
                className="rounded-xl p-2"
                required
              />
              <button
                className="absolute top-2 right-1"
                onClick={handleSend}
              >
                <img src={IconSend} alt="Send Icon" />
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="text-center text-white text-xl justify-center items-center flex flex-col gap-2">
            {usuarioActual ? (
              <>
                <img className="w-[80px] h-[100px]" src={SinFondo} />
                <p className="text-2xl text-black font-bold">{usuarioActual.nombre}</p>
                <p>Días Restantes: <span className="text-green-500 text-bold text-xl">{usuarioActual.dias_restantes} Días</span></p>
                <p>Fecha de corte: <span className="text-white text-bold text-xl">{usuarioActual.fecha_corte}</span></p>
              </>
            ) : (
              <p className="text-white text-4xl">No se encontró al usuario :(</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalVerifyClient;