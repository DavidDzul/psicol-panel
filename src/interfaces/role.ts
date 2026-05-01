export interface RolePivot {
  model_id: string;
  role_id: string;
  model_type: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  type: string;
  pivot: RolePivot;
}

export interface Permission {
  id: number;
  type?: string;
  [key: string]: any;
}
