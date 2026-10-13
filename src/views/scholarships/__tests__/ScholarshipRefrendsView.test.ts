// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { DOMWrapper, flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createVuetify } from "vuetify";
import { reactive, ref } from "vue";
import ScholarshipRefrendsView from "@/views/scholarships/ScholarshipRefrendsView.vue";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";
import { useGenerationsStore } from "@/stores/api/generationStore";
import type { Generation } from "@/interfaces/generation";
import type { GenerateRefrendsResult } from "@/interfaces/scholarship";

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

// VOverlay's location strategy (used by the real, non-stubbed v-dialog in
// this view) reads the bare global — jsdom doesn't define it at all.
if (!("visualViewport" in window)) {
  Object.defineProperty(window, "visualViewport", { value: null, writable: true });
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

const buildGeneration = (overrides: Partial<Generation> = {}): Generation => ({
  id: 1,
  campus: "CDMX",
  generation_active: true,
  generation_name: "Generación A",
  ...overrides,
});

const buildGenerateResult = (
  overrides: Partial<GenerateRefrendsResult> = {},
): GenerateRefrendsResult => ({
  created: 1,
  skipped: 0,
  skipped_out_of_reticula: 0,
  errors: 0,
  failures: [],
  ...overrides,
});

// `generations` populates the REAL generationsStore (not mocked — see
// useSedeRefrendGeneration's own test file for why: it reads
// storeToRefs(useGenerationsStore()).resGenerations). A fresh pinia instance
// is created and activated explicitly (not just passed to `plugins`) so
// `useGenerationsStore()` can be called here, outside any component's
// setup(), to seed it before mount.
const mountView = async (
  mode: "verificacion" | "aprobacion",
  generations: Generation[] = [],
) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  // NOTE (gotcha, see sdd/verificacion-incidencias-ux apply-progress): the
  // store proxy auto-unwraps top-level refs — assign the unwrapped property
  // directly (`resGenerations = ...`), never `.resGenerations.value = ...`,
  // or the real ref's Map silently stays empty.
  useGenerationsStore().resGenerations = new Map(
    generations.map((g) => [g.id, g]),
  );

  const wrapper = mount(ScholarshipRefrendsView, {
    props: { mode },
    global: {
      plugins: [pinia, vuetify],
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

// sdd/verificacion-incidencias-ux PR3: "Generar ref." no longer requires a
// generación — it loops SEQUENTIALLY over every generación of the selected
// sede via useSedeRefrendGeneration. The dialog/button in these tests are
// real (not stubbed) — v-dialog teleports its content to document.body, so
// interactions go through a DOMWrapper over the body, same convention as
// SituationRetenidaDialog.test.ts.
describe("ScholarshipRefrendsView — Verificación: per-sede sequential generation (PR3)", () => {
  const body = () => new DOMWrapper(document.body);

  const findButtonByText = (text: string) => {
    const match = body()
      .findAll("button")
      .find((b) => b.text().trim() === text);
    if (!match) throw new Error(`Button "${text}" not found`);
    return match;
  };

  it('"Generar ref." is enabled with only sede selected — no generación required', async () => {
    const wrapper = await mountView("verificacion", [buildGeneration()]);

    const generarBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Generar ref."));
    expect(generarBtn).toBeTruthy();
    // `.attributes("disabled")` returns "" (falsy!) for a disabled boolean
    // attribute with no value — checking the native DOM property instead,
    // which reliably reflects true/false either way.
    expect((generarBtn?.element as HTMLButtonElement).disabled).toBe(false);
  });

  it("dialog copy describes the sede-wide sequential per-generación behavior, not a single-generación or atomic claim", async () => {
    const wrapper = await mountView("verificacion", [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
    ]);

    await wrapper
      .findAll("button")
      .find((b) => b.text().includes("Generar ref."))!
      .trigger("click");
    await flushPromises();

    const dialogText = body().text();
    expect(dialogText).toContain("una por una");
    expect(dialogText.toLowerCase()).not.toContain("atómic");
    expect(dialogText.toLowerCase()).not.toContain("todo o nada");
  });

  it("calls generatePeriod once per generación of the sede, sequentially, then refreshes the table and shows the summary", async () => {
    const wrapper = await mountView("verificacion", [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
    ]);
    generatePeriod.mockReset();
    generatePeriod.mockResolvedValue(buildGenerateResult({ created: 3 }));
    fetchIncidenciasTable.mockClear();

    await wrapper
      .findAll("button")
      .find((b) => b.text().includes("Generar ref."))!
      .trigger("click");
    await flushPromises();

    await findButtonByText("Confirmar").trigger("click");
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(generatePeriod).toHaveBeenCalledTimes(2);
    expect(generatePeriod).toHaveBeenNthCalledWith(1, expect.objectContaining({ generation_id: 1 }));
    expect(generatePeriod).toHaveBeenNthCalledWith(2, expect.objectContaining({ generation_id: 2 }));

    // Table refresh after the loop finishes (fixes the pre-PR3 bug where the
    // legacy fetchRefrends reloaded instead of the Verificación table).
    expect(fetchIncidenciasTable).toHaveBeenCalled();

    // Summary dialog shows the per-generación result.
    expect(body().text()).toContain("Resumen de generación");
    expect(body().text()).toContain("Gen A");
    expect(body().text()).toContain("Gen B");
  });

  it("continues to the next generación when one request fails, reporting it in the summary instead of aborting", async () => {
    const wrapper = await mountView("verificacion", [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
    ]);
    generatePeriod.mockReset();
    generatePeriod
      .mockResolvedValueOnce(buildGenerateResult({ created: 1 }))
      .mockRejectedValueOnce(new Error("network down"));

    await wrapper
      .findAll("button")
      .find((b) => b.text().includes("Generar ref."))!
      .trigger("click");
    await flushPromises();

    await findButtonByText("Confirmar").trigger("click");
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(generatePeriod).toHaveBeenCalledTimes(2);
    expect(body().text()).toContain("network down");
  });
});
