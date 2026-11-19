import * as yup from "yup"
import { campusArray, roleArray } from "@/constants"

// Business-specific validators aligned to the API rules
// (User::createRulesBusiness / updateRulesBusiness, BusinessData rules).
// The shared user.ts / generation.ts validators are intentionally untouched.
const REQUIRED = "Campo requerido"
const max = (limit: number) => `Máximo ${limit} caracteres`

const BUSINESS_CAMPUSES = campusArray.map((c) => c.value)
const BUSINESS_ROLES = roleArray.map((r) => r.value)

export const businessFirstName = () =>
  yup.string().required(REQUIRED).max(255, max(255)).label("Nombre")
export const businessLastName = () =>
  yup.string().required(REQUIRED).max(255, max(255)).label("Apellido(s)")
export const businessEmail = () =>
  yup
    .string()
    .required(REQUIRED)
    .email("Ingresa un correo electrónico válido")
    .max(255, max(255))
    .label("Correo electrónico")
export const businessUpdateEmail = () =>
  yup
    .string()
    .required(REQUIRED)
    .email("Ingresa un correo electrónico válido")
    .label("Correo electrónico")
export const businessPassword = () =>
  yup
    .string()
    .required(REQUIRED)
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .label("Contraseña")
export const businessUpdatePassword = () =>
  yup
    .string()
    .transform((curr, orig) => (orig === "" ? undefined : curr))
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .label("Contraseña")
export const businessPhone = () =>
  yup.string().nullable().max(15, max(15)).label("Número de celular")
export const businessCampus = () =>
  yup
    .string()
    .required(REQUIRED)
    .oneOf(BUSINESS_CAMPUSES, "Selecciona una sede válida")
    .label("Sede")

export const workstation = () =>
  yup.string().nullable().max(255, max(255)).label("Puesto de trabajo")
export const role = () =>
  yup
    .string()
    .required(REQUIRED)
    .oneOf(BUSINESS_ROLES, "Selecciona un rol válido")
    .label("Rol")

export const bs_name = () => yup.string().required(REQUIRED).max(255, max(255)).label("Nombre de la empresa")
export const bs_director = () => yup.string().required(REQUIRED).max(255, max(255)).label("Nombre del director")
export const bs_rfc = () => yup.string().required(REQUIRED).max(13, max(13)).label("RFC")
export const bs_country = () => yup.string().required(REQUIRED).max(100, max(100)).label("País")
export const bs_state = () => yup.string().required(REQUIRED).max(100, max(100)).label("Estado")
export const bs_locality = () => yup.string().required(REQUIRED).max(255, max(255)).label("Localidad")
export const bs_adrress = () => yup.string().required(REQUIRED).max(255, max(255)).label("Dirección")
export const bs_telphone = () => yup.string().required(REQUIRED).max(15, max(15)).label("Teléfono")
export const bs_line = () => yup.string().required(REQUIRED).max(255, max(255)).label("Giro")
export const bs_other_line = () => yup.string().notRequired().max(255, max(255)).label("Especificar")
export const bs_description = () => yup.string().required(REQUIRED).label("Descripción")
export const bs_website = () => yup.string().notRequired().max(255, max(255)).label("Sitio web")

export const start_date = () => yup.string().required(REQUIRED).label("Fecha de inicio")
export const end_date = () => yup.string().required(REQUIRED).label("Fecha de fin")
