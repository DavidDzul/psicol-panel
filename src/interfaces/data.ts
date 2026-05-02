export interface Area {
  id: number
  name: string
}

export interface CandidateData {
  id: number
  area_id: number
  user_type: string
  campus: string
  job_type: string
  count: number
}

export interface AreaForm {
  name: string
}

export interface CandidateDataForm {
  id?: number
  user_type: string
  campus: string
  job_type: string
  area_id: number
  count: number
}
