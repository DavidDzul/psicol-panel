import * as yup from "yup"

export const workstation = () => yup.string().required("Campo requerido").label("Nombre")

export const role = () => yup.string().required("Campo requerido").label("Rol")
export const bs_name = () => yup.string().required("Campo requerido").label("Nombre de la empresa")
export const bs_director = () => yup.string().required("Campo requerido").label("Nombre del director")
export const bs_rfc = () => yup.string().required("Campo requerido").label("RFC")
export const bs_country = () => yup.string().required("Campo requerido").label("País")
export const bs_state = () => yup.string().required("Campo requerido").label("Estado")
export const bs_locality = () => yup.string().required("Campo requerido").label("Localidad")
export const bs_adrress = () => yup.string().required("Campo requerido").label("Dirección")
export const bs_telphone = () => yup.string().required("Campo requerido").label("Teléfono")
export const bs_line = () => yup.string().required("Campo requerido").label("Giro")
export const bs_other_line = () => yup.string().notRequired().label("Especificar")
export const bs_description = () => yup.string().required("Campo requerido").label("Descripción")
export const bs_website = () => yup.string().notRequired().label("Sitio web")

export const start_date = () => yup.string().required("Campo requerido").label("Sitio web")
export const end_date = () => yup.string().required("Campo requerido").label("Sitio web")