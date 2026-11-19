// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
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

import BusinessForm from "@/components/users/BusinessForm.vue";
import type { Business } from "@/interfaces/business";

const mountForm = (business: Business | null) =>
  mount(BusinessForm, {
    props: { business },
    global: { plugins: [createVuetify()] },
  });

describe("BusinessForm", () => {
  it("renders nothing when business is null", () => {
    const wrapper = mountForm(null);
    expect(wrapper.find(".user-details-list").exists()).toBe(false);
    wrapper.unmount();
  });

  it("renders the campus label and tolerates null phone and workstation", () => {
    const wrapper = mountForm({
      id: 1,
      first_name: "Ana",
      last_name: "Pérez",
      email: "a@b.com",
      phone: null,
      workstation: null,
      campus: "MERIDA",
    } as unknown as Business);
    expect(wrapper.text()).toContain("Mérida");
    wrapper.unmount();
  });

  it("does not throw on an unknown campus", () => {
    const wrapper = mountForm({ id: 1, campus: "XYZ" } as unknown as Business);
    expect(wrapper.text()).toContain("XYZ");
    wrapper.unmount();
  });
});
