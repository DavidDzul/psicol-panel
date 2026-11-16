// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";

const get = vi.fn();
vi.mock("@/axiosConfig", () => ({
  default: { get: (...a: unknown[]) => get(...a), post: vi.fn(), put: vi.fn() },
}));
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert: vi.fn() }) }));

import StaffAdministratorsView from "@/views/administrators/StaffAdministratorsView.vue";

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

let wrapper: ReturnType<typeof mount> | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

describe("StaffAdministratorsView", () => {
  it("renders both tabs, the next-login notice and loads roles on mount", async () => {
    get.mockImplementation((url: string) =>
      Promise.resolve({
        data: url.endsWith("/permissions")
          ? { res: true, modules: [] }
          : url.endsWith("staff-administrators")
            ? { res: true, administrators: [] }
            : { res: true, roles: [] },
      }),
    );
    wrapper = mount(StaffAdministratorsView, {
      global: { plugins: [createPinia(), createVuetify({ components })] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();

    const text = wrapper.text();
    expect(text).toContain("Administradores");
    expect(text).toContain("Roles y permisos");
    expect(text).toContain("vuelve a iniciar sesión");
    expect(get).toHaveBeenCalledWith("api/admin/staff-administrators", expect.anything());
    expect(get).toHaveBeenCalledWith("api/admin/staff-roles", expect.anything());
    expect(get).toHaveBeenCalledWith("api/admin/staff-roles/permissions", expect.anything());
  });
});
