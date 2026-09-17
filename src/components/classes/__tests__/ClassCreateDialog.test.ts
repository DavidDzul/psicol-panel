// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VSelect, VTextField, VBtn } from "vuetify/components";
import ClassCreateDialog from "@/components/classes/ClassCreateDialog.vue";
import DatePickerInput from "@/components/shared/DatePickerInput.vue";

// Same jsdom shims as SituationSinPagoDialog.test.ts.
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

describe("ClassCreateDialog — submit payload", () => {
  it("emits the exact field names the backend requires (name/date/start_time/end_time), not the internal class_* keys", async () => {
    wrapper = mount(ClassCreateDialog, {
      props: {
        modelValue: true,
        loading: false,
        adminCampus: [{ text: "MERIDA", value: "MERIDA" }],
        generations: [
          { id: 1, campus: "MERIDA", generation_name: "Generación 1", generation_active: true },
        ],
      },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(VTextField).setValue("Clase de prueba");
    await wrapper.findComponent(DatePickerInput).vm.$emit("update:modelValue", "2026-09-20");

    const campusSelect = wrapper.findAllComponents(VSelect).find((s) => s.props("label") === "Sede");
    await campusSelect?.vm.$emit("update:modelValue", "MERIDA");

    const generationSelect = wrapper
      .findAllComponents(VSelect)
      .find((s) => s.props("label") === "Generación");
    await generationSelect?.vm.$emit("update:modelValue", 1);

    await wrapper.vm.$nextTick();

    const saveButton = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Guardar");
    await saveButton?.trigger("click");
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("submit");
    expect(emitted).toBeTruthy();

    const payload = emitted?.[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      name: "Clase de prueba",
      date: "2026-09-20",
      start_time: "09:00:59",
      end_time: "14:00:00",
      campus: "MERIDA",
      generation_id: 1,
    });
    expect(payload).not.toHaveProperty("class_name");
    expect(payload).not.toHaveProperty("class_date");
    expect(payload).not.toHaveProperty("class_start_time");
    expect(payload).not.toHaveProperty("class_end_time");
  });
});
