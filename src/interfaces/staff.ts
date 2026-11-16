export type PermissionKind = "menu-group" | "page" | "action";

export interface StaffRole {
  id: number;
  name: string;
  type: "ADMIN";
  permissions_ids: number[];
  users_count: number;
}

export interface StaffPermission {
  id: number;
  name: string;
  description: string;
  kind: PermissionKind;
  menu_group: string | null;
}

export interface StaffPermissionModule {
  module: string;
  permissions: StaffPermission[];
}

export interface StaffAdministratorRole {
  id: number;
  name: string;
  is_obsolete: boolean;
}

export interface StaffAdministrator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  campus: string;
  active: boolean;
  role: StaffAdministratorRole | null;
  is_root: boolean;
  is_editable: boolean;
}

export interface CreateStaffRolePayload {
  name: string;
}

export interface CreateStaffAdministratorPayload {
  first_name: string;
  last_name: string;
  email: string;
  campus: string;
  role_id: number;
  password: string;
  password_confirmation: string;
}

export interface ResetStaffPasswordPayload {
  password: string;
  password_confirmation: string;
}
