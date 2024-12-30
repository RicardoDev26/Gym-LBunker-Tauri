import React, { useState, useRef } from "react";
import { ModalStateEnum, Usuario } from "../../constans/types";
import SinFondo from "../../assets/file.png";
import { useDispatch } from 'react-redux';
import { renovarMembresia, renovarMensualidad } from "../../hooks/sliceMembers";
import { AppDispatch } from "../../hooks/store";
import { invoke } from "@tauri-apps/api/core";

interface ModalInfoClienteProps {
  modalState: ModalStateEnum;
  onClose: () => void;
  usuario: Usuario;
}

const ModalInfoCliente: React.FC<ModalInfoClienteProps> = ({ modalState, onClose, usuario }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [duracion, setDuracion] = useState<number>(30); // Default duration to 1 month
  const [foto, setFoto] = useState<string | null>(usuario.foto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (modalState === ModalStateEnum.NULL) return null;

  const handleFotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
        invoke('cambiar_foto_usuario', { usuarioId: usuario.id, foto: reader.result as string })
          .then(() => console.log('Foto actualizada correctamente'))
          .catch((error) => console.error('Error al actualizar la foto:', error));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRenovarMembresia = () => {
    dispatch(renovarMembresia(usuario.id))
      .then(() => console.log('Membresía renovada correctamente'))
      .catch((error) => console.error('Error al renovar membresía:', error));
  };

  const handleRenovarMensualidad = () => {
    dispatch(renovarMensualidad({ usuarioId: usuario.id, duracionRenovacion: duracion }))
      .then(() => console.log('Mensualidad renovada correctamente'))
      .catch((error) => console.error('Error al renovar mensualidad:', error));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="relative rounded-3xl py-3 px-3 bg-orange-500 bg-opacity-60 backdrop-blur-md w-[400px] h-[600px] flex flex-col items-center gap-7 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black font-bold text-xl"
        >
          &times;
        </button>
        <h1 className="text-3xl text-black font-bold">Info del Cliente</h1>
        <div className="w-32 h-44 cursor-pointer" onClick={handleImageClick}>
          <img src={foto || SinFondo} alt="Foto del Cliente" className="w-full h-full object-cover rounded-xl" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFotoChange}
          />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-center text-2xl font-bold">{usuario.nombre}</h1>
          <h1 className="font-bold">Membresía: <span className="font-bold text-white">{usuario.membresia}</span></h1>
          <h1 className="font-bold">Inicio de Membresía: <span className="font-bold text-white">{usuario.fecha_inicio}</span></h1>
          <h1 className="font-bold">Fecha de pago: <span className="font-bold text-white">{usuario.fecha_pago}</span></h1>
          <h1 className="font-bold">Fecha de Corte: <span className="font-bold text-white">{usuario.fecha_corte}</span></h1>
          <h1 className="font-bold">Días restantes: <span className="font-bold text-white">{usuario.dias_restantes}</span></h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRenovarMensualidad}
            className="bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded-lg hover:bg-gray-900 px-4 py-2"
          >
            Pagar Mensualidad
          </button>
          <button
            onClick={handleRenovarMembresia}
            className="bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded-lg hover:bg-gray-900 px-4 py-2"
          >
            Renovar Membresía
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoCliente;