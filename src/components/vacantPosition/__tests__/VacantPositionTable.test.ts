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

import VacantPositionTable from "@/components/vacantPosition/VacantPositionTable.vue";
import type { VacantPosition } from "@/interfaces/vacant";

const positions = [
  {
    id: 1,
    user_id: 5,
    vacant_name: "Dev",
    status: true,
    category: "JR_POSITION",
    created_at: "2026-01-01T10:00:00",
    business: { id: 2, user_id: 7, bs_name: "Acme" },
  },
  {
    id: 2,
    user_id: 5,
    vacant_name: "Ghost",
    status: false,
    category: "NOT_A_CATEGORY",
    created_at: "2026-01-01T10:00:00",
    business: null,
  },
] as unknown as VacantPosition[];

describe("VacantPositionTable", () => {
  it("renders rows and uses the raw key as fallback for unknown categories", async () => {
    const wrapper = mount(VacantPositionTable, {
      props: { positions, loading: false, read: true, create: false, edit: false },
      global: { plugins: [createVuetify()] },
    });
    await flushPromises();
    const text = wrapper.text();
    expect(text).toContain("Dev");
    expect(text).toContain("Acme");
    expect(text).toContain("NOT_A_CATEGORY");
    wrapper.unmount();
  });
});
