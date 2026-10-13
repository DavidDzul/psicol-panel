// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { reactive, ref } from "vue";
import ScholarshipRefrendsView from "@/views/scholarships/ScholarshipRefrendsView.vue";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";

// ── Store mocks ──────────────────────────────────────────────────────────────
//
// sdd/verificacion-incidencias-ux PR2: Verificación no longer has its own
// tabs/viewVariant — it reads the SAME incidencias* store pair Aprobación
// already uses (design: "Verificación reads the incidencias* pair, the same
// as Aprobación"). fetchRefrends/refrends back the unrelated legacy list
// read by useScholarshipPage's onBeforeMount hook.
//
// Wrapped in `reactive()`, not a plain object literal: `useScholarshipPage`
// calls `storeToRefs(store)` on whatever this mock returns, and pinia's
// storeToRefs does `rawStore[key].effect` for EVERY key while iterating —
// a raw `null` property value (e.g. incidenciasError) crashes that check
// ("Cannot read properties of null"). Real Pinia stores never hit this
// because every exposed state property is itself a ref/computed, never a
// bare primitive — `reactive()` + `ref(null)` here reproduces that shape so
// both storeToRefs (via toRaw) and direct property access behave the same
// way a real store does.

const fetchIncidenciasTable = vi.fn().mockResolvedValue(undefined);
const fetchBulkTable = vi.fn().mockResolvedValue(undefined);
const fetchRefrends = vi.fn().mockResolvedValue(undefined);
const resetBulkTable = vi.fn();
const resetIncidenciasTable = vi.fn();
const generatePeriod = vi.fn().mockResolvedValue(undefined);

const sharedStore = reactive({
  refrends: new Map(),
  incidenciasRows: [] as unknown[],
  incidenciasLoading: false,
  incidenciasError: ref(null) as unknown as string | null,
  bulkRows: [] as unknown[],
  bulkLoading: false,
  bulkError: ref(null) as unknown as string | null,
  fetchIncidenciasTable,
  fetchBulkTable,
  fetchRefrends,
  resetBulkTable,
  resetIncidenciasTable,
  generatePeriod,
});

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => sharedStore,
}));

vi.mock("@/stores/api/authStore", () => ({
  useAuthStore: () => ({
    filteredCampus: ref([{ value: "CDMX", text: "CDMX" }]),
  }),
}));

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const vuetify = createVuetify();

// VerificacionRefrendTable/AprobacionRefrendTable are exercised in their own
// dedicated test files — stubbed here (by local template name, NOT vi.mock —
// vue-test-utils' async-component stubbing needs the real module shape) so
// this suite stays focused on the shared view's filter wiring, tab removal,
// and fetch dispatch.
const STUBS = {
  BreadCrumbs: true,
  VerificacionRefrendTable: true,
  AprobacionRefrendTable: true,
};

const mountView = async (mode: "verificacion" | "aprobacion") => {
  const wrapper = mount(ScholarshipRefrendsView, {
    props: { mode },
    global: {
      plugins: [createPinia(), vuetify],
      stubs: STUBS,
    },
  });
  await flushPromises();
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
};

describe("ScholarshipRefrendsView — Verificación (tabs removed, sede-wide query)", () => {
  it("renders no tab UI (CONSULTA POR GENERACIONES / CONSULTA POR INCIDENCIAS are gone)", async () => {
    const wrapper = await mountView("verificacion");

    expect(wrapper.text()).not.toContain("CONSULTA POR GENERACIONES");
    expect(wrapper.text()).not.toContain("CONSULTA POR INCIDENCIAS");
    expect(wrapper.findComponent({ name: "VTabs" }).exists()).toBe(false);
  });

  it("passes require-generation=false to ScholarshipFilters", async () => {
    const wrapper = await mountView("verificacion");

    expect(wrapper.findComponent(ScholarshipFilters).props("requireGeneration")).toBe(
      false,
    );
  });

  it('calls fetchIncidenciasTable with generation_id null on "Buscar" — no generación selection required', async () => {
    const wrapper = await mountView("verificacion");
    fetchIncidenciasTable.mockClear();
    fetchBulkTable.mockClear();

    await wrapper.findComponent(ScholarshipFilters).vm.$emit("search");
    await flushPromises();

    expect(fetchIncidenciasTable).toHaveBeenCalledWith(
      expect.objectContaining({ generation_id: null, campus: "CDMX" }),
    );
    expect(fetchBulkTable).not.toHaveBeenCalled();
  });

  it('keeps "Generar ref." reachable in Verificación', async () => {
    const wrapper = await mountView("verificacion");

    expect(wrapper.text()).toContain("Generar ref.");
  });

  it("renders VerificacionRefrendTable (not AprobacionRefrendTable)", async () => {
    const wrapper = await mountView("verificacion");

    expect(
      wrapper.findComponent({ name: "VerificacionRefrendTable" }).exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: "AprobacionRefrendTable" }).exists(),
    ).toBe(false);
  });
});

describe("ScholarshipRefrendsView — Aprobación (regression: must render and behave exactly as today)", () => {
  it("renders no tab UI", async () => {
    const wrapper = await mountView("aprobacion");

    expect(wrapper.findComponent({ name: "VTabs" }).exists()).toBe(false);
  });

  it("passes require-generation=false to ScholarshipFilters (unchanged)", async () => {
    const wrapper = await mountView("aprobacion");

    expect(wrapper.findComponent(ScholarshipFilters).props("requireGeneration")).toBe(
      false,
    );
  });

  it("does not render a Generar ref. button", async () => {
    const wrapper = await mountView("aprobacion");

    expect(wrapper.text()).not.toContain("Generar ref.");
  });

  it('calls fetchIncidenciasTable with generation_id null on "Buscar" (same as before this change)', async () => {
    const wrapper = await mountView("aprobacion");
    fetchIncidenciasTable.mockClear();
    fetchBulkTable.mockClear();

    await wrapper.findComponent(ScholarshipFilters).vm.$emit("search");
    await flushPromises();

    expect(fetchIncidenciasTable).toHaveBeenCalledWith(
      expect.objectContaining({ generation_id: null, campus: "CDMX" }),
    );
    expect(fetchBulkTable).not.toHaveBeenCalled();
  });

  it("renders AprobacionRefrendTable (not VerificacionRefrendTable)", async () => {
    const wrapper = await mountView("aprobacion");

    expect(
      wrapper.findComponent({ name: "AprobacionRefrendTable" }).exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: "VerificacionRefrendTable" }).exists(),
    ).toBe(false);
  });
});
