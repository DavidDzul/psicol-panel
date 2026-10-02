// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import TemporaryIncreaseChip from "@/components/scholarships/TemporaryIncreaseChip.vue";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// Clone of AdvancePaymentChip.test.ts's harness (vite-plugin-vuetify
// autoImport resolves template components at transform time, same as
// production — no manual component registration needed here).

const vuetify = createVuetify();

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
  overrides: {
    snapshot_temporary_increase_amount?: string | null;
    snapshot_temporary_increase_reason?: string | null;
  } = {},
): BulkRefrendRow => ({
  refrend: {
    ...baseRefrend,
    snapshot_temporary_increase_amount:
      overrides.snapshot_temporary_increase_amount ?? null,
    snapshot_temporary_increase_reason:
      overrides.snapshot_temporary_increase_reason ?? null,
  },
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

const mountChip = (row: BulkRefrendRow) =>
  mount(TemporaryIncreaseChip, {
    props: { row },
    global: { plugins: [vuetify] },
  });

// ── Tests ─────────────────────────────────────────────────────────────────

describe("TemporaryIncreaseChip", () => {
  it("renders the — fallback and no chip when there is no active increase", () => {
    const wrapper = mountChip(buildRow());

    expect(wrapper.findComponent({ name: "VChip" }).exists()).toBe(false);
    expect(wrapper.text()).toBe("—");
  });

  it('renders the — fallback when the amount is "0.00"', () => {
    const wrapper = mountChip(
      buildRow({ snapshot_temporary_increase_amount: "0.00" }),
    );

    expect(wrapper.findComponent({ name: "VChip" }).exists()).toBe(false);
    expect(wrapper.text()).toBe("—");
  });

  it("renders a chip with the formatted amount when the increase is active", () => {
    const wrapper = mountChip(
      buildRow({
        snapshot_temporary_increase_amount: "500.00",
        snapshot_temporary_increase_reason: "Ajuste de beca",
      }),
    );

    expect(wrapper.findComponent({ name: "VChip" }).exists()).toBe(true);
    expect(wrapper.text()).toContain("$500.00");
  });

  it("does not emit any event on click — purely informational", async () => {
    const wrapper = mountChip(
      buildRow({
        snapshot_temporary_increase_amount: "500.00",
        snapshot_temporary_increase_reason: "Ajuste de beca",
      }),
    );

    await wrapper.findComponent({ name: "VChip" }).trigger("click");

    expect(wrapper.emitted()).not.toHaveProperty("open");
    expect(wrapper.emitted()).not.toHaveProperty("navigate");
    expect(wrapper.text()).toContain("$500.00");
  });
});
