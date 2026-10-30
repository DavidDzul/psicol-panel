// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import CycleCutWithholdingWarning from "@/components/scholarships/CycleCutWithholdingWarning.vue";
import type { CycleCutPreview } from "@/interfaces/scholarship";

const vuetify = createVuetify();

const preview: CycleCutPreview = {
  reason: "BAJA_DEFINITIVA",
  can_cut: true,
  blockers: [],
  advance: { months: [], origins: [], cancelled_amount: "0.00", overpaid_amount: "0.00", advance_payment_reduction: "0.00" },
  withholdings_to_cancel: {
    rows: [
      { id: 1, period_year: 2026, period_month: 8, withheld_amount: "1000.00", paid_amount: "250.00", remaining_amount: "750.00", is_current_refrend: false },
      { id: 2, period_year: 2026, period_month: 9, withheld_amount: "500.00", paid_amount: "0.00", remaining_amount: "500.00", is_current_refrend: true },
    ],
    total_remaining: "1250.00",
  },
};

const mountWarning = (props: { preview: CycleCutPreview | null; loading?: boolean }) =>
  mount(CycleCutWithholdingWarning, { props, global: { plugins: [vuetify] } });

describe("CycleCutWithholdingWarning", () => {
  it("lists the withholdings to cancel with amounts, the current-month tag and the total", () => {
    const w = mountWarning({ preview });
    const text = w.text();
    expect(text).toContain(
      "Al confirmar se cancelarán las retenciones pendientes de este becario. Esta acción no se puede deshacer.",
    );
    expect(text).toContain("Agosto 2026");
    expect(text).toContain("$750.00");
    expect(text).toContain("Septiembre 2026");
    expect(text).toContain("$500.00");
    expect(text).toContain("Este mes");
    expect(text).toContain("$1,250.00");
  });

  it("renders nothing when no withholdings will be cancelled (S14)", () => {
    expect(mountWarning({ preview: null }).find(".v-alert").exists()).toBe(false);
    const empty = { ...preview, withholdings_to_cancel: { rows: [], total_remaining: "0.00" } };
    expect(mountWarning({ preview: empty }).find(".v-alert").exists()).toBe(false);
  });

  it("renders nothing while loading (the advance warning owns the skeleton)", () => {
    const w = mountWarning({ preview: null, loading: true });
    expect(w.find(".v-alert").exists()).toBe(false);
    expect(w.find(".v-skeleton-loader").exists()).toBe(false);
  });
});
