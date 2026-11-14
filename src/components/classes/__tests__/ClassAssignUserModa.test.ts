// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VBtn, VChip, VCheckbox, VAlert } from "vuetify/components";
import ClassAssignUserModa from "@/components/classes/ClassAssignUserModa.vue";
import type { ClassAttendance, ClassEntity } from "@/interfaces/class";
import type { User } from "@/interfaces/user";

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

const classData: ClassEntity = {
  id: 7,
  name: "Clase",
  date: "2026-11-20",
  start_time: "09:00",
  end_time: "10:00",
  campus: "MERIDA",
  generation_id: 3,
};

const user = (id: number): User => ({ id, first_name: `N${id}`, last_name: `L${id}` }) as User;

const attendance = (userId: number, checkIn: string | null = null): ClassAttendance => ({
  id: userId * 10,
  status: "ABSENT",
  check_in: checkIn,
  check_out: null,
  observations: null,
  user: { id: userId, first_name: `N${userId}`, last_name: `L${userId}`, enrollment: null, email: "x@x.mx" },
});

const mountModal = (props: Record<string, unknown> = {}) =>
  mount(ClassAssignUserModa, {
    props: {
      modelValue: true,
      loading: false,
      classData,
      users: [user(1), user(2)],
      attendances: [attendance(2), attendance(3, "09:05:00")],
      ...props,
    },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });

describe("ClassAssignUserModa", () => {
  it("emits findUsers with the class campus and generation when opened", async () => {
    wrapper = mountModal({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("findUsers")?.[0]).toEqual([{ campus: "MERIDA", generation_id: 3 }]);
  });

  it("lists eligible users plus attendees and nobody else", async () => {
    wrapper = mountModal();
    await wrapper.vm.$nextTick();
    const text = document.body.textContent ?? "";
    expect(text).toContain("L1");
    expect(text).toContain("L2");
    expect(text).toContain("L3");
    expect(text).not.toContain("L4");
  });

  it("shows the No elegible chip only for assigned non-eligible users", async () => {
    wrapper = mountModal();
    await wrapper.vm.$nextTick();
    const chips = wrapper.findAllComponents(VChip).filter((c) => c.text() === "No elegible");
    expect(chips).toHaveLength(1);
  });

  it("disables the checkbox of rows that already have a check_in", async () => {
    wrapper = mountModal();
    await wrapper.vm.$nextTick();
    const boxes = wrapper
      .findAllComponents(VCheckbox)
      .filter((c) => c.attributes("data-user-id") !== undefined);
    const byId = Object.fromEntries(boxes.map((b) => [b.attributes("data-user-id"), b.props("disabled")]));
    expect(byId["3"]).toBe(true);
    expect(byId["2"]).toBeFalsy();
    expect(byId["1"]).toBeFalsy();
  });

  it("shows the absence note in a v-alert", async () => {
    wrapper = mountModal();
    await wrapper.vm.$nextTick();
    const alert = wrapper.findComponent(VAlert);
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain(
      "La asistencia nueva se registra como Falta; si no se registra entrada contará como falta injustificada en el refrendo.",
    );
  });

  it("submits the current attendees untouched when saving without changes", async () => {
    wrapper = mountModal();
    await wrapper.vm.$nextTick();
    const save = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Guardar selección");
    await save!.trigger("click");
    const ids = (wrapper.emitted("submit")?.[0]?.[0] as number[]).slice().sort();
    expect(ids).toEqual([2, 3]);
  });
});
