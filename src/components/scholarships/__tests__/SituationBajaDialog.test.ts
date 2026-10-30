// @vitest-environment jsdom
//
// sdd/egresado-baja-definitiva PR3. BAJA_DEFINITIVA is now a terminal cycle
// closure too (CloseScholarshipCycleAction): $0 this month, cycle closed, no
// more refrendos generated, AND the becario's account is deactivated —
// irreversible. Same blockResult rendering contract as
// SituationEgresadoDialog.vue (amendments #1987/#1988): NO acknowledge flag,
// NO "se marcarán como Perdidas" copy — any pending withholding BLOCKS.

import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import SituationBajaDialog from "@/components/scholarships/SituationBajaDialog.vue";
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
  wrapper = mount(SituationBajaDialog, {
    props: { modelValue: true, loading: false, blockResult },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  return wrapper;
};

const selectCause = async (label: string): Promise<void> => {
  const radios = body().findAll('input[type="radio"]');
  const target = radios.find((r) => {
    const parentText = r.element.closest(".v-radio")?.textContent ?? "";
    return parentText.includes(label);
  });
  if (!target) throw new Error(`Radio "${label}" not found`);
  await target.setValue();
};

const clickConfirmar = async (): Promise<void> => {
  const buttons = body().findAll("button");
  const confirmBtn = buttons.find((b) => b.text().includes("Confirmar baja"));
  if (!confirmBtn) throw new Error("Confirmar baja button not found");
  await confirmBtn.trigger("click");
};

describe("SituationBajaDialog — irreversible copy", () => {
  it("states the cut is irreversible, $0 this month, cycle closed, and the account is deactivated", () => {
    mountDialog();
    expect(body().text()).toContain("este mes no se paga ($0)");
    expect(body().text()).toContain("se cierra su ciclo");
    expect(body().text()).toContain("no se generarán más refrendos");
    expect(body().text()).toContain("su cuenta se desactiva");
    expect(body().text()).toContain("no se puede deshacer");
  });

  // Must NOT regress to the old copy this change explicitly removes.
  it("never mentions withholdings being marked as 'Perdida' (amendment #1988 removed FORFEITED from scope)", () => {
    mountDialog();
    expect(body().text()).not.toContain("Perdida");
  });
});

describe("SituationBajaDialog — submit", () => {
  it("emits a BAJA_DEFINITIVA submit payload with the selected cause", async () => {
    mountDialog();
    await wrapper!.vm.$nextTick();
    await selectCause("Bajo promedio");
    await wrapper!.vm.$nextTick();
    await clickConfirmar();

    const emitted = wrapper!.emitted("submit");
    expect(emitted).toBeTruthy();
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.resolution_type).toBe("BAJA_DEFINITIVA");
    expect(form.resolution_cause).toBe("BAJO_PROMEDIO");
  });
});

describe("SituationBajaDialog — blockResult (amendment #1988, no acknowledge flag)", () => {
  it("renders CYCLE_CUT_BLOCKED's msg and lists the blocking months with their Spanish reason label", () => {
    mountDialog({
      status: "cut_blocked",
      msg: "Tiene noviembre 2026 pagado por adelantado; resuélvelo antes de marcar baja.",
      blocking_months: [{ period_year: 2026, period_month: 11, reason: "ABONOS_APPLIED" }],
    });

    expect(body().text()).toContain(
      "Tiene noviembre 2026 pagado por adelantado; resuélvelo antes de marcar baja.",
    );
    expect(body().text()).toContain("Noviembre 2026");
    expect(body().text()).toContain("Con abonos aplicados");
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

  it("renders CYCLE_CUT_PENDING_WITHHOLDINGS's msg, lists the pending withholdings with amounts, and hints at Pago de meses retenidos (never 'Perdida')", () => {
    mountDialog({
      status: "pending_withholdings_required",
      msg: "El becario tiene retenciones pendientes.",
      withholdings: [
        {
          id: 4,
          period_year: 2026,
          period_month: 8,
          withheld_amount: "300.00",
          paid_amount: "0.00",
          remaining_amount: "300.00",
          is_current_refrend: false,
        },
      ],
    });

    expect(body().text()).toContain("El becario tiene retenciones pendientes.");
    expect(body().text()).toContain("Agosto 2026");
    expect(body().text()).toContain("$300.00");
    expect(body().text()).toContain("Pago de meses retenidos");
    expect(body().text()).not.toContain("Este mes");
    expect(body().text()).not.toContain("Deshaz la resolución");
    expect(body().text()).not.toContain("Perdida");
  });
});

describe("SituationBajaDialog — own-month retention (amendment 6)", () => {
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

describe("SituationBajaDialog — cut advance warning (S50-S52, S54)", () => {
  const cutPreview = {
    reason: "BAJA_DEFINITIVA",
    can_cut: true,
    blockers: [],
    advance: {
      months: [
        { period_year: 2026, period_month: 4, amount: "2500.00", is_cut_month: true, origin_period_year: 2026, origin_period_month: 3 },
        { period_year: 2026, period_month: 5, amount: "2500.00", is_cut_month: false, origin_period_year: 2026, origin_period_month: 3 },
      ],
      origins: [
        { origin_period_year: 2026, origin_period_month: 3, origin_paid: true, cancelled_amount: "5000.00", overpaid_amount: "5000.00", advance_payment_reduction: "0.00" },
      ],
      cancelled_amount: "5000.00",
      overpaid_amount: "5000.00",
      advance_payment_reduction: "0.00",
    },
  };

  const mountWith = (props: Record<string, unknown>) => {
    wrapper = mount(SituationBajaDialog, {
      props: { modelValue: true, loading: false, blockResult: null, ...props },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
  };

  const confirmBtn = () => body().findAll("button").find((b) => b.text().includes("Confirmar baja"))!;

  it("shows the warning and keeps confirm enabled once a cause is chosen (S51)", async () => {
    mountWith({ cutPreview });
    await selectCause("Bajo promedio");
    expect(body().text()).toContain("Al confirmar se cancelarán los meses adelantados abril y mayo.");
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("shows no warning without a preview and confirm still depends only on the form (S50, S52)", async () => {
    mountWith({ cutPreview: null });
    await selectCause("Bajo promedio");
    expect(body().text()).not.toContain("Al confirmar se cancelarán");
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("does not disable confirm while the preview is loading", async () => {
    mountWith({ cutPreview: null, cutPreviewLoading: true });
    await selectCause("Bajo promedio");
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("does not disable confirm when the preview carries blockers", async () => {
    mountWith({ cutPreview: { ...cutPreview, can_cut: false, blockers: [{ code: "CYCLE_CUT_PENDING_WITHHOLDINGS", msg: "x", data: {} }] } });
    await selectCause("Bajo promedio");
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });

  it("uses 'tú' in the Telmex hint, no voseo (S54)", () => {
    mountWith({
      blockResult: { status: "cut_blocked", msg: "Bloqueado", telmex_coverage: { coverage_id: 1, status: "ACTIVA", start_period: "2026-01" } },
    });
    expect(body().text()).toContain("Cancela la cobertura Telmex");
    expect(body().text()).toContain("vuelve a intentarlo");
    expect(body().text()).not.toContain("Cancelá");
  });
});
