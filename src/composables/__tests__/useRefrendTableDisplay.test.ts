import { describe, expect, it } from "vitest";
import {
  isLocked,
  LOCKED_STATUSES,
  rowClass,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// ── Fixtures ──────────────────────────────────────────────────────────────

const baseRefrend: ScholarshipRefrend = {
  id: 1,
  user_id: 1,
  period_year: 2026,
  period_month: 1,
  refrend_type: "NORMAL",
  status: "PAID",
  workflow_status: "DRAFT",
  resolution_type: null,
  resolution_cause: null,
  resolution_notes: null,
  suspension_percentage: null,
  withholding_mode: null,
  withholding_value: null,
  carryover_months_count: null,
  carryover_months_detail: null,
  carryover_percentage: null,
  snapshot_gross_amount: null,
  snapshot_monto_apoyo: null,
  base_amount: "1000",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "1000",
  amount_pending_from_previous: "0",
  total_to_pay: "1000",
  snapshot_name: "Test Becario",
  snapshot_generation: "Gen 1",
  snapshot_generation_id: 1,
  snapshot_campus: "CDMX",
  snapshot_scholarship_type: "IU",
  atencion_observations: null,
  atencion_labels: null,
  atencion_reviewed_by_id: null,
  atencion_reviewed_at: null,
  pedagogia_observations: null,
  pedagogia_reviewed_by_id: null,
  pedagogia_reviewed_at: null,
  notified_by_id: null,
  notified_at: null,
  notification_method: null,
  locked_at: null,
  locked_by_id: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

const buildRow = (
  overrides: Partial<ScholarshipRefrend> = {},
): BulkRefrendRow => ({
  refrend: { ...baseRefrend, ...overrides },
  attendance_present: 0,
  attendance_late: 0,
  attendance_late_justified: 0,
  attendance_late_consumed: 0,
  attendance_late_unconsumed: 0,
  attendance_absent: 0,
  attendance_absent_justified: 0,
  attendance_total: 0,
  last_grade: null,
  academic_status: "ok",
  active_discount_pct: "0",
  projected_amount: "0",
  incidents_count: 0,
  incident_description: null,
  incident_category: null,
  incident_type: null,
  semester_lates_unconsumed: 0,
  month_absent: 0,
  has_retardos_discount: false,
  has_falta_discount: false,
  profile_discount_pct: null,
  profile_discount_valid_until: null,
  profile_discount_reason: null,
});

// ── isLocked re-export (design ADR D5 single source of truth) ──────────────
// useRefrendTableDisplay.ts no longer implements isLocked locally — it
// re-exports refrendActionability.ts. This is a regression guard: existing
// consumers (e.g. PedagogiaRefrendTable.vue) import isLocked/LOCKED_STATUSES
// from this module and must keep working after the Phase 2 refactor.

describe("useRefrendTableDisplay — isLocked re-export", () => {
  it("re-exports the same LOCKED_STATUSES set used by refrendActionability", () => {
    expect(LOCKED_STATUSES.has("PAID")).toBe(true);
    expect(LOCKED_STATUSES.has("AUTHORIZED")).toBe(true);
    expect(LOCKED_STATUSES.has("CANCELLED")).toBe(true);
    expect(LOCKED_STATUSES.has("DRAFT" as never)).toBe(false);
  });

  it("treats a legacy-locked status as locked", () => {
    const row = buildRow({ status: "PAID", workflow_status: "LISTO_PARA_PAGO" });
    expect(isLocked(row.refrend)).toBe(true);
  });

  it("treats workflow_status CLOSED as locked regardless of legacy status", () => {
    const row = buildRow({ status: "WITHHELD", workflow_status: "CLOSED" });
    expect(isLocked(row.refrend)).toBe(true);
  });

  it("treats a fully unlocked refrend as not locked", () => {
    const row = buildRow({ status: "WITHHELD", workflow_status: "DRAFT" });
    expect(isLocked(row.refrend)).toBe(false);
  });
});

describe("useRefrendTableDisplay — statusChip / rowClass (unchanged behavior)", () => {
  it("labels a DRAFT workflow_status as Borrador", () => {
    const row = buildRow({ workflow_status: "DRAFT" });
    expect(statusChip(row.refrend).label).toBe("Borrador");
    expect(rowClass(row)).toBe("row-pending");
  });

  it("labels a CON_INCIDENCIA workflow_status as Con incidencia", () => {
    const row = buildRow({ workflow_status: "CON_INCIDENCIA" });
    expect(statusChip(row.refrend).label).toBe("Con incidencia");
    expect(rowClass(row)).toBe("row-incident");
  });
});
