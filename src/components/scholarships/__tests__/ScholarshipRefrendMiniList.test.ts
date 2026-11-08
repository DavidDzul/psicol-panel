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

  const net = (overrides: Record<string, unknown> = {}) => ({
    beca: "0.00",
    apoyo: "0.00",
    pago_iu: "0.00",
    temporary_increase: "0.00",
    telmex_coverage: "0.00",
    pending_and_advance: "0.00",
    total: "0.00",
    nominal: { beca: "0.00", apoyo: "0.00", pago_iu: "0.00", temporary_increase: "0.00" },
    ...overrides,
  });

  const subtitle = (wrapper: Awaited<ReturnType<typeof mountList>>["wrapper"]) =>
    wrapper.find(".v-list-item-subtitle").text();

  it("shows the net Beca and Apoyo instead of base_amount", async () => {
    const { wrapper } = await mountList([
      buildRefrend(1, {
        base_amount: "1800",
        net_breakdown: net({
          beca: "1545.45",
          apoyo: "154.55",
          nominal: { beca: "1800.00", apoyo: "200.00", pago_iu: "0.00", temporary_increase: "0.00" },
        }),
      }),
    ]);
    const text = subtitle(wrapper);
    expect(text).toContain("Beca: $1,545.45");
    expect(text).toContain("Apoyo: $154.55");
    expect(text).not.toContain("$1,800.00");
  });

  it("shows the net Pago IU for a TELMEX_IU refrend", async () => {
    const { wrapper } = await mountList([
      buildRefrend(1, {
        snapshot_scholarship_type: "TELMEX_IU",
        base_amount: "350",
        net_breakdown: net({
          pago_iu: "315.00",
          nominal: { beca: "0.00", apoyo: "0.00", pago_iu: "350.00", temporary_increase: "0.00" },
        }),
      }),
    ]);
    const text = subtitle(wrapper);
    expect(text).toContain("Pago IU: $315.00");
    expect(text).not.toContain("Apoyo");
  });

  it("falls back to base_amount when the refrend has no net_breakdown", async () => {
    const { wrapper } = await mountList([buildRefrend(1, { base_amount: "1000" })]);
    expect(subtitle(wrapper)).toContain("Beca: $1,000.00");
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
