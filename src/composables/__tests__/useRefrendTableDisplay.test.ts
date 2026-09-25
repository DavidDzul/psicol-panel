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
  advance_payment_amount: "0.00",
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
    const row = { ...buildRow(), advance_payment_amount: "0.00" };
    expect(advancePaymentRegisteredChip(row)).toBeNull();
  });

  it("returns the registered chip with the fixed label and formatted-amount tooltip", () => {
    const row = { ...buildRow(), advance_payment_amount: "1200.00" };
    const chip = advancePaymentRegisteredChip(row);
    expect(chip).not.toBeNull();
    expect(chip?.label).toBe("Pago adelantado registrado");
    expect(chip?.tooltip).toBe(
      "+$1,200.00 · Se sumará al monto de esta decisión",
    );
  });
});

describe("useRefrendTableDisplay — finalResolutionChip", () => {
  it("returns null when resolution_type is null", () => {
    const row = buildRow({ resolution_type: null });
    expect(finalResolutionChip(row.refrend)).toBeNull();
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
