export type JobApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface JobApplication {
  id: number
  user_id: number
  status: JobApplicationStatus
  rejected_reason: string | null
  rejected_other: string | null
  created_at: string
  vacant: {
    vacant_name: string
  }
  user: {
    first_name: string
    last_name: string
  }
}

export interface RejectedApplicationForm {
  rejected_reason: string | null
  rejected_other: string
  status: string
}
