import * as yup from "yup"

export const role_name = () => yup.string().required("Campo requerido").label("Aviso")
export const permissions = () => yup.array()
export const num_visualizations = () => yup.number().notRequired()
export const num_vacancies = () => yup.number().notRequired()
export const unlimited = () => yup.boolean().default(false)
