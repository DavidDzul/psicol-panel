// @vitest-environment jsdom
//
// sdd/egresado-baja-definitiva PR3. EGRESADO is now a terminal cycle closure
// (CloseScholarshipCycleAction on the backend): $0 this month, cycle closed,
// no more refrendos generated — irreversible. Amendments #1987 (Telmex
// coverage guard) and #1988 (NO acknowledge flag — any pending withholding
// BLOCKS outright) require the dialog to render the backend's structured 422
// payload inline and stay open, instead of a generic toast.

import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import SituationEgresadoDialog from "@/components/scholarships/SituationEgresadoDialog.vue";
import type { CutBlockResult } from "@/interfaces/scholarship";

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

const vuetify = createVuetify();

let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

const body = () => new DOMWrapper(document.body);

const mountDialog = (blockResult: CutBlockResult | null = null) => {
  wrapper = mount(SituationEgresadoDialog, {
    props: { modelValue: true, loading: false, blockResult },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  return wrapper;
};

const clickConfirmar = async (): Promise<void> => {
  const buttons = body().findAll("button");
  const confirmBtn = buttons.find((b) => b.text().includes("Confirmar egreso"));
  if (!confirmBtn) throw new Error("Confirmar egreso button not found");
  await confirmBtn.trigger("click");
};

describe("SituationEgresadoDialog — irreversible copy", () => {
  it("states the cut is irreversible, $0 this month, and no more refrendos", () => {
    mountDialog();
    expect(body().text()).toContain(
      "El becario egresa: este mes no se paga ($0), se cierra su ciclo y no se generarán más refrendos. Esta acción no se puede deshacer.",
    );
  });
});

describe("SituationEgresadoDialog — submit", () => {
  it("emits an EGRESADO submit payload", async () => {
    mountDialog();
    await wrapper!.vm.$nextTick();
    await clickConfirmar();

    const emitted = wrapper!.emitted("submit");
    expect(emitted).toBeTruthy();
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.resolution_type).toBe("EGRESADO");
  });
});

describe("SituationEgresadoDialog — blockResult (amendment #1988, no acknowledge flag)", () => {
  it("renders CYCLE_CUT_BLOCKED's msg and lists the blocking months with their Spanish reason label", () => {
    mountDialog({
      status: "cut_blocked",
      msg: "Tiene noviembre y diciembre 2026 pagados por adelantado; resuélvelos antes de marcar egreso.",
      blocking_months: [
        { period_year: 2026, period_month: 11, reason: "ABONOS_APPLIED" },
        { period_year: 2026, period_month: 12, reason: "PAID" },
      ],
    });

    expect(body().text()).toContain(
      "Tiene noviembre y diciembre 2026 pagados por adelantado; resuélvelos antes de marcar egreso.",
    );
    expect(body().text()).toContain("Noviembre 2026");
    expect(body().text()).toContain("Con abonos aplicados");
    expect(body().text()).toContain("Diciembre 2026");
    expect(body().text()).toContain("Ya pagado");
  });

  it("renders CYCLE_CUT_ACTIVE_TELMEX_COVERAGE's msg and points staff to Becas Telmex in administration-panel", () => {
    mountDialog({
      status: "cut_blocked",
      msg: "El becario tiene una cobertura Telmex activa.",
      telmex_coverage: { coverage_id: 9, status: "ACTIVA", start_period: "2026-08-01" },
    });

    expect(body().text()).toContain("El becario tiene una cobertura Telmex activa.");
    expect(body().text()).toContain("Becas Telmex");
    expect(body().text()).toContain("administration-panel");
  });

  it("renders CYCLE_CUT_PENDING_WITHHOLDINGS's msg, lists the pending withholdings with amounts, and hints at Pago de meses retenidos", () => {
    mountDialog({
      status: "pending_withholdings_required",
      msg: "El becario tiene retenciones pendientes.",
      withholdings: [
        {
          id: 3,
          period_year: 2026,
          period_month: 7,
          withheld_amount: "500.00",
          paid_amount: "0.00",
          remaining_amount: "500.00",
          is_current_refrend: false,
        },
      ],
    });

    expect(body().text()).toContain("El becario tiene retenciones pendientes.");
    expect(body().text()).toContain("Julio 2026");
    expect(body().text()).toContain("$500.00");
    expect(body().text()).toContain("Pago de meses retenidos");
    expect(body().text()).not.toContain("Este mes");
    expect(body().text()).not.toContain("Deshaz la resolución");
  });

  it("renders nothing extra when blockResult is null", () => {
    mountDialog(null);
    expect(body().text()).not.toContain("retenciones pendientes");
    expect(body().text()).not.toContain("cobertura Telmex");
  });
});

describe("SituationEgresadoDialog — own-month retention (amendment 6)", () => {
  const msg =
    "Este mes tiene una retención registrada; deshaga la resolución de este mes antes de marcar egreso o baja definitiva.";

  it("own-month only: shows the Este mes chip and the undo instruction, not the Pago de meses retenidos hint", () => {
    mountDialog({
      status: "pending_withholdings_required",
      msg,
      withholdings: [
        {
          id: 1,
          period_year: 2026,
          period_month: 6,
          withheld_amount: "100.00",
          paid_amount: "0.00",
          remaining_amount: "100.00",
          is_current_refrend: true,
        },
      ],
    });

    expect(body().text()).toContain(msg);
    expect(body().text()).toContain("Este mes");
    expect(body().text()).toContain("Deshaz la resolución de este mes (quita la retención) antes de continuar.");
    expect(body().text()).not.toContain("Pago de meses retenidos");
  });

  it("other-month only: no chip, only the Pago de meses retenidos hint", () => {
    mountDialog({
      status: "pending_withholdings_required",
      msg: "El becario tiene retenciones pendientes.",
      withholdings: [
        {
          id: 2,
          period_year: 2026,
          period_month: 2,
          withheld_amount: "100.00",
          paid_amount: "0.00",
          remaining_amount: "100.00",
          is_current_refrend: false,
        },
      ],
    });

    const chips = body().findAll(".v-chip");
    expect(chips).toHaveLength(0);
    expect(body().text()).toContain('Resuélvelas desde "Pago de meses retenidos" antes de continuar.');
    expect(body().text()).not.toContain("Deshaz la resolución");
  });

  it("mixed: chip only on the current row and both instructions", () => {
    mountDialog({
      status: "pending_withholdings_required",
      msg,
      withholdings: [
        {
          id: 1,
          period_year: 2026,
          period_month: 6,
          withheld_amount: "100.00",
          paid_amount: "0.00",
          remaining_amount: "100.00",
          is_current_refrend: true,
        },
        {
          id: 2,
          period_year: 2026,
          period_month: 2,
          withheld_amount: "100.00",
          paid_amount: "0.00",
          remaining_amount: "100.00",
          is_current_refrend: false,
        },
      ],
    });

    const chips = body().findAll(".v-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0].text()).toBe("Este mes");
    expect(body().text()).toContain("Deshaz la resolución de este mes (quita la retención) antes de continuar.");
    expect(body().text()).toContain('Resuélvelas desde "Pago de meses retenidos" antes de continuar.');
  });
});

describe("SituationEgresadoDialog — cut advance warning (S50-S52, S54)", () => {
  const cutPreview = {
    reason: "EGRESADO",
    can_cut: true,
    blockers: [],
    advance: {
      months: [
        { period_year: 2026, period_month: 4, amount: "2500.00", is_cut_month: true, origin_period_year: 2026, origin_period_month: 3 },
        { period_year: 2026, period_month: 5, amount: "2500.00", is_cut_month: false, origin_period_year: 2026, origin_period_month: 3 },
      ],
      origins: [
        { origin_period_year: 2026, origin_period_month: 3, origin_paid: false, cancelled_amount: "5000.00", overpaid_amount: "0.00", advance_payment_reduction: "5000.00" },
      ],
      cancelled_amount: "5000.00",
      overpaid_amount: "0.00",
      advance_payment_reduction: "5000.00",
    },
  };

  const mountWith = (props: Record<string, unknown>) => {
    wrapper = mount(SituationEgresadoDialog, {
      props: { modelValue: true, loading: false, blockResult: null, ...props },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
  };

  const confirmBtn = () => body().findAll("button").find((b) => b.text().includes("Confirmar egreso"))!;

  it("shows the unpaid warning and keeps confirm enabled (S49, S51)", () => {
    mountWith({ cutPreview });
    expect(body().text()).toContain(
      "Como el pago de marzo aún no se realiza, se descontarán $5,000.00 del pago adelantado de ese mes.",
    );
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("shows no warning without a preview and confirm stays enabled (S50, S52)", () => {
    mountWith({ cutPreview: null });
    expect(body().text()).not.toContain("Al confirmar se cancelar");
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("does not disable confirm while loading or with blockers", () => {
    mountWith({ cutPreview: { ...cutPreview, can_cut: false, blockers: [{ code: "CYCLE_CUT_BLOCKED", msg: "x", data: {} }] }, cutPreviewLoading: true });
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("uses 'tú' in the Telmex hint, no voseo (S54)", () => {
    mountWith({
      blockResult: { status: "cut_blocked", msg: "Bloqueado", telmex_coverage: { coverage_id: 1, status: "ACTIVA", start_period: "2026-01" } },
    });
    expect(body().text()).toContain("Cancela la cobertura Telmex");
    expect(body().text()).not.toContain("Cancelá");
  });
});
