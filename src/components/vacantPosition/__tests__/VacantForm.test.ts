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

import VacantForm from "@/components/vacantPosition/VacantForm.vue";
import type { VacantPositionDetail } from "@/interfaces/vacant";

const detail = (overrides: Partial<VacantPositionDetail>) =>
  ({
    id: 1,
    user_id: 5,
    vacant_name: "Becario Jr",
    status: true,
    category: "JR_POSITION",
    created_at: "2026-01-01",
    mode: "ON_SITE",
    study_profile: "Sistemas",
    semester: "5",
    skills: "Excel",
    general_knowledge: true,
    knowledge_description: "Contabilidad",
    net_salary: "5000",
    start_day: "Lunes",
    end_day: "Viernes",
    start_hour: "09",
    start_minute: "00",
    end_hour: "17",
    end_minute: "00",
    ...overrides,
  }) as VacantPositionDetail;

const mountForm = (vacant: VacantPositionDetail) =>
  mount(VacantForm, {
    props: { vacant },
    global: { plugins: [createVuetify()] },
  });

describe("VacantForm", () => {
  it("renders the JR_POSITION specific fields", () => {
    const wrapper = mountForm(detail({}));
    const text = wrapper.text();
    expect(text).toContain("Semestre y/o cuatrimestre admitido");
    expect(text).toContain("Contabilidad");
    expect(text).toContain("Sueldo neto mensual");
    wrapper.unmount();
  });

  it("falls back to the raw key when a map has no entry", () => {
    const wrapper = mountForm(detail({ mode: "UNKNOWN_MODE" }));
    expect(wrapper.text()).toContain("UNKNOWN_MODE");
    wrapper.unmount();
  });
});
