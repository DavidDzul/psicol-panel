export interface ClassEntity {
  id: number
  name: string
  date: string
  start_time: string
  end_time: string
  campus?: string
  generation_id?: number
  generation_name?: string
}

export interface ClassAttendance {
  id: number
  status: string
  check_in: string | null
  check_out: string | null
  observations: string | null
  user: {
    id: number
    first_name: string
    last_name: string
    enrollment: string | null
    email: string
  }
}

export interface ClassForm {
  class_name: string
  class_date: string
  class_start_time: string
  class_end_time: string
  campus: string
  generation_id: number
}

export interface ClassUpdateForm {
  class_name: string
}

export interface ClassUserForm {
  class_status: string
  class_observation: string
  class_start_time: string
  class_end_time: string
}

export interface ReportSemesterForm {
  campus: string
  generation_id: number
  year: number
  semester: number
  format: number
}

export interface AssignUsersFilter {
  campus: string | null
  generation_id: number | null
}

export interface AssignedUserId {
  user_id: number | string
}
