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

// User request (2026-09-27): unblock month selection in this filter — staff
// needs to browse/select periods that haven't started yet (e.g. a refrendo
// that already exists for a future month), unrelated to any generation
// guard. All 12 months must always be selectable, regardless of the
// selected year.
describe("ScholarshipFilters — month selection is never restricted", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 20)); // Sept 20, 2026 (month is 0-indexed)
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("leaves every month enabled when the selected year is the current year, including months after the current one", () => {
    const wrapper = mountFilters({ year: 2026, month: 9 });

    const items = monthSelect(wrapper).props("items") as { title: string; value: number; props?: { disabled?: boolean } }[];

    for (const item of items) {
      expect(item.props?.disabled ?? false).toBe(false);
    }
  });

  it("leaves all months enabled for a past year", () => {
    const wrapper = mountFilters({ year: 2025, month: 9 });

    const items = monthSelect(wrapper).props("items") as { title: string; value: number; props?: { disabled?: boolean } }[];
    const december = items.find((i) => i.value === 12);

    expect(december?.props?.disabled ?? false).toBe(false);
  });
});
