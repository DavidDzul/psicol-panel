import * as yup from "yup"

export const generation_name = () => yup.string().required("Campo requerido").label("Generación")
export const campus = () => yup.string().required("Campo requerido").label("Sede")
export const generation_active = () => yup.boolean().default(true)
