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
  generation_id: string | null;
  active: boolean;
  created_at: string | null;
  updated_at: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  workstation?: string;
  campus?: string;
  roles: Array<{ id: number; name: string; [key: string]: any }>;
  [key: string]: any;
}

export interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  campus: string;
  generation_id: number | null;
  enrollment: string | null;
  password: string;
}
