// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";
import { createVuetify } from "vuetify";
import ScholarshipWithholdingsCard from "@/components/scholarships/ScholarshipWithholdingsCard.vue";
import type { ScholarshipWithholding } from "@/interfaces/scholarship";

const rows = ref<ScholarshipWithholding[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const load = vi.fn();

vi.mock("@/composables/useScholarshipWithholdings", () => ({
  useScholarshipWithholdings: () => ({ rows, loading, error, load }),
}));

const vuetify = createVuetify();

const build = (over: Partial<ScholarshipWithholding> = {}): ScholarshipWithholding => ({
  id: 1,
  user_id: 9,
  origin_refrend_id: 3,
  period_year: 2026,
  period_month: 3,
  withheld_amount: "500.00",
  paid_amount: "0.00",
  remaining_amount: "500.00",
  cause: "Faltas",
  status: "PENDING",
  ...over,
});

const mountCard = async () => {
  const wrapper = mount(ScholarshipWithholdingsCard, {
    props: { userId: 9 },
    global: { plugins: [vuetify] },
  });
  await flushPromises();
  return wrapper;
};

describe("ScholarshipWithholdingsCard", () => {
  beforeEach(() => {
    rows.value = [];
    loading.value = false;
    error.value = null;
    load.mockReset();
  });

  it("loads the withholdings of the user on mount", async () => {
    await mountCard();
    expect(load).toHaveBeenCalledWith(9);
  });

  it("shows the empty state (S15)", async () => {
    const w = await mountCard();
    expect(w.text()).toContain("Este becario no tiene retenciones.");
  });

  it("shows the error state", async () => {
    error.value = "No se pudieron cargar las retenciones.";
    const w = await mountCard();
    expect(w.text()).toContain("No se pudieron cargar las retenciones.");
    expect(w.text()).not.toContain("Este becario no tiene retenciones.");
  });

  it("shows a progress bar while loading and no empty state", async () => {
    loading.value = true;
    const w = await mountCard();
    expect(w.find(".v-progress-linear").exists()).toBe(true);
    expect(w.text()).not.toContain("Este becario no tiene retenciones.");
  });

  it("renders period, amounts, status and cause for a pending row", async () => {
    rows.value = [build({ paid_amount: "100.00", remaining_amount: "400.00" })];
    const w = await mountCard();
    const text = w.text();
    expect(text).toContain("Marzo 2026");
    expect(text).toContain("$500.00");
    expect(text).toContain("$100.00");
    expect(text).toContain("Pendiente");
    expect(text).toContain("Faltas");
  });

  it("renders the reason, date and canceller for a cancelled row", async () => {
    rows.value = [
      build({
        status: "CANCELLED",
        cancellation_reason: "USER_DEACTIVATED",
        cancelled_at: "2026-10-15T18:00:00Z",
        cancelled_by: { id: 2, first_name: "Luis", last_name: "Mora" },
      }),
    ];
    const w = await mountCard();
    const text = w.text();
    expect(text).toContain("Cancelada");
    expect(text).toContain("Usuario desactivado");
    expect(text).toContain("2026");
    expect(text).toContain("Luis Mora");
  });

  it("shows the neutral label and no canceller for a legacy cancelled row", async () => {
    rows.value = [build({ status: "CANCELLED", cancellation_reason: null, cancelled_at: null, cancelled_by: null })];
    const w = await mountCard();
    expect(w.text()).toContain("Sin motivo registrado");
    expect(w.text()).not.toContain("Cancelada por");
  });

  it("does not show cancellation details for non-cancelled rows", async () => {
    rows.value = [build({ status: "PAID", paid_amount: "500.00", remaining_amount: "0.00" })];
    const w = await mountCard();
    expect(w.text()).toContain("Pagada");
    expect(w.text()).not.toContain("Sin motivo registrado");
  });
});
