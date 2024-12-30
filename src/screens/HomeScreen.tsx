import React, { useState } from "react";
import { ModalStateEnum, Usuario } from "../constans/types";
import TableClients from "../components/tableClients";
import BannerButtons from "../components/BannerButtoms";
import ModalInfoCliente from "../components/Modales/ModalCliente";
import Logo from "../assets/Logo.png";
import Pesas from "../assets/Pesas.png";
import ModalVerifyClient from "../components/Modales/ModalVerificarCliente";
import ModalForm from "../components/Modales/ModalIngresarCliente";

const HomeScreen: React.FC = () => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.NULL);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const abrirModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setModalState(ModalStateEnum.MODAL_INFO);
  };

  const cerrarModal = () => {
    setModalState(ModalStateEnum.NULL);
    setSelectedUsuario(null);
  };

  return (
    <div className="relative bg-[#2F2F2F]">

      <div className="w-full h-[80px] bg-[#FF5722] flex items-center justify-center fixed top-0 left-0 right-0 z-10">
        <img className="w-20 h=20" src={Logo} />
        <h1 className="text-5xl font-bold text-center text-white">GYM-L^BÚNKER</h1>
        <img className=" ml-2 w-12 h-12" src={Pesas} />
      </div>

      <TableClients onOpenModal={abrirModal} />
      
      {selectedUsuario && modalState === ModalStateEnum.MODAL_INFO && (
        <ModalInfoCliente modalState={modalState} onClose={cerrarModal} usuario={selectedUsuario} />
      )}
      <ModalVerifyClient />
      <ModalForm />
  
      <BannerButtons />
    </div>
  );
};

export default HomeScreen;