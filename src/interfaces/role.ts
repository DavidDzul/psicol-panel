export interface RolePivot {
  model_id: string;
  role_id: string;
  model_type: string;
}

export interface RoleConfiguration {
  unlimited_jobs: boolean;
  num_job_vacancies: number;
  unlimited_professionals: boolean;
  num_professional_vacancies: number;
  unlimited_jr: boolean;
  num_jr_vacancies: number;
  unlimited_visualizations: boolean;
  num_visualizations: number;
}

export interface Permission {
  id: number;
  name: string;
  type?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  type: string;
  pivot: RolePivot;
  configuration?: RoleConfiguration;
  permissions?: Permission[];
}

export interface RoleForm {
  unlimited_jobs: boolean;
  num_job_vacancies: number;
  unlimited_professionals: boolean;
  num_professional_vacancies: number;
  unlimited_jr: boolean;
  num_jr_vacancies: number;
  unlimited_visualizations: boolean;
  num_visualizations: number;
  permissions_ids: number[];
}
