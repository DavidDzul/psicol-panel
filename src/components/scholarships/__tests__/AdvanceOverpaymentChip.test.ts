// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { VTooltip } from "vuetify/components";
import { createVuetify } from "vuetify";
import AdvanceOverpaymentChip from "@/components/scholarships/AdvanceOverpaymentChip.vue";
import type { AdvanceOverpayment } from "@/interfaces/scholarship";

// sdd/revertir-pago-adelantado S11b (R18, S37/S38).
const vuetify = createVuetify();

const overpayment: AdvanceOverpayment = {
  amount: "5000.00",
  months: [
    { period_year: 2026, period_month: 4, amount: "2500.00" },
    { period_year: 2026, period_month: 5, amount: "2500.00" },
  ],
  origin_period_year: 2026,
  origin_period_month: 3,
};

const mountChip = (value: AdvanceOverpayment | null | undefined) =>
  mount(AdvanceOverpaymentChip, { props: { overpayment: value }, global: { plugins: [vuetify] } });

describe("AdvanceOverpaymentChip", () => {
  it("S37: shows the formatted amount and months", () => {
    expect(mountChip(overpayment).text()).toContain("Sobrepago por adelanto: $5,000.00 (abril y mayo)");
  });

  it("S37: tooltip includes the origin period", () => {
    const tip = mountChip(overpayment).findComponent(VTooltip);
    expect(tip.props("text")).toContain("Marzo 2026");
  });

  it("appends the year when months span more than one year", () => {
    const text = mountChip({
      ...overpayment,
      months: [
        { period_year: 2026, period_month: 12, amount: "2500.00" },
        { period_year: 2027, period_month: 1, amount: "2500.00" },
      ],
    }).text();
    expect(text).toContain("(diciembre de 2026 y enero de 2027)");
  });

  it("S38: renders nothing for null or undefined", () => {
    expect(mountChip(null).text()).toBe("");
    expect(mountChip(undefined).findComponent({ name: "VChip" }).exists()).toBe(false);
  });
});
