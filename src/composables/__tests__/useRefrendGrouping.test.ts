import { describe, expect, it } from "vitest";

import type {
  BulkRefrendRow,
  RefrendStatus,
  ScholarshipRefrend,
  WorkflowStatus,
} from "@/interfaces/scholarship";
import { groupRowsByGeneration } from "@/composables/useRefrendGrouping";

const buildRow = (
  overrides: {
    id: number;
    snapshot_generation: string | null;
    status?: RefrendStatus;
    workflow_status?: WorkflowStatus | null;
  },
): BulkRefrendRow => {
  const refrend: ScholarshipRefrend = {
    id: overrides.id,
    user_id: overrides.id,
    period_year: 2026,
    period_month: 1,
    refrend_type: "NORMAL",
    status: overrides.status ?? "DRAFT",
    workflow_status: overrides.workflow_status ?? "CON_INCIDENCIA",
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
    snapshot_name: `Becario ${overrides.id}`,
    snapshot_generation: overrides.snapshot_generation,
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
  };

  return {
    refrend,
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
    incidents_count: 1,
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
  };
};

describe("groupRowsByGeneration", () => {
  it("groups rows under their snapshot_generation label", () => {
    const rows = [
      buildRow({ id: 1, snapshot_generation: "Gen B" }),
      buildRow({ id: 2, snapshot_generation: "Gen A" }),
      buildRow({ id: 3, snapshot_generation: "Gen A" }),
    ];

    const groups = groupRowsByGeneration(rows);

    expect(groups.map((g) => g.generation)).toEqual(["Gen A", "Gen B"]);
    expect(groups[0].rows).toHaveLength(2);
    expect(groups[1].rows).toHaveLength(1);
  });

  it("sorts groups ascending by generación label", () => {
    const rows = [
      buildRow({ id: 1, snapshot_generation: "Gen C" }),
      buildRow({ id: 2, snapshot_generation: "Gen A" }),
      buildRow({ id: 3, snapshot_generation: "Gen B" }),
    ];

    const groups = groupRowsByGeneration(rows);

    expect(groups.map((g) => g.generation)).toEqual([
      "Gen A",
      "Gen B",
      "Gen C",
    ]);
  });

  it("falls back to an explicit label when snapshot_generation is null", () => {
    const rows = [buildRow({ id: 1, snapshot_generation: null })];

    const groups = groupRowsByGeneration(rows);

    expect(groups).toHaveLength(1);
    expect(groups[0].generation).toBe("Sin generación");
  });

  it("orders rows actionable-first within a group", () => {
    const rows = [
      buildRow({
        id: 1,
        snapshot_generation: "Gen A",
        workflow_status: "LISTO_PARA_PAGO", // not actionable for pedagogía
      }),
      buildRow({
        id: 2,
        snapshot_generation: "Gen A",
        workflow_status: "CON_INCIDENCIA", // actionable
      }),
    ];

    const groups = groupRowsByGeneration(rows);

    expect(groups[0].rows.map((r) => r.refrend.id)).toEqual([2, 1]);
  });

  it("produces no group entry for a generación with zero rows", () => {
    const groups = groupRowsByGeneration([]);

    expect(groups).toEqual([]);
  });
});
