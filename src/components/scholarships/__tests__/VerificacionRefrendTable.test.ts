// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { VBtn, VCheckbox, VSelect } from "vuetify/components";
import VerificacionRefrendTable from "@/components/scholarships/VerificacionRefrendTable.vue";
import StatusIcon from "@/components/scholarships/StatusIcon.vue";
import RefrendVerificacionDialog from "@/components/scholarships/RefrendVerificacionDialog.vue";
import type { BulkRefrendRow, ScholarshipRefrend } from "@/interfaces/scholarship";

// atencionFlag/clearFlag/patchInline/recalculateRefrend hit axios directly
// (no repository seam) — mocked at the module boundary. None of these are
// exercised by the "Solo pago adelantado" filter tests below, but the
// component calls useScholarshipStore() unconditionally on setup.
vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    atencionFlag: vi.fn(),
    clearFlag: vi.fn(),
    patchInline: vi.fn(),
    recalculateRefrend: vi.fn(),
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

const STUBS = {
  RefrendVerificacionDialog: true,
  RefrendDetailDrawer: true,
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
  pending_withholding_count: 0,
  pending_withholding_amount: null,
  advance_payment_eligible: advancePaymentEligible,
  advance_paid: advancePaid.paid ?? false,
  advance_paid_amount: advancePaid.amount ?? null,
  advance_paid_origin_year: advancePaid.originYear ?? null,
  advance_paid_origin_month: advancePaid.originMonth ?? null,
});

const mountTable = (
  rows: BulkRefrendRow[],
  viewVariant: "completa" | "incidencias" = "completa",
) =>
  mount(VerificacionRefrendTable, {
    props: { rows, year: 2026, month: 5, viewVariant },
    global: {
      plugins: [createPinia(), vuetify],
      stubs: STUBS,
    },
  });

const toggleAdvancePaymentOnly = async (
  wrapper: ReturnType<typeof mountTable>,
  value: boolean,
) => {
  await wrapper.findComponent(VSelect).vm.$emit("update:modelValue", value);
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
};

// ── Tests ─────────────────────────────────────────────────────────────────
//
// "Solo pago adelantado" mirrors AprobacionRefrendTable's selector: orthogonal
// to viewVariant, ANDs into displayRows instead of replacing it.

describe('VerificacionRefrendTable — "Incidencias" row filter', () => {
  // Mirrors AprobacionRefrendTable's row-inclusion criterion: a becario who
  // lost the whole month's pay to an attendance discount (falta or 2
  // accumulated retardos) never gets an incidencia record, so the
  // incidents_count-only filter silently hid them here too.

  it("includes a row with has_falta_discount=true and incidents_count=0 (new behavior)", async () => {
    const row = buildRow(20, "Falta Sin Incidencia", 0);
    row.has_falta_discount = true;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Falta Sin Incidencia");
  });

  it("includes a row with has_retardos_discount=true and incidents_count=0 (new behavior)", async () => {
    const row = buildRow(21, "Retardos Sin Incidencia", 0);
    row.has_retardos_discount = true;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Retardos Sin Incidencia");
  });

  it("excludes a row with neither an incidencia nor an active attendance discount (preexisting behavior)", async () => {
    const row = buildRow(22, "Limpio", 0);
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("Limpio");
  });
});

describe("VerificacionRefrendTable — attendance-discount reason icon", () => {
  it('shows the reason icon in "incidencias" mode when there\'s an attendance discount but no incidencia', async () => {
    const row = buildRow(23, "Solo Falta", 0);
    row.has_falta_discount = true;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="attendance-discount-reason"]').exists()).toBe(true);
  });

  it('hides the reason icon in "completa" mode even with an attendance discount and no incidencia', async () => {
    const row = buildRow(26, "Solo Falta Completa", 0);
    row.has_falta_discount = true;
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="attendance-discount-reason"]').exists()).toBe(false);
  });

  it('hides the reason icon in "incidencias" mode when a real incidencia already exists, even with an attendance discount', async () => {
    const row = buildRow(24, "Con Incidencia Y Falta", 1);
    row.has_falta_discount = true;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="attendance-discount-reason"]').exists()).toBe(false);
  });

  it('hides the reason icon in "incidencias" mode when there\'s neither an incidencia nor an attendance discount', async () => {
    const row = buildRow(25, "Limpio", 0);
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="attendance-discount-reason"]').exists()).toBe(false);
  });

  it('uses the fixed tooltip text "Falta registrada" regardless of falta vs retardos', async () => {
    const row = buildRow(27, "Solo Retardos", 0);
    row.has_retardos_discount = true;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const icon = wrapper.find('[data-testid="attendance-discount-reason"]');
    expect(icon.attributes("aria-describedby") ?? icon.exists()).toBeTruthy();
    const tooltip = wrapper.findComponent({ name: "VTooltip" });
    expect(tooltip.props("text")).toBe("Falta registrada");
  });
});

describe("VerificacionRefrendTable — advance-paid row indicator (sdd/pago-adelantado PR7a)", () => {
  it("renders the AdvancePaymentChip amount when the row is advance_paid", async () => {
    const row = buildRow(30, "Adelantado", 0, false, {
      paid: true,
      amount: "850.00",
      originYear: 2026,
      originMonth: 7,
    });
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("$850.00");
  });

  it("renders the — fallback for a row that was not advance-paid", async () => {
    const row = buildRow(31, "Normal", 0);
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll("th").map((th) => th.text().trim());
    expect(headers).toContain("Pago adelantado");
  });
});

describe("VerificacionRefrendTable — temporary increase chip (sdd/temporary-increase-visibility P2c)", () => {
  // The chip column is shared via BASE_HEADERS with AprobacionRefrendTable —
  // this block confirms the column header AND the chip rendering also
  // propagate here automatically, not just in Aprobacion.

  it('renders the "Aum. temporal" column header', async () => {
    const row = buildRow(35, "Normal", 0);
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll("th").map((th) => th.text().trim());
    expect(headers.some((t) => t.includes("Aum. temporal"))).toBe(true);
  });

  it("renders the chip with the formatted amount when the row has an active temporary increase", async () => {
    const row = buildRow(36, "Con Aumento", 0);
    row.refrend = {
      ...row.refrend,
      snapshot_temporary_increase_amount: "500.00",
      snapshot_temporary_increase_reason: "Ajuste de beca",
    };
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("$500.00");
    const tooltip = wrapper
      .findAllComponents({ name: "VTooltip" })
      .find(
        (t) =>
          t.props("text") ===
          "Aumento temporal · Motivo: Ajuste de beca · Ya incluido en Base",
      );
    expect(tooltip).toBeTruthy();
  });

  it('renders "—" for a row with no active temporary increase (expired or never configured)', async () => {
    const row = buildRow(37, "Sin Aumento", 0);
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const rowEl = wrapper
      .findAll("tbody tr")
      .find((tr) => tr.text().includes("Sin Aumento"));
    expect(rowEl?.text()).toContain("—");
  });

  // Regression: an unrelated academic-discount chip (next to the becario
  // name) must coexist with the temporary-increase chip on the same row —
  // neither indicator displaces the other.
  it("coexists with an unrelated academic-discount chip on the same row", async () => {
    const row = buildRow(38, "Con Descuento Y Aumento", 1);
    row.refrend = {
      ...row.refrend,
      snapshot_discount_percentage: "10",
      snapshot_temporary_increase_amount: "300.00",
      snapshot_temporary_increase_reason: "Beca extendida",
    };
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("10%");
    expect(wrapper.text()).toContain("$300.00");
  });
});

describe("VerificacionRefrendTable — origin advance-payment-registered indicator (sdd/pago-adelantado PR8/PR9)", () => {
  // OPPOSITE direction from the PR7a block above: this row is the ORIGIN
  // refrend that a batch was registered FROM, not a future month settled by
  // someone else's batch.
  //
  // PR9 (live user review feedback): no longer its own dedicated column —
  // the chip renders inline inside the actions cell, next to the
  // Registrar/Editar/Visualizar button, to keep the table compact.

  const findActionsButton = (wrapper: ReturnType<typeof mountTable>) =>
    wrapper
      .findAllComponents(VBtn)
      .find((b) =>
        ["Registrar", "Editar", "Visualizar"].includes(b.text().trim()),
      );

  it('does not render a dedicated "Adelanto registrado" column header', async () => {
    const row = buildRow(33, "Normal", 0);
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll("th").map((th) => th.text().trim());
    expect(headers).not.toContain("Adelanto registrado");
  });

  it("renders the registered-advance chip inside the actions cell, next to the action button, when advance_payment_amount is non-zero", async () => {
    const row = buildRow(32, "Origen", 0, false, {}, "500.00");
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const actionsCell = findActionsButton(wrapper)?.element.closest("td");
    expect(actionsCell?.textContent).toContain("Pago adelantado registrado");
  });

  it("omits the chip from the actions cell for a row without a registered batch", async () => {
    const row = buildRow(34, "Sin Batch", 0);
    const wrapper = mountTable([row], "completa");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const actionsCell = findActionsButton(wrapper)?.element.closest("td");
    expect(actionsCell?.textContent).not.toContain("Pago adelantado registrado");
  });
});

describe('VerificacionRefrendTable — "Respuesta" column (renamed from "R. Aprobación")', () => {
  it('titles the column "Respuesta"', async () => {
    const wrapper = mountTable([buildRow(28, "Uno", 0)], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll("th").map((th) => th.text().trim());
    expect(headers).toContain("Respuesta");
    expect(headers).not.toContain("R. Aprobación");
  });
});

describe('VerificacionRefrendTable — "Notificado" checkbox gating', () => {
  it("is disabled when there is no aprobación response yet, even if workflow_status is LISTO_PARA_PAGO", async () => {
    // incidentsCount=1 so the row passes the "Incidencias" row filter —
    // unrelated to what this test actually checks (the checkbox gating).
    const row = buildRow(29, "Sin Respuesta", 1);
    row.refrend.workflow_status = "LISTO_PARA_PAGO";
    row.refrend.pedagogia_observations = null;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(VCheckbox).props("disabled")).toBe(true);
  });

  it("is enabled once there's an aprobación response, even if workflow_status is not LISTO_PARA_PAGO — no need to wait until payment processing", async () => {
    const row = buildRow(30, "Con Respuesta", 1);
    row.refrend.workflow_status = "CON_INCIDENCIA";
    row.refrend.pedagogia_observations = "Aprobado con condiciones.";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(VCheckbox).props("disabled")).toBe(false);
  });
});

describe('VerificacionRefrendTable — "Pago adelantado" selector', () => {
  it("leaves all rows visible when left on Todos (default, unaffected)", async () => {
    const rows = [
      buildRow(1, "No Elegible", 0, false),
      buildRow(2, "Elegible", 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("No Elegible");
    expect(wrapper.text()).toContain("Elegible");
  });

  it("shows only advance-payment-eligible rows when selected", async () => {
    const rows = [
      buildRow(3, "No Elegible", 0, false),
      buildRow(4, "Elegible", 0, true),
    ];
    const wrapper = mountTable(rows);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);

    expect(wrapper.text()).not.toContain("No Elegible");
    expect(wrapper.text()).toContain("Elegible");
  });

  it('combines (AND) with viewVariant="incidencias" — excludes an eligible row with no incidencia', async () => {
    const rows = [
      buildRow(5, "Elegible Sin Incidencia", 0, true),
      buildRow(6, "Elegible Con Incidencia", 1, true),
    ];
    const wrapper = mountTable(rows, "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await toggleAdvancePaymentOnly(wrapper, true);

    expect(wrapper.text()).not.toContain("Elegible Sin Incidencia");
    expect(wrapper.text()).toContain("Elegible Con Incidencia");
  });

  it("combines (AND) with name search", async () => {
    const rows = [
      buildRow(7, "Karla Elegible", 0, true),
      buildRow(8, "Luis Elegible", 0, true),
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
});

describe('VerificacionRefrendTable — "Estado" motivo caption (removed only once Pagado)', () => {
  it("keeps the motivo caption visible for a non-paid row with a resolution_cause", async () => {
    const row = buildRow(31, "No Pagado", 1);
    row.refrend.workflow_status = "LISTO_PARA_PAGO";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = "FALTAS_FI";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Faltas a F.I.");
  });

  it("hides the motivo caption once the row is Pagado (CLOSED) — it moves into the Estado final chip instead", async () => {
    const row = buildRow(32, "Pagado", 1);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = "FALTAS_FI";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // Under the Estado icon specifically (not the new Estado final column,
    // which does show the label as its own chip text).
    const statusIcon = wrapper.findComponent(StatusIcon);
    expect(statusIcon.props("label")).toBe("Pagado");
  });
});

describe('VerificacionRefrendTable — "Estado final" chip (Pagado rows only)', () => {
  it("shows the resolution chip (icon + visible label) once the row is Pagado (CLOSED)", async () => {
    const row = buildRow(33, "Pagado Retenida", 1);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = null;
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Retenida");
  });

  it("shows the motivo via tooltip on the chip when resolution_cause is present", async () => {
    const row = buildRow(34, "Pagado Con Motivo", 1);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = "RETENIDA";
    row.refrend.resolution_cause = "FALTAS_FI";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.findComponent({ name: "VTooltip" });
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.props("text")).toContain("Faltas a F.I.");
  });

  // Corrected 2026-09-27 (live user report): a Pagado row with
  // resolution_type null (the quick "Aprobar" path when nothing was
  // forgiven) is NOT nothing to show — it's a real outcome, derived from
  // discount_percentage instead of assuming 100% (see
  // finalResolutionChip's fallback in useRefrendTableDisplay.ts).
  it('shows "Pago sin penalización" for a Pagado row with no resolution_type and no discount', async () => {
    const row = buildRow(35, "Pagado Sin Resolucion", 1);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = null;
    row.refrend.discount_percentage = "0";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // findAll("tbody tr")[0] is the collapsible group-header row in
    // "incidencias" mode (single <td colspan> with the generación name) —
    // find the actual data row by its content instead.
    const dataRow = wrapper.findAll("tbody tr").find((tr) => tr.text().includes("Pagado Sin Resolucion"));
    const cells = dataRow!.findAll("td");
    expect(cells[cells.length - 1].text()).toBe("Pago sin penalización");
  });

  it('shows the academic-discount chip for a Pagado row with no resolution_type but a kept academic discount', async () => {
    const row = buildRow(37, "Pagado Con Descuento Academico", 1);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.resolution_type = null;
    row.refrend.discount_percentage = "20";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const dataRow = wrapper.findAll("tbody tr").find((tr) => tr.text().includes("Pagado Con Descuento Academico"));
    const cells = dataRow!.findAll("td");
    expect(cells[cells.length - 1].text()).toBe("Descuento académico 20%");
  });

  it("shows nothing (dash) for a non-paid row, even with a resolution_type set", async () => {
    const row = buildRow(36, "No Pagado Aun", 1);
    row.refrend.workflow_status = "LISTO_PARA_PAGO";
    row.refrend.resolution_type = "RETENIDA";
    const wrapper = mountTable([row], "incidencias");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const dataRow = wrapper.findAll("tbody tr").find((tr) => tr.text().includes("No Pagado Aun"));
    const cells = dataRow!.findAll("td");
    expect(cells[cells.length - 1].text()).toBe("—");
  });
});

describe('VerificacionRefrendTable — "Incidencia" button view-only for Pagado rows', () => {
  it("lets you open the dialog to view when Aprobación already responded, even once Pagado (CLOSED) blocks editing", async () => {
    const row = buildRow(70, "Pagado Con Respuesta", 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.pedagogia_observations = "Ya resuelto.";
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const btn = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Visualizar");
    expect(btn?.props("disabled")).toBe(false);

    await btn?.trigger("click");
    await wrapper.vm.$nextTick();

    const dialog = wrapper.findComponent(RefrendVerificacionDialog);
    expect(dialog.props("readonly")).toBe(true);
  });

  it("stays disabled for a Pagado row where Aprobación never responded (nothing to view via this button)", async () => {
    const row = buildRow(71, "Pagado Sin Respuesta", 0);
    row.refrend.workflow_status = "CLOSED";
    row.refrend.pedagogia_observations = null;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const btn = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Registrar");
    expect(btn?.props("disabled")).toBe(true);
  });

  it("stays enabled and editable for a CON_INCIDENCIA row with no Aprobación response yet", async () => {
    const row = buildRow(72, "Con Incidencia Editable", 0);
    row.refrend.workflow_status = "CON_INCIDENCIA";
    row.refrend.pedagogia_observations = null;
    const wrapper = mountTable([row]);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const btn = wrapper.findAllComponents(VBtn).find((b) => b.text() === "Editar");
    expect(btn?.props("disabled")).toBe(false);
  });
});
