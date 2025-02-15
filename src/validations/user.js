import * as yup from "yup"

export const enrollment = () =>
    yup
        .string()
        .transform(value => value?.toUpperCase()) // Convierte el texto a mayúsculas
        .required("Campo requerido")
        .min(9, "Debe contener exactamente 9 caracteres")
        .max(9, "Debe contener exactamente 9 caracteres")
        .label("Matrícula");
export const first_name = () => yup.string().required("Campo requerido").label("Nombre")
export const last_name = () => yup.string().required("Campo requerido").label("Apellido(s)")
export const email = () => yup.string().required("Campo requerido").label("Correo electrónico")
export const password = () => yup.string().required().min(6).label("Contraseña")
export const updatePassword = () => yup.string().min(6).label("Contraseña")
export const confirmation = () =>
    yup
        .string()
        .required()
        .transform((curr, orig) => (orig === "" ? undefined : curr))
        .when("password", {
            is: (val) => !!val,
            then: (schema) => schema.required(),
        })
        .oneOf([yup.ref("password")], "Las contraseñas deben coincidir")
        .label("Confirmar Contraseña")
export const phone = () => yup.string().required("Campo requerido").label("Teléfono")
export const generation_id = () =>
    yup
        .number()
        .required("Campo requerido")
        .transform((curr, orig) => (!orig ? undefined : curr))
        .label("Generación")
export const user_active = () => yup.boolean().default(true)
