// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import ScholarshipRefrendMiniList from "@/components/scholarships/ScholarshipRefrendMiniList.vue";
import { statusChip } from "@/composables/useRefrendTableDisplay";
import type { ScholarshipRefrend } from "@/interfaces/scholarship";

const fetchRefrendsForUser = vi.fn();

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({ fetchRefrendsForUser }),
}));

const vuetify = createVuetify();

const buildRefrend = (
  id: number,
  overrides: Partial<ScholarshipRefrend> = {},
): ScholarshipRefrend =>
  ({
    id,
    user_id: 1,
    period_year: 2026,
    period_month: 5,
    refrend_type: "NORMAL",
    status: "DRAFT",
    workflow_status: "DRAFT",
    resolution_type: null,
    base_amount: "1000",
    discount_percentage: "0",
    final_amount: "1000",
    snapshot_scholarship_type: "IU",
    ...overrides,
  }) as ScholarshipRefrend;

const mountList = async (items: ScholarshipRefrend[]) => {
  fetchRefrendsForUser.mockResolvedValue(items);
  const push = vi.fn();
  const wrapper = mount(ScholarshipRefrendMiniList, {
    props: { userId: 1 },
    global: { plugins: [vuetify], mocks: { $router: { push } } },
  });
  await flushPromises();
  return { wrapper, push };
};

const chipTexts = (wrapper: Awaited<ReturnType<typeof mountList>>["wrapper"]) =>
  wrapper.findAll(".v-chip").map((c) => c.text());

describe("ScholarshipRefrendMiniList", () => {
  beforeEach(() => fetchRefrendsForUser.mockReset());

  const cases: Array<[string, Partial<ScholarshipRefrend>, string]> = [
    ["draft", { workflow_status: "DRAFT" }, "Borrador"],
    ["incidencia", { workflow_status: "CON_INCIDENCIA" }, "Con incidencia"],
    ["listo para pago", { workflow_status: "LISTO_PARA_PAGO" }, "Listo para pago"],
    [
      "closed and paid",
      { workflow_status: "CLOSED", status: "PAID" },
      "Pagado",
    ],
    [
      "egreso por retícula",
      {
        workflow_status: "CLOSED",
        status: "CANCELLED",
        resolution_type: "EGRESO_RETICULA",
      },
      "Egresado (retícula)",
    ],
    [
      "cancelled outside closed",
      { workflow_status: "LISTO_PARA_PAGO", status: "CANCELLED" },
      "Baja",
    ],
  ];

  it.each(cases)("renders the workflow chip for %s", async (_name, overrides, text) => {
    const { wrapper } = await mountList([buildRefrend(1, overrides)]);
    expect(chipTexts(wrapper)).toEqual([text]);
  });

  it("chip text equals statusChip output across a fixture table", async () => {
    const refrends = cases.map(([, o], i) => buildRefrend(i + 1, o));
    const { wrapper } = await mountList(refrends);
    expect(chipTexts(wrapper)).toEqual(
      refrends.map((r) => statusChip(r as never).label),
    );
  });

  it("does not render an unknown legacy status as a crash", async () => {
    const legacy = buildRefrend(1, {
      status: "AUTHORIZED" as never,
      workflow_status: "LISTO_PARA_PAGO",
    });
    const { wrapper } = await mountList([legacy]);
    expect(chipTexts(wrapper)).toEqual(["Listo para pago"]);
  });

  it("does not navigate when a row is clicked", async () => {
    const { wrapper, push } = await mountList([buildRefrend(7)]);
    await wrapper.find(".v-list-item").trigger("click");
    expect(push).not.toHaveBeenCalled();
  });

  it("rows have no pointer affordance", async () => {
    const { wrapper } = await mountList([buildRefrend(7)]);
    expect(wrapper.find(".cursor-pointer").exists()).toBe(false);
    expect(wrapper.find(".v-list-item--link").exists()).toBe(false);
  });
});
