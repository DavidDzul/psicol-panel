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
import type { RecordSituationResult } from "@/interfaces/scholarship";

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

const mountDialog = (blockResult: RecordSituationResult | null = null) => {
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
        { period_year: 2026, period_month: 11, reason: "ADVANCE_PAID" },
        { period_year: 2026, period_month: 12, reason: "PAID" },
      ],
    });

    expect(body().text()).toContain(
      "Tiene noviembre y diciembre 2026 pagados por adelantado; resuélvelos antes de marcar egreso.",
    );
    expect(body().text()).toContain("Noviembre 2026");
    expect(body().text()).toContain("Pagado por adelantado");
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
        },
      ],
    });

    expect(body().text()).toContain("El becario tiene retenciones pendientes.");
    expect(body().text()).toContain("Julio 2026");
    expect(body().text()).toContain("$500.00");
    expect(body().text()).toContain("Pago de meses retenidos");
  });

  it("renders nothing extra when blockResult is null", () => {
    mountDialog(null);
    expect(body().text()).not.toContain("retenciones pendientes");
    expect(body().text()).not.toContain("cobertura Telmex");
  });
});
