// ── Enums ──────────────────────────────────────────────────────────────────

export type ScholarshipType = 'IU' | 'TELMEX'

export type RefrendType = 'NORMAL' | 'RETENCION' | 'REEMBOLSO'

export type RefrendStatus =
  | 'DRAFT'
  | 'ATENCION_REVIEW'
  | 'PEDAGOGIA_REVIEW'
  | 'AUTHORIZED'
  | 'PAID'
  | 'WITHHELD'
  | 'CANCELLED'

export type DiscountType =
  | 'RETARDOS'
  | 'FALTA_INJUSTIFICADA'
  | 'PROMEDIO_BAJO'
  | 'DOCUMENTOS'
  | 'RECAUDACION'
  | 'OTRO'

export type DocumentType =
  | 'CONSTANCIA_ESTUDIOS'
  | 'COMPROBANTE_PAGO'
  | 'JUSTIFICANTE_MEDICO'
  | 'OTRO'

export type DocumentStatus = 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'

// ── Domain models ──────────────────────────────────────────────────────────

export interface ScholarshipProfile {
  id: number
  user_id: number
  scholarship_type: ScholarshipType
  monthly_amount: string
  active_discount_percentage: string | null
  discount_valid_until: string | null
  reticula_start_date: string | null
  reticula_end_date: string | null
  reticula_file_path: string | null
  reticula_original_name: string | null
  created_at: string
  updated_at: string
}

export interface ScholarshipSemesterGrade {
  id: number
  user_id: number
  semester_year: number
  semester_period: 1 | 2
  semester_label: string
  grade: string | null
  is_original: boolean
  file_path: string | null
  original_name: string | null
  mime_type: string | null
  file_size: number | null
  uploaded_by_id: number | null
  created_at: string
  updated_at: string
}

export interface ScholarshipRefrendDiscount {
  id: number
  scholarship_refrend_id: number
  discount_type: DiscountType
  discount_percentage: string
  description: string | null
  created_at: string
}

export interface ScholarshipLateConsumption {
  id: number
  scholarship_refrend_discount_id: number
  attendance_id: number
}

export interface ScholarshipRefrend {
  id: number
  user_id: number
  period_year: number
  period_month: number
  refrend_type: RefrendType
  status: RefrendStatus
  base_amount: string
  discount_percentage: string
  discount_amount: string
  final_amount: string
  amount_pending_from_previous: string
  total_to_pay: string
  snapshot_name: string
  snapshot_generation: string | null
  snapshot_campus: string
  snapshot_scholarship_type: ScholarshipType
  atencion_observations: string | null
  atencion_labels: string[] | null
  atencion_reviewed_by_id: number | null
  atencion_reviewed_at: string | null
  pedagogia_observations: string | null
  pedagogia_reviewed_by_id: number | null
  pedagogia_reviewed_at: string | null
  locked_at: string | null
  locked_by_id: number | null
  created_at: string
  updated_at: string
  // relations (optional when loaded)
  discounts?: ScholarshipRefrendDiscount[]
  logs?: ScholarshipRefrendLog[]
  atencion_reviewed_by?: { id: number; first_name: string; last_name: string } | null
  pedagogia_reviewed_by?: { id: number; first_name: string; last_name: string } | null
}

export interface StudentDocument {
  id: number
  user_id: number
  document_type: DocumentType
  period_year: number
  period_month: number
  status: DocumentStatus
  file_path: string
  original_name: string
  mime_type: string
  file_size: number
  rejected_reason: string | null
  description: string | null
  observations: string | null
  created_at: string
  updated_at: string
}

export interface ScholarshipRefrendLog {
  id: number
  scholarship_refrend_id: number
  performed_by_id: number
  action: string
  notes: string | null
  created_at: string
  performed_by?: { id: number; first_name: string; last_name: string } | null
}

export interface AttendanceSummaryRecord {
  id: number
  class_date: string | null
  status: string
  late_penalty_consumed: boolean
}

export interface AttendanceSummary {
  total: number
  present: number
  late: number
  late_justified: number
  late_consumed: number
  late_unconsumed: number
  absent_unjustified: number
  absent_justified: number
  semester_start: string
  semester_end: string
  records: AttendanceSummaryRecord[]
}

// ── View/form helpers ──────────────────────────────────────────────────────

export interface ScholarshipProfileForm {
  user_id: number
  scholarship_type: ScholarshipType
  monthly_amount: number
  active_discount_percentage?: number | null
  discount_valid_until?: string | null
}

export interface GeneratePeriodForm {
  year: number
  month: number
  campus?: string | null
}

export interface ReviewForm {
  observations?: string | null
  labels?: string[] | null
}

export interface AuthorizeForm {
  final_amount_override?: number | null
  authorization_notes?: string | null
}

export interface GraduateForm {
  comment: string
}
