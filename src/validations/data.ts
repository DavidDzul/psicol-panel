import * as yup from "yup"

export const job_type = () => yup.string().required("Campo requerido").label("Tipo de trabajo")
export const area_id = () =>
    yup
        .number()
        .required("Campo requerido")
        .transform((curr, orig) => (!orig ? undefined : curr))
        .label("Generación")
export const count = () => yup.number().required("Campo requerido").label("Total")
