import * as yup from "yup"

export const class_name = () => yup.string().required("Campo requerido").label("Nombre")
export const class_date = () => yup.string().required("Campo requerido").label("Fecha")
export const class_start_time = () => yup.string().required("Campo requerido").label("Hora de inicio")
export const class_end_time = () => yup.string().required("Campo requerido").label("Hora de término")
