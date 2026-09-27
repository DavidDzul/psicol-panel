// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { VBtn, VSelect } from "vuetify/components";
import AprobacionRefrendTable from "@/components/scholarships/AprobacionRefrendTable.vue";
import StatusIcon from "@/components/scholarships/StatusIcon.vue";
import RefrendAprobacionDialog from "@/components/scholarships/RefrendAprobacionDialog.vue";
import { fmt } from "@/composables/useRefrendTableDisplay";
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";
import SituationRetenidaDialog from "@/components/scholarships/SituationRetenidaDialog.vue";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import SituationPagoAdelantadoDialog from "@/components/scholarships/SituationPagoAdelantadoDialog.vue";
import AdvanceDivergenceReasonDialog from "@/components/scholarships/AdvanceDivergenceReasonDialog.vue";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// recordPaymentSituation/recordAdvancePayment hit axios directly (no
// repository seam) — mocked at the module boundary so the "close the right
// dialog" tests below never touch the network. incidenciasRows is read by
// `cleanDraftIds` on every render regardless of which test runs.
//
// recordPaymentSituation resolves to a discriminated result (design D4 fix
// 2026-09-25) — the component reads `.status`, so the default mock must
// resolve to a shape with one, not bare `undefined` (see the dedicated
// "divergence-reason follow-up" describe block below for the
// divergence_required/error branches).
const recordPaymentSituation = vi
  .fn()
  .mockResolvedValue({ status: "success", refrend: {} });
const recordAdvancePayment = vi.fn().mockResolvedValue(undefined);
const clearRefrendResolution = vi.fn().mockResolvedValue(undefined);
// approveFullPayment resolves to a discriminated result too (design D4 fix
// 2026-09-27 — see the dedicated "divergence-reason follow-up" describe
// block below for the divergence_required/error branches), same reasoning
// as recordPaymentSituation's default mock above.
const approveFullPayment = vi.fn().mockResolvedValue({ status: "success", refrend: {} });
vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    incidenciasRows: [],
    recordPaymentSituation,
    recordAdvancePayment,
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
  RefrendAprobacionDialog: true,
  SituationSinPagoDialog: true,
  SituationRetenidaDialog: true,
  SituationPagoMesesDialog: true,
  SituationSuspendidaDialog: true,
  SituationBajaDialog: true,
  SituationEgresadoDialog: true,
  SituationPagoAdelantadoDialog: true,
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
  snapshot_gross_amount: null,
  snapshot_monto_apoyo: null,
  snapshot_temporary_increase_amount: null,
  snapshot_temporary_increase_reason: null,
  base_amount: "1000",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "1000",
  amount_pending_from_previous: "0",
  total_to_pay: "1000",
  advance_payment_amount: "0.00",
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
  advancePaid: {
    paid?: boolean;
    amount?: string | null;
    originYear?: number | null;
    originMonth?: number | null;
  } = {},
  advancePaymentAmount = "0.00",
): BulkRefrendRow => ({
  refrend: {
    ...baseRefrend,
    id,
    snapshot_name: name,
    advance_payment_amount: advancePaymentAmount,
  },
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
  advance_paid: advancePaid.paid ?? false,
  advance_paid_amount: advancePaid.amount ?? null,
  advance_paid_origin_year: advancePaid.originYear ?? null,
  advance_paid_origin_month: advancePaid.originMonth ?? null,
});

const mountTable = (rows: BulkRefrendRow[]) =>
  mount(AprobacionRefrendTable, {
    props: { rows, year: 2026, month: 5 },
    global: {
      plugins: [createPinia(), vuetify],
      stubs: STUBS,
    },
  });

// ── Tests ─────────────────────────────────────────────────────────────────
//
// spec "Criterio de inclusión de filas en Aprobación": incidents_count > 0 OR
// pending_withholding_count > 0 OR has_falta_discount OR has_retardos_discount
// OR advance_paid. The discount flags are deliberately the *already-applied*
// ones, not a raw "1 retardo sin consumir todavía" signal — a single
// unconsumed retardo isn't a chargeable event yet (needs 2 to fire the
// discount), so it must stay invisible here (see
// AttendancePenaltyService::applyPenaltyIfDue). advance_paid was added
// 2026-09-27 (user request): an arrived advance-paid month needs the same
// visibility as a pending withholding or a falta, or staff working from this
// default view could miss resolving it.

describe("AprobacionRefrendTable — row filter", () => {
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

  it("includes a row with has_falta_discount=true and none of the other criteria (new behavior)", async () => {
    const row = buildRow(60, "Fabio Falta", 0, 0);
    row.has_falta_discount = true;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Fabio Falta");
  });

  it("includes a row with has_retardos_discount=true and none of the other criteria (new behavior)", async () => {
    const row = buildRow(61, "Gina Retardos", 0, 0);
    row.has_retardos_discount = true;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Gina Retardos");
  });

  // User request (2026-09-27): a refrend that IS one of the future advance-
  // paid months, arrived, must surface here just like a pending withholding
  // or a falta — otherwise staff working from the default "Con incidencias"
  // view (this filter) would never see it and could miss resolving it.
  it("includes a row with advance_paid=true and none of the other criteria (new behavior)", async () => {
    const row = buildRow(63, "Ines Adelanto Llegado", 0, 0, false, { paid: true, amount: "1200.00", originYear: 2026, originMonth: 9 });
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Ines Adelanto Llegado");
  });

  it("excludes a row with a single unconsumed retardo — semester_lates_unconsumed=1 never fires the discount, so it must not surface here", async () => {
    const row = buildRow(62, "Hector Un Retardo", 0, 0);
    row.semester_lates_unconsumed = 1;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("Hector Un Retardo");
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

describe('AprobacionRefrendTable — "todos" mode', () => {
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

describe('AprobacionRefrendTable — "Pago adelantado" selector', () => {
  // Orthogonal to rowFilterMode (ANDs into displayRows), not a third
  // mutually-exclusive rowFilterMode value — a becario can have both,
  // either, or neither criterion. Second VSelect in template order (the
  // first is rowFilterMode's "Mostrar" selector).
  const toggleAdvancePaymentOnly = async (
    wrapper: ReturnType<typeof mountTable>,
    value: boolean,
  ) => {
    await wrapper
      .findAllComponents(VSelect)[1]
      .vm.$emit("update:modelValue", value);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  };

  it("shows only advance-payment-eligible rows when selected", async () => {
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

  it("leaves existing behavior unaffected when left on Todos", async () => {
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

describe("AprobacionRefrendTable — due amount passed to RETENIDA/PAGO_MESES dialogs", () => {
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

describe("AprobacionRefrendTable — activeSituationKey closes the dialog that was actually opened", () => {
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

  // Same category of bug PAGO_MESES/SIN_PAGO's regression guard above
  // protects against: closing by inferred form shape (or by any hardcoded
  // key) instead of by activeSituationKey could close the wrong dialog.
  // PAGO_ADELANTADO submits a completely different form shape
  // (AdvancePaymentForm, no resolution_type at all) through a different
  // store method (recordAdvancePayment, not recordPaymentSituation) — this
  // proves activeSituationKey closes PAGO_ADELANTADO's own dialog
  // specifically, not any of the others, and leaves them untouched.
  it("closes situationDialogs.PAGO_ADELANTADO (and only that dialog) when it submits, via store.recordAdvancePayment", async () => {
    // Shared module-level mocks accumulate calls across every test in this
    // file (only approveFullPayment.mockClear() precedent exists) — clear
    // both before asserting call counts here.
    recordPaymentSituation.mockClear();
    recordAdvancePayment.mockClear();
    const row = buildRow(23, "Ivan Adelantado", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "PAGO_ADELANTADO");
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(SituationPagoAdelantadoDialog).props("modelValue")).toBe(true);
    expect(wrapper.findComponent(SituationPagoMesesDialog).props("modelValue")).toBe(false);
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(false);

    await wrapper.findComponent(SituationPagoAdelantadoDialog).vm.$emit("submit", {
      months: [{ year: 2026, month: 9 }],
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(recordAdvancePayment).toHaveBeenCalledWith(23, {
      months: [{ year: 2026, month: 9 }],
    });
    expect(recordPaymentSituation).not.toHaveBeenCalled();
    expect(wrapper.findComponent(SituationPagoAdelantadoDialog).props("modelValue")).toBe(false);
    // The other dialogs stay closed/untouched — proves the close is scoped
    // to activeSituationKey, not a blanket reset.
    expect(wrapper.findComponent(SituationPagoMesesDialog).props("modelValue")).toBe(false);
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(false);
  });
});

describe("AprobacionRefrendTable — onClearResolution wiring", () => {
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

describe("AprobacionRefrendTable — onApproveFullPayment confirmation flow", () => {
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

describe("AprobacionRefrendTable — optional columns (Apoyo / Aumento temporal)", () => {
  // Design: preference persisted at
  // impulsou.ui.pedagogia-refrend-table.optional-columns (array of visible
  // column keys). Each test starts from a clean localStorage so the default
  // ("both hidden") is never contaminated by a previous test's toggle.
  const OPTIONAL_COLUMNS_KEY =
    "impulsou.ui.pedagogia-refrend-table.optional-columns";

  afterEach(() => {
    localStorage.clear();
  });

  const openColumnsMenu = async (
    wrapper: ReturnType<typeof mountTable>,
  ): Promise<void> => {
    await wrapper.find('button[title="Columnas"]').trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  };

  const clickColumnMenuItem = async (label: string): Promise<void> => {
    const item = body()
      .findAll(".v-list-item")
      .find((el) => el.text().includes(label));
    if (!item) throw new Error(`Column menu item "${label}" not found`);
    await item.trigger("click");
  };

  const headerTexts = (wrapper: ReturnType<typeof mountTable>): string[] =>
    wrapper.findAll("th").map((th) => th.text().trim());

  it("hides all three optional columns by default when no preference is stored", async () => {
    const rows = [buildRow(40, "Sin Preferencia", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = headerTexts(wrapper);
    expect(headers.some((t) => t.includes("Monto mensual"))).toBe(false);
    expect(headers.some((t) => t.includes("Apoyo"))).toBe(false);
    expect(headers.some((t) => t.includes("Aum. temporal"))).toBe(false);
  });

  it('shows "Apoyo" in the correct position (before "Base") after toggling it via the columns menu, while "Aum. temporal" stays hidden', async () => {
    const rows = [buildRow(41, "Con Apoyo", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await openColumnsMenu(wrapper);
    await clickColumnMenuItem("Apoyo");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = headerTexts(wrapper);
    const apoyoIndex = headers.findIndex((t) => t.includes("Apoyo"));
    const baseIndex = headers.findIndex((t) => t === "Base");
    expect(apoyoIndex).toBeGreaterThanOrEqual(0);
    expect(apoyoIndex).toBeLessThan(baseIndex);
    expect(headers.some((t) => t.includes("Aum. temporal"))).toBe(false);
  });

  it('shows both optional columns, in declaration order (Apoyo, Aum. temporal), before "Base", after toggling both', async () => {
    const rows = [buildRow(42, "Con Ambas", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await openColumnsMenu(wrapper);
    await clickColumnMenuItem("Aum. temporal");
    await clickColumnMenuItem("Apoyo");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = headerTexts(wrapper);
    const apoyoIndex = headers.findIndex((t) => t.includes("Apoyo"));
    const aumentoIndex = headers.findIndex((t) => t.includes("Aum. temporal"));
    const baseIndex = headers.findIndex((t) => t === "Base");
    expect(apoyoIndex).toBeGreaterThanOrEqual(0);
    expect(aumentoIndex).toBeGreaterThanOrEqual(0);
    expect(apoyoIndex).toBeLessThan(aumentoIndex);
    expect(aumentoIndex).toBeLessThan(baseIndex);
  });

  it("persists the toggled column visibility across a simulated reload (unmount + remount)", async () => {
    const rows = [buildRow(43, "Persistente", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await openColumnsMenu(wrapper);
    await clickColumnMenuItem("Apoyo");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    wrapper.unmount();

    const remounted = mountTable(rows);
    await remounted.vm.$nextTick();
    await remounted.vm.$nextTick();

    expect(headerTexts(remounted).some((t) => t.includes("Apoyo"))).toBe(true);
  });

  it('renders "—" for a monto_apoyo=0 row and for a temporary_increase_amount=null row — never "0"', async () => {
    localStorage.setItem(
      OPTIONAL_COLUMNS_KEY,
      JSON.stringify([
        "snapshot_monto_apoyo",
        "snapshot_temporary_increase_amount",
      ]),
    );
    const rowZeroApoyo = buildRow(44, "Cero Apoyo", 1, 0);
    rowZeroApoyo.refrend = {
      ...rowZeroApoyo.refrend,
      snapshot_monto_apoyo: "0",
    };
    const rowNoIncrease = buildRow(45, "Sin Aumento", 1, 0);
    // snapshot_temporary_increase_amount is already null in baseRefrend.

    const wrapper = mountTable([rowZeroApoyo, rowNoIncrease]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll("tbody tr");
    const apoyoRow = rows.find((tr) => tr.text().includes("Cero Apoyo"));
    const incrementoRow = rows.find((tr) => tr.text().includes("Sin Aumento"));

    expect(apoyoRow?.text()).toContain("—");
    expect(incrementoRow?.text()).toContain("—");
    expect(wrapper.text()).not.toMatch(/\$0\.00/);
  });

  it("shows the formatted amount and the reason as a tooltip for a real temporary increase", async () => {
    localStorage.setItem(
      OPTIONAL_COLUMNS_KEY,
      JSON.stringify(["snapshot_temporary_increase_amount"]),
    );
    const row = buildRow(46, "Con Aumento", 1, 0);
    row.refrend = {
      ...row.refrend,
      snapshot_temporary_increase_amount: "150.50",
      snapshot_temporary_increase_reason: "Ajuste especial",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("$150.50");

    const tooltip = wrapper
      .findAllComponents({ name: "VTooltip" })
      .find((t) => t.props("text") === "Ajuste especial");
    expect(tooltip).toBeTruthy();
  });

  // "Monto mensual" (3rd optional column, business-rules ampliación): derived
  // in the frontend from 3 snapshot fields already frozen for the same
  // period — gross - apoyo - aumento temporal — so its sum with the other 2
  // optional columns always reconstructs "Base" (snapshot_gross_amount).
  // Extracts only the currency cells of a row (columns without "$" — Desc.%,
  // group toggles, etc. — are skipped) to read exactly what the UI shows,
  // then parses each back to a number to validate the arithmetic invariant
  // instead of just asserting on hardcoded pre-computed strings.
  const currencyValuesInRow = (row: DOMWrapper<Element>): number[] =>
    row
      .findAll("td")
      .map((td) => td.text())
      .filter((text) => text.includes("$"))
      .map((text) => Number(text.replace(/[^0-9.-]/g, "")));

  const findRowByText = (
    wrapper: ReturnType<typeof mountTable>,
    text: string,
  ): DOMWrapper<Element> => {
    const row = wrapper.findAll("tbody tr").find((tr) => tr.text().includes(text));
    if (!row) throw new Error(`Row containing "${text}" not found`);
    return row;
  };

  it('computes and shows "Monto mensual" as gross - apoyo - aumento temporal when active', async () => {
    localStorage.setItem(OPTIONAL_COLUMNS_KEY, JSON.stringify(["monthly_amount"]));
    const row = buildRow(47, "Monto Mensual Calculado", 1, 0);
    row.refrend = {
      ...row.refrend,
      snapshot_gross_amount: "1200",
      snapshot_monto_apoyo: "300",
      snapshot_temporary_increase_amount: "200",
      final_amount: "150",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // 1200 - 300 - 200 = 700
    expect(wrapper.text()).toContain(fmt(700));
  });

  it('shows "Monto mensual" equal to "Base" when a refrend has no apoyo and no aumento temporal', async () => {
    localStorage.setItem(OPTIONAL_COLUMNS_KEY, JSON.stringify(["monthly_amount"]));
    const row = buildRow(48, "Sin Apoyo Ni Aumento", 1, 0);
    row.refrend = {
      ...row.refrend,
      snapshot_gross_amount: "1000",
      snapshot_monto_apoyo: "0",
      snapshot_temporary_increase_amount: null,
      final_amount: "250",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const rowEl = findRowByText(wrapper, "Sin Apoyo Ni Aumento");
    const values = currencyValuesInRow(rowEl);
    // With only "Monto mensual" visible, the row's currency cells in order
    // are [Monto mensual, Base, Final] — both Monto mensual and Base show
    // the full gross amount (1000).
    expect(values[0]).toBe(1000);
    expect(values[1]).toBe(1000);
  });

  it('shows the 3 optional columns together, in order (Monto mensual, Apoyo, Aum. temporal), before "Base"', async () => {
    const rows = [buildRow(49, "Con Las Tres", 1, 0)];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await openColumnsMenu(wrapper);
    await clickColumnMenuItem("Aum. temporal");
    await clickColumnMenuItem("Apoyo");
    await clickColumnMenuItem("Monto mensual");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = headerTexts(wrapper);
    const monthlyIndex = headers.findIndex((t) => t.includes("Monto mensual"));
    const apoyoIndex = headers.findIndex((t) => t.includes("Apoyo"));
    const aumentoIndex = headers.findIndex((t) => t.includes("Aum. temporal"));
    const baseIndex = headers.findIndex((t) => t === "Base");

    expect(monthlyIndex).toBeGreaterThanOrEqual(0);
    expect(apoyoIndex).toBeGreaterThan(monthlyIndex);
    expect(aumentoIndex).toBeGreaterThan(apoyoIndex);
    expect(baseIndex).toBeGreaterThan(aumentoIndex);
  });

  // Core business rule requested by the user: the sum of the 3 optional
  // columns must always equal "Base" for a refrend with all 3 components
  // present, because they're derived/read from snapshot fields frozen at the
  // same instant for the same period.
  it("sums Monto mensual + Apoyo + Aum. temporal (treating — as 0) and matches \"Base\" exactly", async () => {
    localStorage.setItem(
      OPTIONAL_COLUMNS_KEY,
      JSON.stringify([
        "monthly_amount",
        "snapshot_monto_apoyo",
        "snapshot_temporary_increase_amount",
      ]),
    );
    const row = buildRow(50, "Suma Completa", 1, 0);
    row.refrend = {
      ...row.refrend,
      snapshot_gross_amount: "1200",
      snapshot_monto_apoyo: "300",
      snapshot_temporary_increase_amount: "200",
      snapshot_temporary_increase_reason: "Ajuste",
      final_amount: "999",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const rowEl = findRowByText(wrapper, "Suma Completa");
    const values = currencyValuesInRow(rowEl);
    // Declaration order (OPTIONAL_HEADERS) with all 3 visible, followed by
    // Base and Final: [Monto mensual, Apoyo, Aum. temporal, Base, Final].
    const [monthly, apoyo, aumento, base] = values;

    expect(monthly).toBe(700); // 1200 - 300 - 200
    expect(apoyo).toBe(300);
    expect(aumento).toBe(200);
    expect(base).toBe(1200);
    expect(monthly + apoyo + aumento).toBe(base);
  });
});

describe('AprobacionRefrendTable — "Estado" motivo caption (removed only once Pagado)', () => {
  it("keeps the motivo caption visible for a non-paid row with a resolution_cause", async () => {
    const row = buildRow(51, "No Pagado", 1, 0);
    row.refrend.workflow_status = "LISTO_PARA_PAGO";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = "FALTAS_FI";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Faltas a F.I.");
  });

  it("hides the motivo caption once the row is Pagado (CLOSED), folding it into the status tooltip instead", async () => {
    const row = buildRow(52, "Pagado", 1, 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = "FALTAS_FI";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // Motivo isn't rendered as visible text anywhere by default — it's the
    // new Estado final chip's tooltip content, unopened. Under the Estado
    // icon specifically, the label is plain now (no motivo folded in).
    expect(wrapper.text()).not.toContain("Faltas a F.I.");
    const statusIcon = wrapper.findComponent(StatusIcon);
    expect(statusIcon.props("label")).toBe("Pagado");
  });
});

describe('AprobacionRefrendTable — "Estado final" chip (Pagado rows only)', () => {
  it("shows the resolution chip (icon + visible label) once the row is Pagado (CLOSED)", async () => {
    const row = buildRow(53, "Pagado Retenida", 1, 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = null;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Retenida");
  });

  it("shows the motivo via tooltip on the chip when resolution_cause is present", async () => {
    const row = buildRow(54, "Pagado Con Motivo", 1, 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = "FALTAS_FI";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.findComponent({ name: "VTooltip" });
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.props("text")).toContain("Faltas a F.I.");
  });

  it("shows nothing (dash) for a non-paid row, even with a resolution_type set", async () => {
    const row = buildRow(55, "No Pagado Aun", 1, 0);
    row.refrend.workflow_status = "LISTO_PARA_PAGO";
    row.refrend.resolution_type = "RETENIDA";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const dataRow = wrapper.findAll("tbody tr").find((tr) => tr.text().includes("No Pagado Aun"));
    const cells = dataRow!.findAll("td");
    expect(cells[cells.length - 1].text()).toBe("—");
  });
});

describe('AprobacionRefrendTable — "Respuesta" button view-only for rows canAprobacion no longer allows', () => {
  it("lets you open the dialog to view an existing response even when Pagado (CLOSED) blocks editing", async () => {
    const row = buildRow(60, "Pagado Con Respuesta", 1, 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.pedagogia_observations = "Ya resuelto.";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const btn = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Visualizar");
    expect(btn?.props("disabled")).toBe(false);

    await btn?.trigger("click");
    await wrapper.vm.$nextTick();

    const dialog = wrapper.findComponent(RefrendAprobacionDialog);
    expect(dialog.props("readonly")).toBe(true);
  });

  it("stays disabled for a Pagado row with no response to view", async () => {
    const row = buildRow(61, "Pagado Sin Respuesta", 1, 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.pedagogia_observations = null;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const btn = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Registrar");
    expect(btn?.props("disabled")).toBe(true);
  });

  it("opens in edit mode (not readonly) for a CON_INCIDENCIA row, even with an existing response", async () => {
    const row = buildRow(62, "Con Incidencia Editable", 1, 0);
    row.refrend.workflow_status = "CON_INCIDENCIA";
    row.refrend.pedagogia_observations = "Comentario previo.";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const btn = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Visualizar");
    await btn?.trigger("click");
    await wrapper.vm.$nextTick();

    const dialog = wrapper.findComponent(RefrendAprobacionDialog);
    expect(dialog.props("readonly")).toBe(false);
  });
});

describe("AprobacionRefrendTable — advance-paid row indicator (sdd/pago-adelantado PR7a)", () => {
  it("renders the AdvancePaymentChip amount when the row is advance_paid", async () => {
    const row = buildRow(63, "Adelantado", 1, 0, false, {
      paid: true,
      amount: "850.00",
      originYear: 2026,
      originMonth: 7,
    });
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("$850.00");
  });

  it("renders the Pago adelantado column header for a row that was not advance-paid", async () => {
    const row = buildRow(64, "Normal", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll("th").map((th) => th.text().trim());
    expect(headers).toContain("Pago adelantado");
  });
});

describe("AprobacionRefrendTable — origin advance-payment-registered indicator (sdd/pago-adelantado PR8/PR9)", () => {
  // OPPOSITE direction from the PR7a block above: this row is the ORIGIN
  // refrend that a batch was registered FROM, not a future month settled by
  // someone else's batch — the two fields can both be non-null on different
  // rows in the same table at the same time.
  //
  // PR9 (live user review feedback): no longer its own dedicated column —
  // the chip renders inline inside the actions cell, before
  // RefrendSituationBar, to keep the table compact.

  it('does not render a dedicated "Adelanto registrado" column header', async () => {
    const row = buildRow(66, "Normal", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll("th").map((th) => th.text().trim());
    expect(headers).not.toContain("Adelanto registrado");
  });

  it("renders the registered-advance chip inside the actions cell, next to RefrendSituationBar, when advance_payment_amount is non-zero", async () => {
    const row = buildRow(65, "Origen", 1, 0, false, {}, "500.00");
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const actionsCell = wrapper
      .findComponent(RefrendSituationBar)
      .element.closest("td");
    expect(actionsCell?.textContent).toContain("Pago adelantado registrado");
  });

  it("omits the chip from the actions cell for a row without a registered batch", async () => {
    const row = buildRow(67, "Sin Batch", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const actionsCell = wrapper
      .findComponent(RefrendSituationBar)
      .element.closest("td");
    expect(actionsCell?.textContent).not.toContain("Pago adelantado registrado");
  });
});

describe("AprobacionRefrendTable — divergence-reason follow-up (sdd/pago-adelantado, design D4 fix 2026-09-25)", () => {
  // Previously a MISSING feature (sdd-verify CRITICAL finding): the store
  // just toasted a generic error on the server's ADVANCE_DIVERGENCE_REQUIRED
  // 422, with no way for staff to actually supply the reason and complete
  // the resolution. AdvanceDivergenceReasonDialog closes that gap.

  afterEach(() => {
    recordPaymentSituation.mockReset();
    recordPaymentSituation.mockResolvedValue({ status: "success", refrend: {} });
  });

  it("opens AdvanceDivergenceReasonDialog and keeps the original situation dialog open when the store reports divergence_required", async () => {
    recordPaymentSituation.mockResolvedValueOnce({ status: "divergence_required" });
    const row = buildRow(20, "Hugo Divergente", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "SIN_PAGO");
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(true);

    await wrapper.findComponent(SituationSinPagoDialog).vm.$emit("submit", {
      resolution_type: "SIN_PAGO",
      resolution_cause: "FALTAS_FI",
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(AdvanceDivergenceReasonDialog).props("modelValue")).toBe(true);
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(true);
  });

  it("resubmits the same form with the entered reason appended, and closes both dialogs on success", async () => {
    recordPaymentSituation.mockResolvedValueOnce({ status: "divergence_required" });
    recordPaymentSituation.mockResolvedValueOnce({ status: "success", refrend: {} });
    const row = buildRow(21, "Inés Retry", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "SIN_PAGO");
    await wrapper.vm.$nextTick();

    const originalForm = { resolution_type: "SIN_PAGO", resolution_cause: "FALTAS_FI" };
    await wrapper.findComponent(SituationSinPagoDialog).vm.$emit("submit", originalForm);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper
      .findComponent(AdvanceDivergenceReasonDialog)
      .vm.$emit("submit", "Autorizado por dirección.");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(recordPaymentSituation).toHaveBeenLastCalledWith(21, {
      ...originalForm,
      advance_divergence_reason: "Autorizado por dirección.",
    });
    expect(wrapper.findComponent(AdvanceDivergenceReasonDialog).props("modelValue")).toBe(false);
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(false);
  });

  it("keeps both dialogs open, without losing the pending form, if the retry fails again for an unrelated reason", async () => {
    recordPaymentSituation.mockResolvedValueOnce({ status: "divergence_required" });
    recordPaymentSituation.mockResolvedValueOnce({ status: "error" });
    const row = buildRow(22, "Julia Retry2", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.findComponent(RefrendSituationBar).vm.$emit("open", "SIN_PAGO");
    await wrapper.vm.$nextTick();
    await wrapper.findComponent(SituationSinPagoDialog).vm.$emit("submit", {
      resolution_type: "SIN_PAGO",
      resolution_cause: "FALTAS_FI",
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper
      .findComponent(AdvanceDivergenceReasonDialog)
      .vm.$emit("submit", "Motivo cualquiera.");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(AdvanceDivergenceReasonDialog).props("modelValue")).toBe(true);
    expect(wrapper.findComponent(SituationSinPagoDialog).props("modelValue")).toBe(true);
  });
});

describe('AprobacionRefrendTable — "Final" column shows the advance-payment breakdown (live user report, 2026-09-27)', () => {
  // The "Final" column only showed the final_amount + extra = total_to_pay
  // breakdown for the amount_pending_from_previous and
  // refund_amount_from_previous cases — there was no branch at all for
  // advance_payment_amount, so a row with ONLY an advance payment registered
  // (no retention, no refund) silently fell through to showing just
  // final_amount, hiding the advance amount even though total_to_pay itself
  // was already computed correctly server-side.

  it("shows final_amount + advance amount = total_to_pay when advance_payment_amount is the only extra present", async () => {
    const row = buildRow(23, "Karla Adelanto", 1, 0);
    row.refrend = {
      ...row.refrend,
      final_amount: "1200.00",
      amount_pending_from_previous: "0",
      refund_amount_from_previous: "0",
      advance_payment_amount: "3600.00",
      total_to_pay: "4800.00",
    };
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const finalCell = wrapper
      .findAll("td")
      .find((td) => td.text().includes("$1,200.00"));
    expect(finalCell).toBeTruthy();
    expect(finalCell!.text()).toContain("adelanto");
    expect(finalCell!.text()).toContain("$4,800.00");
  });
});

describe("AprobacionRefrendTable — divergence-reason follow-up via the quick approve-full path (live bug report 2026-09-27)", () => {
  // The quick "Aprobar" menu item is staff's most natural way to approve at
  // 100% — it calls a DIFFERENT store method (approveFullPayment, not
  // recordPaymentSituation) that used to bypass advance-payment
  // reconciliation entirely. It must now react to divergence_required the
  // same way onSituationSubmit does, sharing the same dialog.

  afterEach(() => {
    approveFullPayment.mockReset();
    approveFullPayment.mockResolvedValue({ status: "success", refrend: {} });
  });

  const confirmApproveFullDialog = async (wrapper: ReturnType<typeof mountTable>): Promise<void> => {
    const btn = body()
      .findAll("button")
      .find((b) => b.text().trim() === "Confirmar");
    if (!btn) throw new Error('Confirmar button not found');
    await btn.trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  };

  it("opens AdvanceDivergenceReasonDialog when approve-full reports divergence_required", async () => {
    approveFullPayment.mockResolvedValueOnce({ status: "divergence_required" });
    const row = buildRow(70, "Karen Adelanto Aprobar", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await confirmApproveFullDialog(wrapper);

    expect(wrapper.findComponent(AdvanceDivergenceReasonDialog).props("modelValue")).toBe(true);
  });

  it("resubmits via approveFullPayment with the entered reason, and closes the dialog on success", async () => {
    approveFullPayment.mockResolvedValueOnce({ status: "divergence_required" });
    approveFullPayment.mockResolvedValueOnce({ status: "success", refrend: {} });
    const row = buildRow(71, "Luis Adelanto Aprobar", 1, 0);
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.findComponent(RefrendSituationBar).vm.$emit("approve-full");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await confirmApproveFullDialog(wrapper);

    await wrapper
      .findComponent(AdvanceDivergenceReasonDialog)
      .vm.$emit("submit", "Autorizado por dirección.");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(approveFullPayment).toHaveBeenLastCalledWith(71, "Autorizado por dirección.");
    expect(wrapper.findComponent(AdvanceDivergenceReasonDialog).props("modelValue")).toBe(false);
  });
});
