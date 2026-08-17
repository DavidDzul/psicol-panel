// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";

// Design D5: `showAdvancePaymentFilter` defaults to visible (mirrors the
// `requireGeneration !== false` pattern already used for the generation
// column) so both Pedagogía and Atención get the switch without an explicit
// prop — regression guard for that default plus the emit contract.

const vuetify = createVuetify();

const mountFilters = (props: Record<string, unknown> = {}) =>
  mount(ScholarshipFilters, {
    props: { year: 2026, month: 1, ...props },
    global: { plugins: [createPinia(), vuetify] },
  });

describe("ScholarshipFilters — advance payment switch", () => {
  it("renders the switch by default (showAdvancePaymentFilter unset)", () => {
    const wrapper = mountFilters();
    expect(wrapper.text()).toContain("¿Estudia en la universidad CERT?");
  });

  it("hides the switch when showAdvancePaymentFilter is explicitly false", () => {
    const wrapper = mountFilters({ showAdvancePaymentFilter: false });
    expect(wrapper.text()).not.toContain("¿Estudia en la universidad CERT?");
  });

  it("emits update:advancePaymentOnly with the new boolean when toggled", async () => {
    const wrapper = mountFilters();
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);

    const emitted = wrapper.emitted("update:advancePaymentOnly");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual([true]);
  });
});
