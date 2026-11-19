import * as yup from "yup"

// Matches the API `max:255` rule on these columns.
const MAX_LENGTH = 255
const MAX_LENGTH_MESSAGE = "Máximo 255 caracteres"

export const vacant_name = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido").label("Nombre")
export const category = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido").label("Categoría")
export const mode = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido").label("Modo")
export const activities = () => yup.string().required("Campo requerido").label("Actividades o funciones")
export const study_profile = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido").label("Perfil de estudios")
export const net_salary = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido").label("Sueldo neto mensual")
export const start_day = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido").label("Día de inicio")

export const end_day = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido")
export const start_hour = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido")
export const start_minute = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido")
export const end_hour = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido")
export const end_minute = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido")

export const saturday_hour = () => yup.boolean().default(false)
export const saturday_start_hour = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const saturday_start_minute = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const saturday_end_hour = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const saturday_end_minute = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()

export const sunday_hour = () => yup.boolean().default(false)
export const sunday_start_hour = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const sunday_start_minute = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const sunday_end_hour = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const sunday_end_minute = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()

export const additional_time_info = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const experience = () => yup.boolean().default(false)
export const experience_description = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const software_use = () => yup.boolean().default(false)
export const software_description = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const skills = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required("Campo requerido")
export const observations = () => yup.string().notRequired()

export const financial_support = () => yup.boolean().default(false)
export const support_amount = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).notRequired()
export const semester = () => yup.string().max(MAX_LENGTH, MAX_LENGTH_MESSAGE).required('Campo requerido')
export const general_knowledge = () => yup.boolean().default(false)
export const knowledge_description = () => yup.string().notRequired()

export const overtime_pay = () => yup.boolean().default(true)
export const utilities = () => yup.boolean().default(true)
export const bonuses = () => yup.boolean().default(false)
export const dining_room = () => yup.boolean().default(false)
export const savings_fund = () => yup.boolean().default(false)
export const grocery_vouchers = () => yup.boolean().default(false)
export const extensive_vacation_bonus = () => yup.boolean().default(false)
export const top_christmas_bonus = () => yup.boolean().default(false)
export const flexible_hours = () => yup.boolean().default(false)
export const major_medical_expenses = () => yup.boolean().default(false)
export const transportation_help = () => yup.boolean().default(false)
export const automobile = () => yup.boolean().default(false)
export const loans = () => yup.boolean().default(false)
export const life_insurance = () => yup.boolean().default(false)
export const other = () => yup.boolean().default(false)
export const benefit_description = () => yup.string().notRequired()
export const compensations = () => yup.string().notRequired()

export const contact_name = () => yup.string().required()
export const contact_position = () => yup.string().required()
export const contact_telphone = () => yup.string().required()
export const contact_email = () => yup.string().required()
