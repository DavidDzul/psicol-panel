import * as yup from "yup"

export const message = () => yup.string().required("Campo requerido").label("Aviso")
export const notice_global = () => yup.boolean().default(false)
export const notice_active = () => yup.boolean().default(true)
