// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createVuetify } from "vuetify";
import { VSelect, VBtn } from "vuetify/components";

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

const fetchClasses = vi.fn();

vi.mock("@/stores/api/classStore", async () => {
  const { ref } = await import("vue");
  return {
    useClassStore: () => ({
      classMap: ref(new Map()),
      fetchClasses,
      createClass: vi.fn(),
      updateClass: vi.fn(),
      deleteClass: vi.fn(),
      reportSemesterPDF: vi.fn(),
      reportSemesterExcel: vi.fn(),
    }),
  };
});

vi.mock("@/stores/api/authStore", async () => {
  const { ref } = await import("vue");
  return {
    useAuthStore: () => ({
      filteredCampus: ref([{ text: "MERIDA", value: "MERIDA" }]),
    }),
  };
});

vi.mock("@/stores/api/generationStore", async () => {
  const { ref } = await import("vue");
  return {
    useGenerationsStore: () => ({
      resGenerations: ref(
        new Map([
          [1, { id: 1, campus: "MERIDA", generation_name: "Generación 1", generation_active: true }],
        ]),
      ),
    }),
  };
});

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import ClassView from "@/views/classes/ClassView.vue";

const vuetify = createVuetify();
const stubs = {
  BreadCrumbs: true,
  ClassesTable: true,
  ClassCreateDialog: true,
  ClassUpdateDialog: true,
  ReportSemesterModal: true,
  ConfirmationDialog: true,
};

let wrapper: ReturnType<typeof mount> | null = null;

const mountView = async () => {
  wrapper = mount(ClassView, {
    global: { plugins: [vuetify], stubs },
    attachTo: document.body,
  });
  await flushPromises();
  return wrapper;
};

const selectByLabel = (label: string) =>
  wrapper!.findAllComponents(VSelect).find((s) => s.props("label") === label)!;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 14, 10));
  setActivePinia(createPinia());
  fetchClasses.mockReset();
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
  vi.useRealTimers();
});

const searchWithGeneration = async () => {
  await selectByLabel("Generación").vm.$emit("update:modelValue", 1);
  await wrapper!.findAllComponents(VBtn).find((b) => b.text().includes("BUSCAR"))!.trigger("click");
  await flushPromises();
};

describe("ClassView - period filter", () => {
  it("shows 2026 / Noviembre by default and sends year+month", async () => {
    await mountView();
    expect(selectByLabel("Año").props("modelValue")).toBe(2026);
    expect(selectByLabel("Mes").props("modelValue")).toBe(11);

    await searchWithGeneration();
    expect(fetchClasses).toHaveBeenCalledWith({
      campus: "MERIDA",
      generation_id: 1,
      year: 2026,
      month: 11,
    });
  });

  it("offers 'Todos los meses' first and sends year only when picked", async () => {
    await mountView();
    const items = selectByLabel("Mes").props("items") as { title: string; value: number }[];
    expect(items[0]).toEqual({ title: "Todos los meses", value: 0 });
    expect(items).toHaveLength(13);

    await selectByLabel("Mes").vm.$emit("update:modelValue", 0);
    await searchWithGeneration();
    expect(fetchClasses).toHaveBeenLastCalledWith({
      campus: "MERIDA",
      generation_id: 1,
      year: 2026,
    });
  });

  it("does not search without campus and generation", async () => {
    await mountView();
    await wrapper!.findAllComponents(VBtn).find((b) => b.text().includes("BUSCAR"))!.trigger("click");
    expect(fetchClasses).not.toHaveBeenCalled();
  });

  it("re-searches when year or month changes once a search is possible", async () => {
    await mountView();
    await selectByLabel("Generación").vm.$emit("update:modelValue", 1);
    await selectByLabel("Año").vm.$emit("update:modelValue", 2025);
    await flushPromises();
    expect(fetchClasses).toHaveBeenLastCalledWith(
      expect.objectContaining({ year: 2025, month: 11 }),
    );
  });
});
