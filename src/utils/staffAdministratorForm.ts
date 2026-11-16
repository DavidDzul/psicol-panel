export interface StaffAdministratorFormValues {
  first_name: string;
  last_name: string;
  email: string;
  campus: string;
  role_id: number | null;
  password: string;
  password_confirmation: string;
}

export type StaffAdministratorFormErrors = Partial<
  Record<keyof StaffAdministratorFormValues, string>
>;

const REQUIRED = "Campo requerido";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Staff passwords are free-form (decision-pr4b): required + confirmation only.
export const validateStaffAdministratorForm = (
  values: StaffAdministratorFormValues,
): StaffAdministratorFormErrors => {
  const errors: StaffAdministratorFormErrors = {};

  if (!values.first_name.trim()) errors.first_name = REQUIRED;
  if (!values.last_name.trim()) errors.last_name = REQUIRED;
  if (!values.email.trim()) errors.email = REQUIRED;
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Correo electrónico inválido";
  if (!values.campus) errors.campus = REQUIRED;
  if (values.role_id === null) errors.role_id = REQUIRED;
  if (!values.password) errors.password = REQUIRED;

  if (!values.password_confirmation) errors.password_confirmation = REQUIRED;
  else if (values.password_confirmation !== values.password) {
    errors.password_confirmation = "Las contraseñas no coinciden.";
  }

  return errors;
};
