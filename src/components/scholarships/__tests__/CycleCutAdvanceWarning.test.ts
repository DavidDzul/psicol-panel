// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import CycleCutAdvanceWarning from "@/components/scholarships/CycleCutAdvanceWarning.vue";
import type { CycleCutPreview } from "@/interfaces/scholarship";

const vuetify = createVuetify();

const preview: CycleCutPreview = {
  reason: "BAJA_DEFINITIVA",
  can_cut: true,
  blockers: [],
  advance: {
    months: [
      { period_year: 2026, period_month: 4, amount: "2500.00", is_cut_month: true, origin_period_year: 2026, origin_period_month: 3 },
      { period_year: 2026, period_month: 5, amount: "2500.00", is_cut_month: false, origin_period_year: 2026, origin_period_month: 3 },
    ],
    origins: [
      { origin_period_year: 2026, origin_period_month: 3, origin_paid: true, cancelled_amount: "5000.00", overpaid_amount: "5000.00", advance_payment_reduction: "0.00" },
    ],
    cancelled_amount: "5000.00",
    overpaid_amount: "5000.00",
    advance_payment_reduction: "0.00",
  },
};

const mountWarning = (props: { preview: CycleCutPreview | null; loading?: boolean }) =>
  mount(CycleCutAdvanceWarning, { props, global: { plugins: [vuetify] } });

describe("CycleCutAdvanceWarning", () => {
  it("renders the warning text when the preview has advance months", () => {
    const w = mountWarning({ preview });
    expect(w.text()).toContain("Al confirmar se cancelarán los meses adelantados abril y mayo.");
    expect(w.text()).toContain("$5,000.00");
    expect(w.find(".v-skeleton-loader").exists()).toBe(false);
  });

  it("renders nothing when the preview is null (S52)", () => {
    const w = mountWarning({ preview: null });
    expect(w.find(".v-alert").exists()).toBe(false);
    expect(w.find(".v-skeleton-loader").exists()).toBe(false);
  });

  it("renders nothing when there are no advance months (S50)", () => {
    const w = mountWarning({ preview: { ...preview, advance: { ...preview.advance, months: [] } } });
    expect(w.find(".v-alert").exists()).toBe(false);
  });

  it("shows a skeleton while loading", () => {
    const w = mountWarning({ preview: null, loading: true });
    expect(w.find(".v-skeleton-loader").exists()).toBe(true);
    expect(w.find(".v-alert").exists()).toBe(false);
  });
});
