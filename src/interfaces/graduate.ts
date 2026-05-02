import type { UserType } from './user'

export interface Graduate {
  id: number
  user_type: UserType
  enrollment: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  campus: string
  generation_id: number | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface GraduateCreateForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  campus: string
  generation_id: number | null
  enrollment: string
  password: string
}

export interface GraduateUpdateForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  enrollment: string
  password?: string
  active: boolean
  user_type: UserType
}
