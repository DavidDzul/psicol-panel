// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { VSwitch } from "vuetify/components";
import AtencionRefrendTable from "@/components/scholarships/AtencionRefrendTable.vue";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// atencionFlag/clearFlag/patchInline/recalculateRefrend hit axios directly
// (no repository seam) — mocked at the module boundary. None of these are
// exercised by the "Solo pago adelantado" filter tests below, but the
// component calls useScholarshipStore() unconditionally on setup.
vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    atencionFlag: vi.fn(),
    clearFlag: vi.fn(),
    patchInline: vi.fn(),
    recalculateRefrend: vi.fn(),
  }),
}));

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const vuetify = createVuetify();

const STUBS = {
  RefrendAtencionDialog: true,
  RefrendDetailDrawer: true,
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
  advancePaymentEligible = false,
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
  pending_withholding_count: 0,
  pending_withholding_amount: null,
  advance_payment_eligible: advancePaymentEligible,
});

const mountTable = (
  rows: BulkRefrendRow[],
  viewVariant: "completa" | "incidencias" = "completa",
) =>
  mount(AtencionRefrendTable, {
    props: { rows, year: 2026, month: 5, viewVariant },
    global: {
      plugins: [createPinia(), vuetify],
      stubs: STUBS,
    },
  });

const toggleAdvancePaymentOnly = async (
  wrapper: ReturnType<typeof mountTable>,
  value: boolean,
) => {
  await wrapper.findComponent(VSwitch).vm.$emit("update:modelValue", value);
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
};

// ── Tests ─────────────────────────────────────────────────────────────────
//
// "Solo pago adelantado" mirrors PedagogiaRefrendTable's switch: orthogonal
// to viewVariant, ANDs into displayRows instead of replacing it.

describe('AtencionRefrendTable — "Solo pago adelantado" switch', () => {
  it("leaves all rows visible when the switch is off (default, unaffected)", async () => {
    const rows = [
      buildRow(1, "No Elegible", 0, false),
      buildRow(2, "Elegible", 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("No Elegible");
    expect(wrapper.text()).toContain("Elegible");
  });

  it("shows only advance-payment-eligible rows when the switch is on", async () => {
    const rows = [
      buildRow(3, "No Elegible", 0, false),
      buildRow(4, "Elegible", 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);

    expect(wrapper.text()).not.toContain("No Elegible");
    expect(wrapper.text()).toContain("Elegible");
  });

  it('combines (AND) with viewVariant="incidencias" — excludes an eligible row with no incidencia', async () => {
    const rows = [
      buildRow(5, "Elegible Sin Incidencia", 0, true),
      buildRow(6, "Elegible Con Incidencia", 1, true),
    ];
    const wrapper = mountTable(rows, "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);

    expect(wrapper.text()).not.toContain("Elegible Sin Incidencia");
    expect(wrapper.text()).toContain("Elegible Con Incidencia");
  });

  it("combines (AND) with name search", async () => {
    const rows = [
      buildRow(7, "Karla Elegible", 0, true),
      buildRow(8, "Luis Elegible", 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);
    await wrapper
      .find('input[placeholder="Buscar por nombre becario..."]')
      .setValue("Karla");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Karla Elegible");
    expect(wrapper.text()).not.toContain("Luis Elegible");
  });
});
