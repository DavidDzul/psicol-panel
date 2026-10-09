import { describe, expect, it } from "vitest";
import {
  advancePaymentChip,
  advancePaymentRegisteredChip,
  BASE_HEADERS,
  finalResolutionChip,
  isLocked,
  LOCKED_STATUSES,
  pendingWithholdingChip,
  rowClass,
  statusChip,
  telmexCoverageChip,
  temporaryIncreaseChip,
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
  snapshot_gross_amount: null,
  snapshot_monto_apoyo: null,
  snapshot_temporary_increase_amount: null,
  snapshot_temporary_increase_reason: null,
  base_amount: "1000",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "1000",
  amount_pending_from_previous: "0",
  total_to_pay: "1000",
  advance_payment_amount: "0.00",
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
  pending_withholding_count: 0,
  pending_withholding_amount: null,
  advance_payment_eligible: false,
  advance_paid: false,
  advance_paid_amount: null,
  advance_paid_origin_year: null,
  advance_paid_origin_month: null,
});

// ── isLocked re-export (design ADR D5 single source of truth) ──────────────
// useRefrendTableDisplay.ts no longer implements isLocked locally — it
// re-exports refrendActionability.ts. This is a regression guard: existing
// consumers (e.g. AprobacionRefrendTable.vue) import isLocked/LOCKED_STATUSES
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

describe("useRefrendTableDisplay — pendingWithholdingChip", () => {
  it("returns null when count is 0", () => {
    const row = { ...buildRow(), pending_withholding_count: 0, pending_withholding_amount: null };
    expect(pendingWithholdingChip(row)).toBeNull();
  });

  it("returns null when amount is missing even if count leaks through as > 0", () => {
    const row = { ...buildRow(), pending_withholding_count: 1, pending_withholding_amount: null };
    expect(pendingWithholdingChip(row)).toBeNull();
  });

  it("uses singular wording for exactly 1 pending withholding", () => {
    const row = {
      ...buildRow(),
      pending_withholding_count: 1,
      pending_withholding_amount: "300.00",
    };
    const chip = pendingWithholdingChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.tooltip).toBe("1 retención pendiente · $300.00");
  });

  it("uses plural wording and the formatted total for multiple pending withholdings", () => {
    const row = {
      ...buildRow(),
      pending_withholding_count: 3,
      pending_withholding_amount: "1500.50",
    };
    const chip = pendingWithholdingChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.label).toBe("$1,500.50");
    expect(chip?.tooltip).toBe("3 retenciones pendientes · $1,500.50 en total");
  });
});

describe("useRefrendTableDisplay — advancePaymentChip", () => {
  it("returns null when advance_paid is false", () => {
    const row = { ...buildRow(), advance_paid: false, advance_paid_amount: "500.00" };
    expect(advancePaymentChip(row)).toBeNull();
  });

  it("returns null when advance_paid is true but amount is missing", () => {
    const row = { ...buildRow(), advance_paid: true, advance_paid_amount: null };
    expect(advancePaymentChip(row)).toBeNull();
  });

  it("returns the formatted amount and origin month/year in the tooltip", () => {
    const row = {
      ...buildRow(),
      advance_paid: true,
      advance_paid_amount: "850.00",
      advance_paid_origin_year: 2026,
      advance_paid_origin_month: 7,
    };
    const chip = advancePaymentChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.label).toBe("$850.00");
    expect(chip?.tooltip).toBe("Pago adelantado · lote de Julio 2026 · $850.00");
  });

  it("falls back to a tooltip without the origin period when year/month are missing", () => {
    const row = {
      ...buildRow(),
      advance_paid: true,
      advance_paid_amount: "300.00",
      advance_paid_origin_year: null,
      advance_paid_origin_month: null,
    };
    const chip = advancePaymentChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.tooltip).toBe("Pago adelantado · $300.00");
  });
});

describe("useRefrendTableDisplay — advancePaymentRegisteredChip (PR8, origin-refrend indicator)", () => {
  // OPPOSITE direction from advancePaymentChip: that one marks a row that IS
  // a future month settled by someone else's advance batch (advance_paid
  // family). This one marks a row that itself HAS a batch registered against
  // it — this row is the origin refrend. Backend emits advance_payment_amount
  // as a decimal string, "0.00" when nothing is registered, never null.

  // PR9: the caller (AprobacionRefrendTable.vue / VerificacionRefrendTable.vue)
  // now renders this chip's output inline inside the actions cell instead of
  // through a dedicated "Adelanto registrado" column — BASE_HEADERS must no
  // longer carry an entry for advance_payment_amount.
  it("is not present in BASE_HEADERS as its own column", () => {
    expect(BASE_HEADERS.some((h) => h.key === "advance_payment_amount")).toBe(
      false,
    );
  });

  it('returns null when advance_payment_amount is "0.00" (no batch registered against this row)', () => {
    const row = buildRow({ advance_payment_amount: "0.00" });
    expect(advancePaymentRegisteredChip(row)).toBeNull();
  });

  it("returns the registered chip with the fixed label and formatted-amount tooltip", () => {
    const row = buildRow({ advance_payment_amount: "1200.00" });
    const chip = advancePaymentRegisteredChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.label).toBe("Pago adelantado registrado");
    expect(chip?.tooltip).toBe(
      "+$1,200.00 · Se sumará al monto de esta decisión",
    );
  });

  // Regression: Number(undefined) is NaN, and `NaN <= 0` is FALSE in JS —
  // a plain "<= 0" guard lets a missing/malformed field slip through and
  // render "+NaN" in the tooltip instead of hiding the chip (live bug
  // report). ScholarshipRefrend's type claims this field is always a
  // string, but that's not a runtime guarantee (e.g. a stale/partial API
  // response), so the guard must not trust the type.
  it('treats a missing or non-numeric advance_payment_amount as nothing to show (never renders "+NaN")', () => {
    const row = buildRow();
    // @ts-expect-error — simulating a field genuinely missing at runtime,
    // despite the type saying it can't be.
    delete row.refrend.advance_payment_amount;
    expect(advancePaymentRegisteredChip(row)).toBeNull();
  });
});

describe("useRefrendTableDisplay — temporaryIncreaseChip (sdd/temporary-increase-visibility P2c)", () => {
  // The new column is always visible — unlike the removed "Aum. temporal"
  // optional column, so it must live in BASE_HEADERS, appended right after
  // "advance_paid_amount" (design D4/spec P2c).
  it('appears exactly once in BASE_HEADERS, keyed "snapshot_temporary_increase_amount"', () => {
    const matches = BASE_HEADERS.filter(
      (h) => h.key === "snapshot_temporary_increase_amount",
    );
    expect(matches).toHaveLength(1);
  });

  it("returns null when the amount is null", () => {
    const row = buildRow({ snapshot_temporary_increase_amount: null });
    expect(temporaryIncreaseChip(row)).toBeNull();
  });

  it('returns null when the amount is "0.00" (no active increase this period)', () => {
    const row = buildRow({ snapshot_temporary_increase_amount: "0.00" });
    expect(temporaryIncreaseChip(row)).toBeNull();
  });

  it("returns the formatted amount and a tooltip with the reason when present", () => {
    const row = buildRow({
      snapshot_temporary_increase_amount: "500.00",
      snapshot_temporary_increase_reason: "Ajuste de beca",
    });
    const chip = temporaryIncreaseChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.label).toBe("$500.00");
    expect(chip?.tooltip).toBe(
      "Aumento temporal · Motivo: Ajuste de beca · Ya incluido en Base",
    );
  });

  it("falls back to a tooltip without the reason when none is set", () => {
    const row = buildRow({
      snapshot_temporary_increase_amount: "150.50",
      snapshot_temporary_increase_reason: null,
    });
    const chip = temporaryIncreaseChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.tooltip).toBe("Aumento temporal · $150.50 · Ya incluido en Base");
  });

  // Regression lock (design D4): snapshot_temporary_increase_amount/_reason
  // are real scholarship_refrends columns, so RefrendBulkQueryService nests
  // them inside `row.refrend`, NOT top-level — the exact bug class already
  // fixed once for advancePaymentRegisteredChip (always-undefined top-level
  // read). A top-level-only fixture must yield null, never read through.
  it("reads row.refrend.snapshot_temporary_increase_amount, NOT a top-level field (regression lock)", () => {
    const row = buildRow({ snapshot_temporary_increase_amount: null });
    // Simulate a fixture that only has the field at the (wrong) top level —
    // the helper must still see nothing, because it never reads row.* for
    // this data.
    const polluted = { ...row, snapshot_temporary_increase_amount: "999.00" } as typeof row &
      Record<string, unknown>;
    expect(temporaryIncreaseChip(polluted)).toBeNull();
  });
});

describe("useRefrendTableDisplay — telmexCoverageChip (sdd/telmex-cobertura-iu PR6)", () => {
  // snapshot_telmex_coverage_id is the SOLE payability/display gate (design
  // D1/D2, verified against ScholarshipCalculationService::buildSnapshot:
  // 168-193). snapshot_telmex_covered_amount is a bookkeeping value
  // populated for every TELMEX/TELMEX_IU refrend REGARDLESS of coverage, so
  // a null/missing FK must hide the chip even when the amount is a real
  // positive number.
  it("returns null when snapshot_telmex_coverage_id is null (not covered)", () => {
    const row = buildRow({
      snapshot_telmex_coverage_id: null,
      snapshot_telmex_covered_amount: "3500.00",
    });
    expect(telmexCoverageChip(row)).toBeNull();
  });

  it("returns null when snapshot_telmex_coverage_id is missing (field not yet present at runtime)", () => {
    const row = buildRow();
    // Field is optional on ScholarshipRefrend (PR2's backend contract isn't
    // frozen yet) — deleting it simulates a backend response from before
    // PR2 ships the field, same defensive precedent as
    // advancePaymentRegisteredChip's missing-field guard.
    delete row.refrend.snapshot_telmex_coverage_id;
    expect(telmexCoverageChip(row)).toBeNull();
  });

  it("returns the chip with a fixed label and the formatted covered amount in the tooltip when the FK is set", () => {
    const row = buildRow({
      snapshot_telmex_coverage_id: 7,
      snapshot_telmex_covered_amount: "3500.00",
    });
    const chip = telmexCoverageChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.label).toBe("Cobertura IU");
    expect(chip?.tooltip).toBe(
      "Cobertura Telmex por IU vigente · $3,500.00 cubierto este mes",
    );
  });

  it("still returns the chip even if the covered amount is unexpectedly null while the FK is set (gate is always the FK, never the amount)", () => {
    const row = buildRow({
      snapshot_telmex_coverage_id: 7,
      snapshot_telmex_covered_amount: null,
    });
    const chip = telmexCoverageChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.tooltip).toBe(
      "Cobertura Telmex por IU vigente · $0.00 cubierto este mes",
    );
  });
});

describe("useRefrendTableDisplay — finalResolutionChip", () => {
  // resolution_type stays null for a refrend approved via the quick
  // "Aprobar" path when nothing was forgiven (ApproveFullPaymentAction) —
  // that does NOT always mean 100%: an active academic discount is kept
  // (not touched) by that action, so the chip must be derived from the
  // real discount_percentage instead of assuming full payment (live user
  // report 2026-09-27 — showing "100%" unconditionally would be a false
  // claim for a row that was actually paid at a discount).
  it("falls back to a clean-payment chip when resolution_type is null and discount_percentage is 0", () => {
    const row = buildRow({ resolution_type: null, discount_percentage: "0" });
    expect(finalResolutionChip(row.refrend)).toEqual({
      label: "Pago sin penalización",
      color: "green",
      icon: "mdi-cash-check",
    });
  });

  it("falls back to an academic-discount chip when resolution_type is null but discount_percentage is non-zero", () => {
    const row = buildRow({ resolution_type: null, discount_percentage: "20" });
    expect(finalResolutionChip(row.refrend)).toEqual({
      label: "Descuento académico 20%",
      color: "blue",
      icon: "mdi-school-outline",
    });
  });

  it("returns the resolution chip even when workflow_status is CLOSED (Pagado) — unlike statusChip", () => {
    const row = buildRow({ workflow_status: "CLOSED", resolution_type: "RETENIDA" });
    expect(finalResolutionChip(row.refrend)).toEqual({
      label: "Retenida",
      color: "amber-darken-2",
      icon: "mdi-lock-outline",
    });
    // statusChip collapses to the generic Pagado label for the same row.
    expect(statusChip(row.refrend).label).toBe("Pagado");
  });

  it("covers REEMBOLSO_PARCIAL", () => {
    const row = buildRow({ workflow_status: "CLOSED", resolution_type: "REEMBOLSO_PARCIAL" });
    expect(finalResolutionChip(row.refrend)).toEqual({
      label: "Reembolso parcial",
      color: "teal",
      icon: "mdi-cash-refund",
    });
  });

  it("includes the suspension percentage for SUSPENDIDA", () => {
    const row = buildRow({
      workflow_status: "CLOSED",
      resolution_type: "SUSPENDIDA",
      suspension_percentage: "50",
    });
    expect(finalResolutionChip(row.refrend)?.label).toBe("Suspendido 50%");
  });

  // sdd/egresado-status-timing (design D7/R1): server-only auto-generated
  // resolution_type for the retícula month+2 $0 egreso refrendo. Must be
  // distinct from the manual EGRESADO chip (icon AND color) so a future
  // maintainer can't confuse the two in either UI or code.
  it("covers EGRESO_RETICULA with a distinct label from the manual EGRESADO chip", () => {
    const row = buildRow({ workflow_status: "CLOSED", resolution_type: "EGRESO_RETICULA" });
    expect(finalResolutionChip(row.refrend)).toEqual({
      label: "Egresado (retícula)",
      color: "indigo",
      icon: "mdi-account-clock-outline",
    });
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

  it("labels a resolved BECA_MES row with a distinct label (not the generic 'Listo para pago')", () => {
    const row = buildRow({
      workflow_status: "LISTO_PARA_PAGO",
      resolution_type: "BECA_MES",
    });
    const chip = statusChip(row.refrend);
    expect(chip.label).toBe("Pago sin penalización");
    expect(chip.label).not.toBe("Listo para pago");
  });

  it("labels a resolved RETENIDA row as 'Retenida' with the amber chip", () => {
    const row = buildRow({
      workflow_status: "LISTO_PARA_PAGO",
      resolution_type: "RETENIDA",
    });
    const chip = statusChip(row.refrend);
    expect(chip.label).toBe("Retenida");
    expect(chip.color).toBe("amber-darken-2");
  });

  it("labels a resolved DESCUENTO_DEFINITIVO row with a distinct label/color from RETENIDA", () => {
    const row = buildRow({
      workflow_status: "LISTO_PARA_PAGO",
      resolution_type: "DESCUENTO_DEFINITIVO",
    });
    const chip = statusChip(row.refrend);
    expect(chip.label).toBe("Descuento definitivo");
    expect(chip.color).toBe("purple-darken-2");
    expect(chip.icon).toBe("mdi-cash-minus");
    expect(chip.label).not.toBe("Retenida");
    expect(chip.color).not.toBe("amber-darken-2");
  });
});

// sdd/egresado-status-timing (design R1, HIGH severity): statusChip()'s
// `workflow_status === "CLOSED"` branch short-circuits BEFORE the resolution
// branch, so fixing only `_resolutionTypeMeta` (finalResolutionChip's chip)
// is NOT enough — the Estado column would still read the generic "Pagado"
// for a never-paid $0 egreso row unless statusChip() gets its own override.
describe("useRefrendTableDisplay — statusChip CLOSED override for EGRESO_RETICULA (sdd/egresado-status-timing, design R1)", () => {
  it("renders the distinct egreso-retícula chip instead of the generic Pagado label", () => {
    const row = buildRow({ workflow_status: "CLOSED", resolution_type: "EGRESO_RETICULA" });
    const chip = statusChip(row.refrend);
    expect(chip).toEqual({
      label: "Egresado (retícula)",
      color: "indigo",
      icon: "mdi-account-clock-outline",
    });
    expect(chip.label).not.toBe("Pagado");
  });

  it("regression guard: a CLOSED row with the manual EGRESADO resolution_type still reads Pagado, byte-identically", () => {
    const row = buildRow({ workflow_status: "CLOSED", resolution_type: "EGRESADO" });
    expect(statusChip(row.refrend)).toEqual({
      label: "Pagado",
      color: "teal",
      icon: "mdi-cash-check",
    });
  });

  it("regression guard: every other CLOSED row keeps the generic Pagado label byte-identically", () => {
    const row = buildRow({ workflow_status: "CLOSED", resolution_type: "RETENIDA" });
    expect(statusChip(row.refrend)).toEqual({
      label: "Pagado",
      color: "teal",
      icon: "mdi-cash-check",
    });
  });

  it("the EGRESO_RETICULA chip is visually distinct (icon AND color) from the manual EGRESADO chip, on both chip paths, side by side", () => {
    const egresoReticulaRow = buildRow({
      workflow_status: "CLOSED",
      resolution_type: "EGRESO_RETICULA",
    });
    const egresadoManualRow = buildRow({
      workflow_status: "CLOSED",
      resolution_type: "EGRESADO",
    });

    // Path 1: statusChip (Estado column)
    const statusEgresoReticula = statusChip(egresoReticulaRow.refrend);
    const statusEgresadoManual = statusChip(egresadoManualRow.refrend);
    expect(statusEgresoReticula.label).not.toBe(statusEgresadoManual.label);
    expect(statusEgresoReticula.icon).not.toBe(statusEgresadoManual.icon);
    expect(statusEgresoReticula.color).not.toBe(statusEgresadoManual.color);

    // Path 2: finalResolutionChip (Estado final column) — a distinct code
    // path from statusChip, exercised independently so a broken
    // _resolutionTypeMeta entry can't hide behind a passing statusChip test.
    const finalEgresoReticula = finalResolutionChip(egresoReticulaRow.refrend);
    const finalEgresadoManual = finalResolutionChip(egresadoManualRow.refrend);
    expect(finalEgresoReticula).not.toBeNull();
    expect(finalEgresadoManual).not.toBeNull();
    expect(finalEgresoReticula?.icon).not.toBe(finalEgresadoManual?.icon);
    expect(finalEgresoReticula?.color).not.toBe(finalEgresadoManual?.color);

    // Both chip paths agree with each other for the same resolution_type —
    // the two rendering code paths must look the same to a user.
    expect(statusEgresoReticula).toEqual(finalEgresoReticula);
  });
});
