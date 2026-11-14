// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VBtn } from "vuetify/components";
import ClassUsersTable from "@/components/classes/ClassUsersTable.vue";

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

const vuetify = createVuetify();
let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

describe("ClassUsersTable — assign button", () => {
  it("shows the Asignar usuarios button and emits assign on click", async () => {
    wrapper = mount(ClassUsersTable, {
      props: {
        classData: { id: 1, name: "Clase", date: "2026-11-20", start_time: "09:00", end_time: "10:00" },
        attendances: [],
        loading: false,
      },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });

    const button = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Asignar usuarios");
    expect(button).toBeTruthy();

    await button!.trigger("click");
    expect(wrapper.emitted("assign")).toHaveLength(1);
  });
});
