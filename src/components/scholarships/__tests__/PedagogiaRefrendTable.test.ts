// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import PedagogiaRefrendTable from "@/components/scholarships/PedagogiaRefrendTable.vue";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// Full mount (not shallow): the behavior under test is the row-filter
// predicate inside `displayRows`, which is only observable through what
// actually renders in the DOM (script setup exposes no internal refs).
// Heavy leaf components with their own dialog/store wiring are stubbed —
// irrelevant to the filter itself and would otherwise need unrelated props.

const vuetify = createVuetify();

const STUBS = {
  RefrendPedagogiaDialog: true,
  SituationSinPagoDialog: true,
  SituationRetenidaDialog: true,
  SituationPagoMesesDialog: true,
  SituationSuspendidaDialog: true,
  SituationBajaDialog: true,
  SituationEgresadoDialog: true,
  RefrendSituationBar: true,
  IncidentDetailIcon: true,
  StatusIcon: true,
};

const baseRefrend: ScholarshipRefrend = {
  id: 1,
  user_id: 1,
  period_year: 2026,
  period_month: 5,
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
  base_amount: "1000",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "1000",
  amount_pending_from_previous: "0",
  total_to_pay: "1000",
  snapshot_name: "Becario",
  snapshot_generation: "Gen Única",
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
  id: number,
  name: string,
  incidentsCount: number,
  pendingCount: number,
): BulkRefrendRow => ({
  refrend: { ...baseRefrend, id, snapshot_name: name },
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
  incidents_count: incidentsCount,
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
  pending_withholding_count: pendingCount,
  pending_withholding_amount: pendingCount > 0 ? "500.00" : null,
});

const mountTable = (rows: BulkRefrendRow[]) =>
  mount(PedagogiaRefrendTable, {
    props: { rows, year: 2026, month: 5 },
    global: {
      plugins: [createPinia(), vuetify],
      stubs: STUBS,
    },
  });

// ── Tests ─────────────────────────────────────────────────────────────────
//
// spec "Criterio de inclusión de filas en Pedagogía": incidents_count > 0 OR
// pending_withholding_count > 0.

describe("PedagogiaRefrendTable — row filter", () => {
  it("includes a row with an incidencia and no pending withholding (preexisting behavior)", async () => {
    const rows = [buildRow(1, "Ana Incidencia", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Ana Incidencia");
  });

  it("includes a row with a pending withholding and no incidencia (new behavior)", async () => {
    const rows = [buildRow(2, "Beto Retencion", 0, 1)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Beto Retencion");
  });

  it("excludes a row with neither an incidencia nor a pending withholding", async () => {
    const rows = [buildRow(3, "Carla Limpia", 0, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("Carla Limpia");
  });

  it("shows both indicators for a row with an incidencia and a pending withholding", async () => {
    const rows = [buildRow(4, "Dana Ambos", 1, 2)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Dana Ambos");
    // pendingWithholdingChip renders the formatted amount for count > 0.
    expect(wrapper.text()).toContain("$500.00");
  });

  it("keeps included/excluded rows correctly separated when mixed in the same generación", async () => {
    const rows = [
      buildRow(5, "Incluido Incidencia", 1, 0),
      buildRow(6, "Incluido Retencion", 0, 1),
      buildRow(7, "Excluido Limpio", 0, 0),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Incluido Incidencia");
    expect(wrapper.text()).toContain("Incluido Retencion");
    expect(wrapper.text()).not.toContain("Excluido Limpio");
  });
});
