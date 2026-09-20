// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { VSelect } from "vuetify/components";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const vuetify = createVuetify();

const mountFilters = (props: Partial<InstanceType<typeof ScholarshipFilters>["$props"]> = {}) =>
  mount(ScholarshipFilters, {
    props: { year: 2026, month: 9, ...props },
    global: { plugins: [createPinia(), vuetify] },
  });

const monthSelect = (wrapper: ReturnType<typeof mountFilters>) =>
  wrapper.findAllComponents(VSelect).find((s) => s.props("label") === "Mes de refrendo")!;

describe("ScholarshipFilters — future months disabled (can't generate/browse a period that hasn't started)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 20)); // Sept 20, 2026 (month is 0-indexed)
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables months after the current one when the selected year is the current year", () => {
    const wrapper = mountFilters({ year: 2026, month: 9 });

    const items = monthSelect(wrapper).props("items") as { title: string; value: number; props?: { disabled?: boolean } }[];
    const october = items.find((i) => i.value === 10);
    const september = items.find((i) => i.value === 9);

    expect(october?.props?.disabled).toBe(true);
    expect(september?.props?.disabled ?? false).toBe(false);
  });

  it("leaves all months enabled for a past year", () => {
    const wrapper = mountFilters({ year: 2025, month: 9 });

    const items = monthSelect(wrapper).props("items") as { title: string; value: number; props?: { disabled?: boolean } }[];
    const december = items.find((i) => i.value === 12);

    expect(december?.props?.disabled ?? false).toBe(false);
  });
});
