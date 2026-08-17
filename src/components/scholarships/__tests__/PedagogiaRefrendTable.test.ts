// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { VSelect, VSwitch } from "vuetify/components";
import PedagogiaRefrendTable from "@/components/scholarships/PedagogiaRefrendTable.vue";
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";
import SituationRetenidaDialog from "@/components/scholarships/SituationRetenidaDialog.vue";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// recordPaymentSituation hits axios directly (no repository seam) — mocked
// at the module boundary so the "close the right dialog" tests below never
// touch the network. incidenciasRows is read by `cleanDraftIds` on every
// render regardless of which test runs.
const recordPaymentSituation = vi.fn().mockResolvedValue(undefined);
const clearRefrendResolution = vi.fn().mockResolvedValue(undefined);
const approveFullPayment = vi.fn().mockResolvedValue(undefined);
vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    incidenciasRows: [],
    recordPaymentSituation,
    approveFullPayment,
    clearRefrendResolution,
    bulkApprove: vi.fn(),
    pedagogiaResolve: vi.fn(),
  }),
}));

// ConfirmationDialog (real component, not stubbed below) renders a real
// v-dialog when opened — same jsdom shims RefrendSituationBar.test.ts and
// SituationPagoMesesDialog.test.ts need for Vuetify's overlay strategy.
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

const body = () => new DOMWrapper(document.body);

// v-dialog/v-tooltip content teleports straight to `document.body`,
// bypassing the mounted wrapper's own subtree. Without clearing it between
// tests, teleported nodes from a previous test (e.g. a still-open
// ConfirmationDialog nobody clicked through) leak into the next test's
// `body()` queries.
afterEach(() => {
  document.body.innerHTML = "";
});

// ── Test harness ─────────────────────────────────────────────────────────────
//
// Full mount (not shallow): the behavior under test is the row-filter
// predicate inside `displayRows`, which is only observable through what
// actually renders in the DOM (script setup exposes no internal refs).
// Heavy leaf components with their own dialog/store wiring are stubbed —
// irrelevant to the filter itself and would otherwise need unrelated props.

const vuetify = createVuetify();

const STUBS = {
  RefrendPedagogiaDialog: true,
  SituationSinPagoDialog: true,
  SituationRetenidaDialog: true,
  SituationPagoMesesDialog: true,
  SituationSuspendidaDialog: true,
  SituationBajaDialog: true,
  SituationEgresadoDialog: true,
  RefrendSituationBar: true,
  IncidentDetailIcon: true,
  StatusIcon: true,
};

const baseRefrend: ScholarshipRefrend = {
  id: 1,
  user_id: 1,
  period_year: 2026,
  period_month: 5,
  refrend_type: "NORMAL",
  status: "DRAFT",
  workflow_status: "DRAFT",
  resolution_type: null,
  resolution_cause: null,
  resolution_notes: null,
  suspension_percentage: null,
  withholding_mode: null,
  withholding_value: null,
  carryover_months_count: null,
  carryover_months_detail: null,
  carryover_percentage: null,
  snapshot_gross_amount: null,
  snapshot_monto_apoyo: null,
  base_amount: "1000",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "1000",
  amount_pending_from_previous: "0",
  total_to_pay: "1000",
  snapshot_name: "Becario",
  snapshot_generation: "Gen Única",
  snapshot_generation_id: 1,
  snapshot_campus: "CDMX",
  snapshot_scholarship_type: "IU",
  atencion_observations: null,
  atencion_labels: null,
  atencion_reviewed_by_id: null,
  atencion_reviewed_at: null,
  pedagogia_observations: null,
  pedagogia_reviewed_by_id: null,
  pedagogia_reviewed_at: null,
  notified_by_id: null,
  notified_at: null,
  notification_method: null,
  locked_at: null,
  locked_by_id: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

const buildRow = (
  id: number,
  name: string,
  incidentsCount: number,
  pendingCount: number,
  advancePaymentEligible = false,
): BulkRefrendRow => ({
  refrend: { ...baseRefrend, id, snapshot_name: name },
  attendance_present: 0,
  attendance_late: 0,
  attendance_late_justified: 0,
  attendance_late_consumed: 0,
  attendance_late_unconsumed: 0,
  attendance_absent: 0,
  attendance_absent_justified: 0,
  attendance_total: 0,
  last_grade: null,
  academic_status: "ok",
  active_discount_pct: "0",
  projected_amount: "0",
  incidents_count: incidentsCount,
  incident_description: null,
  incident_category: null,
  incident_type: null,
  semester_lates_unconsumed: 0,
  month_absent: 0,
  has_retardos_discount: false,
  has_falta_discount: false,
  profile_discount_pct: null,
  profile_discount_valid_until: null,
  profile_discount_reason: null,
  pending_withholding_count: pendingCount,
  pending_withholding_amount: pendingCount > 0 ? "500.00" : null,
  advance_payment_eligible: advancePaymentEligible,
});

const mountTable = (rows: BulkRefrendRow[]) =>
  mount(PedagogiaRefrendTable, {
    props: { rows, year: 2026, month: 5 },
    global: {
      plugins: [createPinia(), vuetify],
      stubs: STUBS,
    },
  });

// ── Tests ─────────────────────────────────────────────────────────────────
//
// spec "Criterio de inclusión de filas en Pedagogía": incidents_count > 0 OR
// pending_withholding_count > 0.

describe("PedagogiaRefrendTable — row filter", () => {
  it("includes a row with an incidencia and no pending withholding (preexisting behavior)", async () => {
    const rows = [buildRow(1, "Ana Incidencia", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Ana Incidencia");
  });

  it("includes a row with a pending withholding and no incidencia (new behavior)", async () => {
    const rows = [buildRow(2, "Beto Retencion", 0, 1)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Beto Retencion");
  });

  it("excludes a row with neither an incidencia nor a pending withholding", async () => {
    const rows = [buildRow(3, "Carla Limpia", 0, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("Carla Limpia");
  });

  it("shows both indicators for a row with an incidencia and a pending withholding", async () => {
    const rows = [buildRow(4, "Dana Ambos", 1, 2)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Dana Ambos");
    // pendingWithholdingChip renders the formatted amount for count > 0.
    expect(wrapper.text()).toContain("$500.00");
  });

  it("keeps included/excluded rows correctly separated when mixed in the same generación", async () => {
    const rows = [
      buildRow(5, "Incluido Incidencia", 1, 0),
      buildRow(6, "Incluido Retencion", 0, 1),
      buildRow(7, "Excluido Limpio", 0, 0),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Incluido Incidencia");
    expect(wrapper.text()).toContain("Incluido Retencion");
    expect(wrapper.text()).not.toContain("Excluido Limpio");
  });
});

describe('PedagogiaRefrendTable — "todos" mode', () => {
  // Vuetify's real v-select menu doesn't reliably open/select in jsdom;
  // switching mode is driven directly through the VSelect's v-model emit,
  // same approach the design doc calls out.
  const switchToTodos = async (wrapper: ReturnType<typeof mountTable>) => {
    await wrapper
      .findComponent(VSelect)
      .vm.$emit("update:modelValue", "todos");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  };

  const switchToIncidencias = async (wrapper: ReturnType<typeof mountTable>) => {
    await wrapper
      .findComponent(VSelect)
      .vm.$emit("update:modelValue", "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  };

  it('shows every row regardless of incident/withholding state when "todos" is selected', async () => {
    const rows = [
      buildRow(11, "Hugo Incidencia", 1, 0),
      buildRow(12, "Iris Retencion", 0, 1),
      buildRow(13, "Julio Limpio", 0, 0),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await switchToTodos(wrapper);

    expect(wrapper.text()).toContain("Hugo Incidencia");
    expect(wrapper.text()).toContain("Iris Retencion");
    expect(wrapper.text()).toContain("Julio Limpio");
  });

  it('still narrows results by name search while in "todos" mode', async () => {
    const rows = [
      buildRow(14, "Karla Limpia", 0, 0),
      buildRow(15, "Luis Limpio", 0, 0),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await switchToTodos(wrapper);

    await wrapper
      .find('input[placeholder="Buscar por nombre becario..."]')
      .setValue("Karla");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Karla Limpia");
    expect(wrapper.text()).not.toContain("Luis Limpio");
  });

  it('restores the incident-filtered set after switching back to "incidencias"', async () => {
    const rows = [
      buildRow(16, "Mario Incidencia", 1, 0),
      buildRow(17, "Nora Limpia", 0, 0),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await switchToTodos(wrapper);
    expect(wrapper.text()).toContain("Nora Limpia");

    await switchToIncidencias(wrapper);

    expect(wrapper.text()).toContain("Mario Incidencia");
    expect(wrapper.text()).not.toContain("Nora Limpia");
  });

  it('renders the "todos" empty-state copy when no rows match', async () => {
    const wrapper = mountTable([]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await switchToTodos(wrapper);

    expect(wrapper.text()).toContain("Sin becarios en este periodo.");
  });

  it('renders the "incidencias" empty-state copy by default', async () => {
    const rows = [buildRow(18, "Omar Limpio", 0, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Sin becarios con incidencia o retención pendiente en este periodo.",
    );
  });
});

describe('PedagogiaRefrendTable — "Solo pago adelantado" switch', () => {
  // Orthogonal to rowFilterMode (ANDs into displayRows), not a third
  // mutually-exclusive rowFilterMode value — a becario can have both,
  // either, or neither criterion.
  const toggleAdvancePaymentOnly = async (
    wrapper: ReturnType<typeof mountTable>,
    value: boolean,
  ) => {
    await wrapper.findComponent(VSwitch).vm.$emit("update:modelValue", value);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  };

  it("shows only advance-payment-eligible rows when the switch is on", async () => {
    const rows = [
      buildRow(30, "Pago Adelantado Con Incidencia", 1, 0, true),
      buildRow(31, "Sin Pago Adelantado Con Incidencia", 1, 0, false),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);

    expect(wrapper.text()).toContain("Pago Adelantado Con Incidencia");
    expect(wrapper.text()).not.toContain("Sin Pago Adelantado Con Incidencia");
  });

  it("combines (AND) with the incidencias row filter — excludes an eligible row with no incidencia/retención", async () => {
    const rows = [buildRow(32, "Elegible Limpio", 0, 0, true)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);

    expect(wrapper.text()).not.toContain("Elegible Limpio");
  });

  it("combines (AND) with name search", async () => {
    const rows = [
      buildRow(33, "Karla Elegible", 1, 0, true),
      buildRow(34, "Luis Elegible", 1, 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);
    await wrapper
      .find('input[placeholder="Buscar por nombre becario..."]')
      .setValue("Karla");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Karla Elegible");
    expect(wrapper.text()).not.toContain("Luis Elegible");
  });

  it("leaves existing behavior unaffected when the switch stays off", async () => {
    const rows = [
      buildRow(35, "No Elegible Con Incidencia", 1, 0, false),
      buildRow(36, "Elegible Con Incidencia", 1, 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("No Elegible Con Incidencia");
    expect(wrapper.text()).toContain("Elegible Con Incidencia");
  });
});

describe("PedagogiaRefrendTable — due amount passed to RETENIDA/PAGO_MESES dialogs", () => {
  it("passes the recomputed due amount, not the stale final_amount left by a prior resolution", async () => {
    // Simulates a refrend already resolved as RETENIDA once (final_amount=600
    // is what's left over from that), now being re-resolved: the amount the
    // backend will actually charge is 800 (1000 gross, 20% profile discount),
    // not the stale 600 sitting on final_amount.
    const row = buildRow(8, "Elena Redue", 1, 0);
    row.refrend = {
      ...row.refrend,
      snapshot_gross_amount: "1000",
      snapshot_discount_percentage: "20",
      base_amount: "1000",
      final_amount: "600",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "RETENIDA");
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(SituationRetenidaDialog).props("finalAmount")).toBe(800);
    expect(wrapper.findComponent(SituationPagoMesesDialog).props("currentMonthAmount")).toBe(
      800,
    );
  });
});

describe("PedagogiaRefrendTable — activeSituationKey closes the dialog that was actually opened", () => {
  // SituationPagoMesesDialog can emit either BECA_MES or SIN_PAGO depending
  // on its "pagar mes en curso" checkbox. Inferring which situationDialogs
  // entry to close from `form.resolution_type` would close
  // situationDialogs.SIN_PAGO (a separate, standalone dialog) instead of
  // situationDialogs.PAGO_MESES when the checkbox is unchecked — the bug
  // activeSituationKey fixes.

  it("closes situationDialogs.PAGO_MESES (not SIN_PAGO's dialog) when PAGO_MESES submits SIN_PAGO", async () => {
    const row = buildRow(9, "Fede SinPago", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "PAGO_MESES");
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(SituationPagoMesesDialog).props("modelValue")).toBe(true);

    await wrapper.findComponent(SituationPagoMesesDialog).vm.$emit("submit", {
      resolution_type: "SIN_PAGO",
      resolution_cause: "PAGO_MESES_RETENIDOS_SIN_MES_ACTUAL",
      withholding_payments: [{ withholding_id: 1, amount: 100 }],
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(SituationPagoMesesDialog).props("modelValue")).toBe(false);
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(false);
  });

  it("closes situationDialogs.PAGO_MESES when it submits BECA_MES (checked path — regression guard)", async () => {
    const row = buildRow(10, "Gaby BecaMes", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "PAGO_MESES");
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(SituationPagoMesesDialog).props("modelValue")).toBe(true);

    await wrapper.findComponent(SituationPagoMesesDialog).vm.$emit("submit", {
      resolution_type: "BECA_MES",
      withholding_payments: [{ withholding_id: 1, amount: 100 }],
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(SituationPagoMesesDialog).props("modelValue")).toBe(false);
  });
});

describe("PedagogiaRefrendTable — onClearResolution wiring", () => {
  it("calls store.clearRefrendResolution with the row id and toggles loading around it", async () => {
    const row = buildRow(19, "Hilda Deshacer", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const bar = wrapper.findComponent(RefrendSituationBar);
    expect(bar.props("loading")).toBe(false);

    bar.vm.$emit("clear-resolution");
    await wrapper.vm.$nextTick();

    expect(clearRefrendResolution).toHaveBeenCalledWith(19);
    // clearRefrendResolution resolves on the next microtask tick — assert
    // loading flips back to false once the handler's finally block runs.
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(RefrendSituationBar).props("loading")).toBe(false);
  });
});

describe("PedagogiaRefrendTable — onApproveFullPayment confirmation flow", () => {
  const clickButton = async (label: string): Promise<void> => {
    const btn = body()
      .findAll("button")
      .find((b) => b.text().trim() === label);
    if (!btn) throw new Error(`Button "${label}" not found`);
    await btn.trigger("click");
  };

  it("shows the confirmation copy with amount, name, month/year, and the academic-discount clause when applicable", async () => {
    const row = buildRow(20, "Confirm Copy", 1, 0);
    row.refrend = {
      ...row.refrend,
      base_amount: "1000",
      snapshot_gross_amount: null,
      snapshot_discount_percentage: "20",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const text = body().text();
    // computeDueAmount applies the 20% academic discount: 1000 * 0.8 = 800.
    expect(text).toContain("$800.00");
    expect(text).toContain("Confirm Copy");
    expect(text).toContain("Mayo 2026");
    expect(text).toContain("Se mantiene el descuento académico del 20%.");

    wrapper.unmount();
  });

  it("omits the academic-discount clause when snapshot_discount_percentage is null", async () => {
    const row = buildRow(21, "No Academic Discount", 1, 0);
    row.refrend = {
      ...row.refrend,
      base_amount: "1000",
      snapshot_gross_amount: null,
      snapshot_discount_percentage: null,
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(body().text()).not.toContain("Se mantiene el descuento académico");

    wrapper.unmount();
  });

  it("calls store.approveFullPayment exactly once when the user confirms", async () => {
    approveFullPayment.mockClear();
    const row = buildRow(22, "Confirma Pago", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await clickButton("Confirmar");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(approveFullPayment).toHaveBeenCalledTimes(1);
    expect(approveFullPayment).toHaveBeenCalledWith(22);

    wrapper.unmount();
  });

  it('titles the dialog "Pagar sin descuento por faltas" and includes the forgiveness clause when the row has an active attendance discount', async () => {
    const row = buildRow(24, "Con Retardos", 1, 0);
    row.has_retardos_discount = true;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const text = body().text();
    expect(text).toContain("Pagar sin descuento por faltas");
    expect(text).toContain("Se perdonan sus faltas/retardos de este mes.");

    wrapper.unmount();
  });

  it('titles the dialog "Aprobar" and omits the forgiveness clause when the row has no active attendance discount', async () => {
    const row = buildRow(25, "Sin Descuentos", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const text = body().text();
    expect(text).toContain("Aprobar");
    expect(text).not.toContain("Se perdonan sus faltas/retardos de este mes.");
    expect(text).not.toContain("Pagar sin descuento por faltas");

    wrapper.unmount();
  });

  it("does NOT call store.approveFullPayment when the user cancels", async () => {
    approveFullPayment.mockClear();
    const row = buildRow(23, "Cancela Pago", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await clickButton("Cancelar");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(approveFullPayment).not.toHaveBeenCalled();

    wrapper.unmount();
  });
});
