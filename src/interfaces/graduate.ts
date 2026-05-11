import type { User, UserForm, UserUpdateForm } from "./user";

// Graduate is structurally identical to User — kept as alias for backward compatibility
export type Graduate = User;
export type GraduateCreateForm = UserForm;
export type GraduateUpdateForm = UserUpdateForm;
