import { describe, expect, it } from "vitest";

import type {
  RefrendStatus,
  ScholarshipRefrend,
  WorkflowStatus,
} from "@/interfaces/scholarship";
import {
  canAtencion,
  canPedagogia,
  canRecordSituation,
  isLocked,
} from "@/utils/refrendActionability";

// Minimal fixture factory: only status/workflow_status vary per test; the
// rest of ScholarshipRefrend's required fields get harmless defaults.
const buildRefrend = (
  status: RefrendStatus,
  workflow_status: WorkflowStatus | null,
): ScholarshipRefrend => ({
  id: 1,
  user_id: 1,
  period_year: 2026,
  period_month: 1,
  refrend_type: "NORMAL",
  status,
  workflow_status,
  resolution_type: null,
  resolution_cause: null,
  resolution_notes: null,
  suspension_percentage: null,
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
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

describe("isLocked", () => {
  it("is false for an unlocked legacy status with an active workflow_status", () => {
    expect(isLocked(buildRefrend("DRAFT", "DRAFT"))).toBe(false);
  });

  it("is true when legacy status is PAID regardless of workflow_status", () => {
    expect(isLocked(buildRefrend("PAID", "LISTO_PARA_PAGO"))).toBe(true);
  });

  it("is true when legacy status is AUTHORIZED regardless of workflow_status", () => {
    expect(isLocked(buildRefrend("AUTHORIZED", "LISTO_PARA_PAGO"))).toBe(true);
  });

  it("is true when legacy status is CANCELLED even with a null workflow_status (legacy fallback)", () => {
    expect(isLocked(buildRefrend("CANCELLED", null))).toBe(true);
  });

  it("short-circuits true when workflow_status is CLOSED even if legacy status is unlocked", () => {
    expect(isLocked(buildRefrend("DRAFT", "CLOSED"))).toBe(true);
  });

  it("is false for a non-locked legacy status with workflow_status in review", () => {
    expect(isLocked(buildRefrend("WITHHELD", "CON_INCIDENCIA"))).toBe(false);
  });
});

describe("canAtencion", () => {
  it("is true for DRAFT when unlocked", () => {
    expect(canAtencion(buildRefrend("DRAFT", "DRAFT"))).toBe(true);
  });

  it("is true for CON_INCIDENCIA when unlocked", () => {
    expect(canAtencion(buildRefrend("DRAFT", "CON_INCIDENCIA"))).toBe(true);
  });

  it("is false for PENDIENTE_NOTIFICACION", () => {
    expect(canAtencion(buildRefrend("DRAFT", "PENDIENTE_NOTIFICACION"))).toBe(
      false,
    );
  });

  it("is false for LISTO_PARA_PAGO", () => {
    expect(canAtencion(buildRefrend("DRAFT", "LISTO_PARA_PAGO"))).toBe(false);
  });

  it("is false for CLOSED (locked)", () => {
    expect(canAtencion(buildRefrend("DRAFT", "CLOSED"))).toBe(false);
  });

  it("is false when legacy status locks the row even though workflow_status is DRAFT", () => {
    expect(canAtencion(buildRefrend("CANCELLED", "DRAFT"))).toBe(false);
  });
});

describe("canPedagogia", () => {
  it("is true for CON_INCIDENCIA when unlocked", () => {
    expect(canPedagogia(buildRefrend("DRAFT", "CON_INCIDENCIA"))).toBe(true);
  });

  it("is false for DRAFT", () => {
    expect(canPedagogia(buildRefrend("DRAFT", "DRAFT"))).toBe(false);
  });

  it("is false for CLOSED (locked)", () => {
    expect(canPedagogia(buildRefrend("DRAFT", "CLOSED"))).toBe(false);
  });

  it("is false when legacy status locks the row even though workflow_status is CON_INCIDENCIA", () => {
    expect(canPedagogia(buildRefrend("PAID", "CON_INCIDENCIA"))).toBe(false);
  });
});

describe("canRecordSituation", () => {
  it("is true for any unlocked workflow_status", () => {
    expect(canRecordSituation(buildRefrend("DRAFT", "LISTO_PARA_PAGO"))).toBe(
      true,
    );
  });

  it("is false when workflow_status is CLOSED", () => {
    expect(canRecordSituation(buildRefrend("DRAFT", "CLOSED"))).toBe(false);
  });

  it("is false when legacy status is locked (e.g. AUTHORIZED)", () => {
    expect(
      canRecordSituation(buildRefrend("AUTHORIZED", "DRAFT")),
    ).toBe(false);
  });
});
