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

export type WorkflowStatus =
  | 'DRAFT'
  | 'CON_INCIDENCIA'
  | 'PENDIENTE_NOTIFICACION'
  | 'LISTO_PARA_PAGO'
  | 'CLOSED'

export type ResolutionType =
  | 'BECA_MES'
  | 'SIN_PAGO'
  | 'RETENIDA'
  | 'DESCUENTO_DEFINITIVO'
  | 'SUSPENDIDA'
  | 'BAJA_DEFINITIVA'
  | 'EGRESADO'
  | 'REEMBOLSO_PARCIAL'

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

export type IncidentCategory = 'ASISTENCIA' | 'ACADEMICO' | 'DOCUMENTOS' | 'ADMINISTRATIVO' | 'OTRO'
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type PaymentVerifyMotivo = 'RETENIDA' | 'SUSPENDIDA' | 'BAJA'
export type BecaRetenidaOpcion = 'BECA_RETENIDA' | 'PAGO_MESES_RETENIDOS'
export type BajaOpcion = 'DEFINITIVA' | 'TEMPORAL'

export type BecaRetenidaCausa =
  | 'FALTAS_FI'
  | 'SIN_ENTREVISTA_CALIFICACIONES'
  | 'NO_ENTREGO_CALIFICACIONES_PROVISIONALES'
  | 'NO_ENTREGO_CALIFICACIONES_ORIGINALES'
  | 'OTRO'

export type SuspendidaCausa =
  | 'BAJO_PROMEDIO'
  | 'FALTAS_FORMACION_INTEGRAL'
  | 'LLEVARSE_EXTRAORDINARIO'
  | 'OTRO'

export type BajaCausa =
  | 'BAJO_PROMEDIO'
  | 'FALTAS_FORMACION_INTEGRAL'
  | 'DEJO_ESCUELA_PERSONALES'
  | 'DEJO_ESCUELA_VOCACIONAL'
  | 'DESAPARECIO'
  | 'FALTAS_REGLAMENTO'
  | 'OTRO'

// ── Domain models ──────────────────────────────────────────────────────────

export interface ScholarshipProfile {
  id: number
  user_id: number
  scholarship_type: ScholarshipType
  monthly_amount: string
  monto_apoyo: string | null
  advance_payment_eligible: boolean
  active_discount_percentage: string | null
  discount_reason: string | null
  discount_valid_until: string | null
  reticula_start_date: string | null
  reticula_end_date: string | null
  reticula_file_path: string | null
  reticula_original_name: string | null
  egreso_administrativo: string | null
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
  workflow_status: WorkflowStatus | null
  resolution_type: ResolutionType | null
  resolution_cause: string | null
  resolution_notes: string | null
  suspension_percentage: string | null
  withholding_mode: 'percentage' | 'fixed' | null
  withholding_value: string | null
  carryover_months_count: number | null
  carryover_months_detail: string | null
  carryover_percentage: string | null
  snapshot_gross_amount: string | null
  snapshot_monto_apoyo: string | null
  base_amount: string
  snapshot_discount_percentage: string | null
  snapshot_discount_reason: string | null
  discount_percentage: string
  discount_amount: string
  final_amount: string
  amount_pending_from_previous: string
  refund_amount_from_previous?: string
  total_to_pay: string
  snapshot_name: string
  snapshot_generation: string | null
  snapshot_generation_id: number | null
  snapshot_campus: string
  snapshot_scholarship_type: ScholarshipType
  atencion_observations: string | null
  atencion_labels: string[] | null
  atencion_reviewed_by_id: number | null
  atencion_reviewed_at: string | null
  pedagogia_observations: string | null
  pedagogia_reviewed_by_id: number | null
  pedagogia_reviewed_at: string | null
  notified_by_id: number | null
  notified_at: string | null
  notification_method: string | null
  locked_at: string | null
  locked_by_id: number | null
  created_at: string
  updated_at: string
  attendance_summary_snapshot?: {
    present: number
    late: number
    absent: number
    late_unconsumed: number
    total: number
    month_absent: number
  } | null
  // relations (optional when loaded)
  discounts?: ScholarshipRefrendDiscount[]
  logs?: ScholarshipRefrendLog[]
  atencion_reviewed_by?: { id: number; first_name: string; last_name: string } | null
  pedagogia_reviewed_by?: { id: number; first_name: string; last_name: string } | null
  notified_by?: { id: number; first_name: string; last_name: string } | null
}

// ── Bulk table types (master table) ───────────────────────────────────────

export interface BulkRefrendRow {
  refrend: ScholarshipRefrend
  attendance_present: number
  attendance_late: number
  attendance_late_justified: number
  attendance_late_consumed: number
  attendance_late_unconsumed: number
  attendance_absent: number
  attendance_absent_justified: number
  attendance_total: number
  last_grade: string | null
  academic_status: 'ok' | 'low_grade' | 'missing_subjects' | 'inactive'
  active_discount_pct: string
  projected_amount: string
  incidents_count: number
  incident_description: string | null
  incident_category: string | null
  incident_type: string | null
  semester_lates_unconsumed: number
  month_absent: number
  has_retardos_discount: boolean
  has_falta_discount: boolean
  profile_discount_pct: string | null
  profile_discount_valid_until: string | null
  profile_discount_reason: string | null
  pending_withholding_count: number
  pending_withholding_amount: string | null
}

export interface BulkTableParams {
  year: number
  month: number
  campus: string
  generation_id: number | null
  advance_payment_eligible?: number
  page?: number
  per_page?: number
}

export interface BulkTableMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface InlinePatchPayload {
  atencion_labels?: string[] | null
  atencion_observations?: string | null
  pedagogia_observations?: string | null
  final_amount_override?: number | null
  notification_method?: string | null
  notified_at?: string | null
}

// ── Withholding ledger (retenciones individuales) ──────────────────────────

export interface ScholarshipWithholdingPayment {
  id: number
  withholding_id: number
  applied_refrend_id: number
  amount: string
  created_at: string
  created_by?: { id: number; first_name: string; last_name: string } | null
}

export interface ScholarshipWithholding {
  id: number
  user_id: number
  origin_refrend_id: number
  period_year: number
  period_month: number
  withheld_amount: string
  paid_amount: string
  remaining_amount: string
  cause: string | null
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  payments?: ScholarshipWithholdingPayment[]
}

export interface WithholdingPaymentInput {
  withholding_id: number
  amount: number
}

// ── Situation form ─────────────────────────────────────────────────────────

export interface RecordSituationForm {
  resolution_type: ResolutionType
  resolution_cause?: string | null
  resolution_notes?: string | null
  suspension_percentage?: number | null
  withholding_mode?: 'percentage' | 'fixed' | null
  withholding_value?: number | null
  withholding_payments?: WithholdingPaymentInput[]
  refund_amount?: number | null
}

// ── Form interfaces ────────────────────────────────────────────────────────

export interface AtencionFlagForm {
  description: string
  incident_category?: IncidentCategory
}

export interface PedagogiaResolveForm {
  comment?: string | null
}

export interface RefrendPaymentVerifyForm {
  motivo: PaymentVerifyMotivo
  // RETENIDA fields
  retenida_opcion?: BecaRetenidaOpcion | null
  retenida_num_meses?: number | null
  retenida_meses_especificar?: string | null
  retenida_causa?: BecaRetenidaCausa | null
  retenida_causa_otro?: string | null
  // SUSPENDIDA fields
  suspendida_pct?: number | null
  suspendida_causa?: SuspendidaCausa | null
  suspendida_causa_otro?: string | null
  // BAJA fields
  baja_opcion?: BajaOpcion | null
  baja_causa?: BajaCausa | null
  baja_causa_otro?: string | null
  notes?: string | null
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
  class_name: string | null
  status: string
  observations: string | null
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

// ── Legacy view/form helpers ───────────────────────────────────────────────

export interface ScholarshipProfileForm {
  user_id: number
  scholarship_type: ScholarshipType
  monthly_amount: number
  monto_apoyo?: number | null
  advance_payment_eligible?: boolean
  active_discount_percentage?: number | null
  discount_reason?: string | null
  discount_valid_until?: string | null
}

export interface GeneratePeriodForm {
  year: number
  month: number
  campus: string
  generation_id: number
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
