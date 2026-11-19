// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";

if (!("visualViewport" in window)) {
  Object.defineProperty(window, "visualViewport", { value: null, writable: true });
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import CandidateDataTable from "@/components/data/CandidateDataTable.vue";
import type { CandidateData } from "@/interfaces/data";

describe("CandidateDataTable", () => {
  it("renders typed headers and falls back to the raw key for unknown maps", async () => {
    const candidates = [
      { id: 1, user_type: "MYSTERY_TYPE", campus: "MERIDA", job_type: "X", area_id: 1, count: 3 },
    ] as unknown as CandidateData[];
    const wrapper = mount(CandidateDataTable, {
      props: { candidates, areas: [], loading: false },
      global: { plugins: [createVuetify()] },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Tipo de trabajo");
    expect(wrapper.text()).toContain("MYSTERY_TYPE");
    wrapper.unmount();
  });
});
