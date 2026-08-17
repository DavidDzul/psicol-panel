import { describe, expect, it } from "vitest";

import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";
import { getCleanDraftIds } from "@/utils/refrendBulkClose";

// ── Fixture factory ──────────────────────────────────────────────────────────
//
// Mirrors PedagogiaRefrendTable.vue's original `cleanDraftIds` predicate
// verbatim (see design ADR — highest-risk correctness point in this change):
//   workflow_status === "DRAFT" && incidents_count === 0 &&
//   !has_falta_discount && !has_retardos_discount &&
//   month_absent === 0 && semester_lates_unconsumed < 2

const buildRefrend = (
  overrides: Partial<ScholarshipRefrend> = {},
): ScholarshipRefrend => ({
  id: 1,
  user_id: 1,
  period_year: 2026,
  period_month: 1,
  refrend_type: "NORMAL",
  status: "DRAFT",
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
  base_amount: "0",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "0",
  amount_pending_from_previous: "0",
  total_to_pay: "0",
  snapshot_name: "Fixture Becario",
  snapshot_generation: null,
  snapshot_generation_id: null,
  snapshot_campus: "CAMPUS",
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
  ...overrides,
});

const buildRow = (
  refrendOverrides: Partial<ScholarshipRefrend> = {},
  rowOverrides: Partial<BulkRefrendRow> = {},
): BulkRefrendRow => ({
  refrend: buildRefrend(refrendOverrides),
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
  pending_withholding_count: 0,
  pending_withholding_amount: null,
  advance_payment_eligible: false,
  ...rowOverrides,
});

describe("getCleanDraftIds", () => {
  it("includes a DRAFT row with zero incidents and zero discounts", () => {
    const row = buildRow();
    expect(getCleanDraftIds([row])).toEqual([row.refrend.id]);
  });

  it("excludes a row whose workflow_status is not DRAFT", () => {
    const row = buildRow({ workflow_status: "CON_INCIDENCIA" });
    expect(getCleanDraftIds([row])).toEqual([]);
  });

  it("excludes a row with incidents_count > 0", () => {
    const row = buildRow({}, { incidents_count: 1 });
    expect(getCleanDraftIds([row])).toEqual([]);
  });

  it("excludes a row with an active falta discount", () => {
    const row = buildRow({}, { has_falta_discount: true });
    expect(getCleanDraftIds([row])).toEqual([]);
  });

  it("excludes a row with an active retardos discount", () => {
    const row = buildRow({}, { has_retardos_discount: true });
    expect(getCleanDraftIds([row])).toEqual([]);
  });

  it("excludes a row with month_absent > 0", () => {
    const row = buildRow({}, { month_absent: 1 });
    expect(getCleanDraftIds([row])).toEqual([]);
  });

  it("excludes a row with semester_lates_unconsumed >= 2", () => {
    const row = buildRow({}, { semester_lates_unconsumed: 2 });
    expect(getCleanDraftIds([row])).toEqual([]);
  });

  it("includes a row with semester_lates_unconsumed === 1 (boundary, below threshold)", () => {
    const row = buildRow({}, { semester_lates_unconsumed: 1 });
    expect(getCleanDraftIds([row])).toEqual([row.refrend.id]);
  });

  it("maps to refrend.id, not row index, across a mixed set", () => {
    const clean = buildRow({ id: 42 });
    const dirty = buildRow({ id: 7 }, { incidents_count: 2 });
    expect(getCleanDraftIds([dirty, clean])).toEqual([42]);
  });

  it("returns an empty array for an empty input", () => {
    expect(getCleanDraftIds([])).toEqual([]);
  });
});
