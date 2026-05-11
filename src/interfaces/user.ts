export type UserType = "BEC_ACTIVE" | "BEC_INACTIVE" | "ADMIN" | "BUSINESS";

export interface User {
  id: number;
  enrollment: string | null;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  phone: string;
  workstation: string | null;
  user_type: UserType;
  campus: string;
  generation_id: number | null;
  active: boolean;
  created_at: string | null;
  updated_at: string;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  workstation?: string;
  campus?: string;
  roles: UserRole[];
}

export interface UserProfileForm {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirmation: string;
}

export interface UserForm {
  user_type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  campus: string;
  generation_id: number | null;
  enrollment: string | null;
  password: string;
}

export interface UserUpdateForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  campus: string;
  generation_id: number | null;
  enrollment: string | null;
  password?: string;
  active: boolean;
  user_type: UserType;
}
