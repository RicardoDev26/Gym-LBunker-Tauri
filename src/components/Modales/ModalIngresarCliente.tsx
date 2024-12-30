import React, { useState } from "react";
import { ModalStateEnum } from "../../constans/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../hooks/store";
import { resetModalState } from "../../hooks/sliceModal";
import { crearUsuario } from "../../hooks/newUserSlice";
import { AppDispatch } from "../../hooks/store";

type FormValues = {
  fullName: string;
  membershipDuration: string;
};

const ModalForm: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    fullName: "",
    membershipDuration: "30", // Default a 30 días (1 mes)
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const dispatch = useDispatch<AppDispatch>();
  const modalState = useSelector((state: RootState) => state.modal.modalState);
  const userCreationStatus = useSelector((state: RootState) => state.newUser.status);
  const userCreationError = useSelector((state: RootState) => state.newUser.error);

  if (modalState !== ModalStateEnum.MODAL_FORM) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { fullName, membershipDuration } = formValues;

    console.log("Enviando datos al backend:", {
      nombre: fullName,
      duracion_visita: parseInt(membershipDuration, 10),
      foto: null
    });

    dispatch(crearUsuario({ 
      nombre: fullName, 
      duracion_visita: parseInt(membershipDuration, 10), // Parsear correctamente como entero
      foto: null // Asumiendo que no se maneja la foto en el formulario actual
    }))
    .then(() => {
      alert(`Nombre: ${formValues.fullName}, Duración: ${formValues.membershipDuration} días`);
      setFormValues({
        fullName: "",
        membershipDuration: "30", // Resetear a la duración por defecto (1 mes)
      });
      handleClose();
    })
    .catch((error: any) => {
      console.error("Error al crear usuario:", error);
    });
  };

  const handleClose = () => dispatch(resetModalState());

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="relative rounded-3xl px-3 bg-[#FF5722] w-[400px] py-10 gap-7 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="text-bold text-black text-xl">
              Nombre Completo
            </label>
            <input
              type="text"
              id="fullName"
              className="rounded-xl px-2 py-2 text-black"
              name="fullName"
              placeholder="Ingresa tu nombre completo"
              value={formValues.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="membershipDuration"
              className="text-bold text-black text-xl"
            >
              Duración de Membresía {" "}
            </label>
            <select
              id="membershipDuration"
              name="membershipDuration"
              value={formValues.membershipDuration}
              onChange={handleChange}
            >
              <option value="7">1 semana</option>
              <option value="30">1 mes</option>
              {[60, 90, 120, 150, 180, 210, 240, 300, 330].map((days) => (
                <option key={days} value={days}>
                  {`${days / 30} meses`}
                </option>
              ))}
              <option value="365">1 año</option>
            </select>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded hover:bg-black"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#2F2F2F] border-solid border-[1px] border-[#E0E0E0] text-white rounded hover:bg-black"
            >
              Cerrar
            </button>
          </div>
          {userCreationStatus === 'failed' && (
            <p className="text-red-500">Error al crear usuario: {userCreationError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ModalForm;