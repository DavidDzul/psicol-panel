// ── Enums ──────────────────────────────────────────────────────────────────

// `TELMEX_IU` added by sdd/scholarship-telmex-iu-split (spec "TELMEX_IU
// scholarship type"). psicol-panel stays strictly read-only for this and
// `iu_payment_amount` below — see ScholarshipProfileCard.vue's read-only
// config block (sdd/scholarship-profile-config-to-admin).
export type ScholarshipType = 'IU' | 'TELMEX' | 'TELMEX_IU'

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

// Server-only resolution_type values that are deliberately NEVER part of
// the staff-selectable ResolutionType union above (same precedent as
// 'BAJA'). 'EGRESO_RETICULA' (sdd/egresado-status-timing) is auto-written
// by GenerateMonthlyRefrendsService for a becario's retícula month+2 $0
// refrendo — it must stay a distinct stored value from the manual
// 'EGRESADO', never conflated. RecordSituationForm.resolution_type and
// ScholarshipAdvancePaymentMonth.settled_resolution_type stay narrowed to
// ResolutionType — those are staff-selected only, never server-assigned.
export type ServerResolutionType = ResolutionType | 'BAJA' | 'EGRESO_RETICULA'

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

// ── Domain models ──────────────────────────────────────────────────────────

export interface ScholarshipProfile {
  id: number
  user_id: number
  scholarship_type: ScholarshipType
  monthly_amount: string
  monto_apoyo: string | null
  // "Pago IU" — only meaningful when scholarship_type is TELMEX_IU, `null`
  // otherwise (backend nulls it on switch-away, see
  // ScholarshipProfileController::updateConfig()). A `decimal:2` cast,
  // serializes as a STRING like monthly_amount/monto_apoyo. Read-only here —
  // never part of ScholarshipProfileForm, this field is admin-managed only
  // (see administration-panel's ScholarshipProfileConfig).
  iu_payment_amount: string | null
  temporary_increase_amount: string | null
  temporary_increase_valid_from: string | null
  temporary_increase_valid_until: string | null
  temporary_increase_reason: string | null
  temporary_increase_granted_by_id: number | null
  advance_payment_eligible: boolean
  active_discount_percentage: string | null
  discount_reason: string | null
  discount_valid_from: string | null
  discount_valid_until: string | null
  reticula_start_date: string | null
  reticula_end_date: string | null
  reticula_file_path: string | null
  reticula_original_name: string | null
  egreso_administrativo: string | null
  // sdd/egresado-baja-definitiva (design D1): the stop marker. Set once by
  // CloseScholarshipCycleAction when staff records EGRESADO or
  // BAJA_DEFINITIVA on a refrend — every later generation path (bulk, single
  // user, advance) is guarded against it. Serializes as a full ISO-8601
  // timestamp (e.g. "2026-10-01T06:00:00.000000Z"), NOT a plain date —
  // confirmed against the backend's own pinned test (PR2c,
  // AdminPanelBajaVisibilityTest) and the same quirk already documented for
  // TelmexCoverageController's start_period/end_period. Never derive MM/YYYY
  // via Date/dayjs parsing (that applies a local timezone conversion) — slice
  // the string directly, same as every other display of this field.
  cycle_closed_period: string | null
  cycle_closure_reason: 'EGRESADO' | 'BAJA_DEFINITIVA' | null
  created_at: string
  updated_at: string
  // relation (loaded via `grantedBy:id,first_name,last_name` in show()/update())
  granted_by?: { id: number; first_name: string; last_name: string } | null
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
  resolution_type: ServerResolutionType | null
  resolution_cause: string | null
  resolution_notes: string | null
  suspension_percentage: string | null
  withholding_mode: 'percentage' | 'fixed' | null
  withholding_value: string | null
  carryover_months_count: number | null
  carryover_months_detail: string | null
  snapshot_gross_amount: string | null
  snapshot_monto_apoyo: string | null
  snapshot_temporary_increase_amount: string | null
  snapshot_temporary_increase_reason: string | null
  // Telmex coverage snapshot (sdd/telmex-cobertura-iu, design D1/D2;
  // verified against ScholarshipCalculationService::buildSnapshot:168-193).
  // snapshot_telmex_coverage_id is the SOLE payability gate — null for IU
  // always, and ALSO null for TELMEX/TELMEX_IU whenever no coverage is
  // active that period. snapshot_telmex_covered_amount is a bookkeeping
  // value (monthly_amount + monto_apoyo) populated for every TELMEX/
  // TELMEX_IU refrend REGARDLESS of coverage — "never payable, never
  // discounted" until the FK is set, per the backend's own comment. Always
  // gate display/payability on the FK, never on this amount alone.
  // Optional (not required) because the backend field (PR2, not yet merged
  // at the time of this PR6 implementation) isn't frozen and this avoids
  // forcing every other ScholarshipRefrend test fixture in the repo to add
  // two more properties outside this change's scope — see PR6 apply-progress
  // for the full reasoning.
  snapshot_telmex_coverage_id?: number | null
  snapshot_telmex_covered_amount?: string | null
  base_amount: string
  snapshot_discount_percentage: string | null
  snapshot_discount_reason: string | null
  discount_percentage: string
  discount_amount: string
  final_amount: string
  amount_pending_from_previous: string
  refund_amount_from_previous?: string
  total_to_pay: string
  // Origin-refrend advance-payment indicator (sdd/pago-adelantado, design
  // D6). Lives on the refrend itself (a real column, `RecordAdvancePaymentAction`
  // writes it), unlike advance_paid/advance_paid_amount below which come
  // from a separate JOIN — that's why this one is nested here on
  // ScholarshipRefrend and NOT a top-level BulkRefrendRow field (verified
  // directly against RefrendBulkQueryService::buildTable()'s `$refrend`
  // sub-array, where this key actually lives). Always a decimal string,
  // "0.00" when nothing is registered — never null.
  advance_payment_amount: string
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
  advance_payment_eligible: boolean
  // Row indicator (sdd/pago-adelantado, design D6 + "AdvancePaidRowFields"):
  // true when THIS row's own refrend was pre-created by
  // RecordAdvancePaymentAction. Purely informational — never read by
  // PaymentReadinessEvaluator, never affects is_payable/blocking_reasons
  // (same isolation this codebase already enforces for resolution_type).
  // advance_paid_amount is a decimal string, never "0.00" (backend emits
  // null when advance_paid is false, mirroring pending_withholding_amount).
  advance_paid: boolean
  advance_paid_amount: string | null
  advance_paid_origin_year: number | null
  advance_paid_origin_month: number | null
}

export interface BulkTableParams {
  year: number
  month: number
  campus: string
  generation_id: number | null
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
  // Required only when this refrendo was previously advance-paid and the
  // resolution being applied now diverges from what was advance-paid (see
  // RecordPaymentSituationAction's arrival-time reconciliation block).
  // Optional/capturable here — the server enforces "required on divergence"
  // since a static frontend rule can't know the divergence outcome ahead of
  // the request.
  advance_divergence_reason?: string | null
}

// ── Cycle-cut guard payloads (sdd/egresado-baja-definitiva, amendments
// #1982/#1983/#1987/#1988) ───────────────────────────────────────────────
//
// EGRESADO/BAJA_DEFINITIVA are terminal cycle closures guarded, in order, by:
// already-closed (CYCLE_ALREADY_CLOSED, msg only — generic error toast, no
// structured data) -> own-abonos (plain DomainException, generic error
// toast) -> blocking later months (CYCLE_CUT_BLOCKED) -> ACTIVA Telmex
// coverage (CYCLE_CUT_ACTIVE_TELMEX_COVERAGE) -> pending withholdings
// (CYCLE_CUT_PENDING_WITHHOLDINGS). The last 3 carry a structured `data`
// payload the situation dialogs render inline instead of a generic toast
// (amendment #1988: NO acknowledge flag — any pending withholding BLOCKS
// outright, same as the other two guards).

export interface CutBlockingMonth {
  period_year: number
  period_month: number
  reason: 'ADVANCE_PAID' | 'PAID' | 'ABONOS_APPLIED'
}

export interface CutActiveTelmexCoverage {
  coverage_id: number
  status: string
  start_period: string
}

export interface CutPendingWithholding {
  id: number
  period_year: number
  period_month: number
  withheld_amount: string
  paid_amount: string
  remaining_amount: string
  /** True when this is the cut month's own retention (amendment 6). */
  is_current_refrend: boolean
}

// Discriminated result for scholarshipStore.recordPaymentSituation() (sdd/
// pago-adelantado, design D4 fix 2026-09-25). Previously this method just
// toasted a generic error and returned undefined on ANY failure — including
// the server's ADVANCE_DIVERGENCE_REQUIRED case, which left staff with no
// way to actually supply the reason and complete the resolution (a genuine
// dead end, caught by sdd-verify). "divergence_required" lets the caller
// react by showing AdvanceDivergenceReasonDialog and resubmitting the same
// form with advance_divergence_reason filled in, instead of dead-ending.
//
// "cut_blocked" (sdd/egresado-baja-definitiva PR3) covers BOTH
// CYCLE_CUT_BLOCKED (`blocking_months` set) and
// CYCLE_CUT_ACTIVE_TELMEX_COVERAGE (`telmex_coverage` set, amendment #1987)
// — exactly one of the two is ever populated on a given result, never both.
// "pending_withholdings_required" is its own status (CYCLE_CUT_PENDING_
// WITHHOLDINGS, amendment #1988) since it always carries its own list and is
// rendered as its own section in the dialog.
export type RecordSituationResult =
  | { status: 'success'; refrend: ScholarshipRefrend }
  | { status: 'divergence_required' }
  | {
      status: 'cut_blocked'
      msg: string
      blocking_months?: CutBlockingMonth[]
      telmex_coverage?: CutActiveTelmexCoverage
    }
  | { status: 'pending_withholdings_required'; msg: string; withholdings: CutPendingWithholding[] }
  | { status: 'error' }

// Narrowed view used by SituationEgresadoDialog.vue/SituationBajaDialog.vue's
// `blockResult` prop — only the 2 variants that actually carry a `msg` to
// render. Keeping the prop typed this narrow (instead of the full
// RecordSituationResult) lets template access like `blockResult.msg` type-check
// without an extra discriminant check beyond the existing `v-if="blockResult"`.
export type CutBlockResult = Extract<
  RecordSituationResult,
  { status: 'cut_blocked' | 'pending_withholdings_required' }
>

// ── Advance payment (pago adelantado) ──────────────────────────────────────

export interface AdvancePaymentMonthInput {
  year: number
  month: number
}

// months carries ONLY {year, month} pairs — amount is server-computed from
// each future refrendo's calculated final_amount (RecordAdvancePaymentAction,
// design D6). The frontend must never send an amount here.
export interface AdvancePaymentForm {
  months: AdvancePaymentMonthInput[]
  cause?: string
  notes?: string
}

export interface ScholarshipAdvancePaymentMonth {
  id: number
  advance_payment_id: number
  user_id: number
  period_year: number
  period_month: number
  amount: string
  refrend_id: number
  status: 'PENDING' | 'REACHED' | 'OVERRIDDEN'
  reached_at: string | null
  settled_resolution_type: ResolutionType | null
  divergence_reason: string | null
}

export interface ScholarshipAdvancePayment {
  id: number
  user_id: number
  origin_refrend_id: number
  origin_period_year: number
  origin_period_month: number
  months_count: number
  total_amount: string
  status: 'ACTIVE' | 'VOIDED'
  cause: string | null
  notes: string | null
  created_by_id: number | null
  months?: ScholarshipAdvancePaymentMonth[]
}

// ── Form interfaces ────────────────────────────────────────────────────────

export interface AtencionFlagForm {
  description: string
  incident_category?: IncidentCategory
}

export interface PedagogiaResolveForm {
  comment?: string | null
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
  active_discount_percentage?: number | null
  discount_reason?: string | null
  discount_valid_from?: string | null
  discount_valid_until?: string | null
  temporary_increase_amount?: number | null
  temporary_increase_valid_from?: string | null
  temporary_increase_valid_until?: string | null
  temporary_increase_reason?: string | null
  // Not persisted — signals the backend to overwrite an already-vigente
  // increase (see UpdateScholarshipProfileRequest::withValidator()).
  replace_temporary_increase?: boolean
}

export interface GeneratePeriodForm {
  year: number
  month: number
  campus: string
  generation_id: number
}

// ── Per-sede sequential generation (sdd/verificacion-incidencias-ux PR3) ────
//
// generateForPeriod's response (one call per generación, per
// GeneratePeriodForm above). `skipped` keeps its historical meaning — the
// becario already had a refrendo for this period — while
// `skipped_out_of_reticula` is new and counts becarios whose period falls
// outside their retícula window; both are reported as skips, never as
// errors. `errors` counts only genuine failures.
export type GenerateFailureKind = 'skipped_out_of_reticula' | 'error'

export interface GenerateRefrendFailure {
  user_id: number
  name: string
  reason: string
  kind: GenerateFailureKind
}

export interface GenerateRefrendsResult {
  created: number
  skipped: number
  skipped_out_of_reticula: number
  errors: number
  failures: GenerateRefrendFailure[]
}

// One entry per generación processed by useSedeRefrendGeneration's
// sequential loop. `result` is present on success; `requestError` is set
// instead when the HTTP call itself failed (network/server error) — the
// loop continues to the next generación either way, so a run can end with
// a mix of both across its summaries.
export interface GenerationRunSummary {
  generationId: number
  generationName: string
  result?: GenerateRefrendsResult
  requestError?: string
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
