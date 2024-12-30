export enum ModalStateEnum {
    NULL= "NULL",
    MODAL_INFO= "MODAL_INFO",
    MODAL_VERIFY= "MODAL_VERIFY",
    MODAL_FORM = "MODAL_FORM"
}

export interface Usuario {
    id: number;
    uuid: string;
    nombre: string;
    fecha_inicio: string;
    fecha_pago: string;
    fecha_corte: string;
    membresia: string;
    dias_restantes: number;
    estado: string;
    foto?: string;
  }