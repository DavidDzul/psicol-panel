// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import type { ScholarshipWithholding } from "@/interfaces/scholarship";
import type { PendingWithholdingsMeta } from "@/interfaces/api";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// The store's `fetchPendingWithholdings` hits axios directly (no repository
// seam) — mocked at the module boundary so these tests exercise the dialog's
// own logic (checkbox gating, submit payload composition) without a network
// layer. `voidWithholdingPayment` is stubbed too since the component always
// destructures it, even though these tests never open the void dialog.
//
// v-dialog/v-overlay teleport their content to `document.body` — outside the
// mounted wrapper's own DOM subtree — so DOM queries/interactions go through
// a `DOMWrapper` over `document.body` instead of `wrapper.find*`. Component
// emits (`wrapper.emitted`) are unaffected by teleport since they happen at
// the Vue instance level, not the DOM.

const fetchPendingWithholdings = vi.fn<
  (
    userId: number,
    relativeYear?: number | null,
    relativeMonth?: number | null,
  ) => Promise<{ rows: ScholarshipWithholding[]; meta?: PendingWithholdingsMeta }>
>();

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    fetchPendingWithholdings,
    voidWithholdingPayment: vi.fn(),
  }),
}));

// jsdom doesn't define `visualViewport` at all (not even as `undefined`), and
// Vuetify's VOverlay location strategy references the bare global — without
// this stub, mounting any real (non-stubbed) v-dialog throws
// "visualViewport is not defined".
if (!("visualViewport" in window)) {
  Object.defineProperty(window, "visualViewport", { value: null, writable: true });
}

// jsdom also doesn't implement ResizeObserver, used by VProgressCircular
// (the loading spinner) and other Vuetify components that measure layout.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const vuetify = createVuetify();

const pendingWithholding: ScholarshipWithholding = {
  id: 10,
  user_id: 1,
  origin_refrend_id: 5,
  period_year: 2026,
  period_month: 4,
  withheld_amount: "500.00",
  paid_amount: "0.00",
  remaining_amount: "500.00",
  cause: null,
  status: "PENDING",
  payments: [],
};

let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

const body = () => new DOMWrapper(document.body);

// Mounted with `modelValue: false` and flipped to `true` right after: the
// component's `load()` call is wired to a plain (non-immediate) `watch` on
// `model`, which only fires on a false→true transition, not on an initial
// `true` prop at mount time.
const mountDialog = async (
  currentMonthAmount: number | string | null = 800,
  extraProps: Record<string, unknown> = {},
): Promise<ReturnType<typeof mount>> => {
  wrapper = mount(SituationPagoMesesDialog, {
    props: {
      modelValue: false,
      userId: 1,
      currentMonthAmount,
      ...extraProps,
    },
    global: {
      plugins: [vuetify],
      stubs: { VoidWithholdingPaymentDialog: true },
    },
  });
  await wrapper.setProps({ modelValue: true });
  return wrapper;
};

/** Checks the first (withholding row) checkbox and sets its amount to the full remaining balance. */
const selectFirstRow = async (): Promise<void> => {
  const checkboxes = body().findAll('input[type="checkbox"]');
  await checkboxes[0].setValue(true);
};

const uncheckPayCurrentMonth = async (): Promise<void> => {
  const checkboxes = body().findAll('input[type="checkbox"]');
  await checkboxes[checkboxes.length - 1].setValue(false);
};

const clickConfirmar = async (): Promise<void> => {
  const buttons = body().findAll("button");
  const confirmBtn = buttons.find((b) => b.text() === "Confirmar");
  if (!confirmBtn) throw new Error("Confirmar button not found");
  await confirmBtn.trigger("click");
};

describe("SituationPagoMesesDialog — pagar mes en curso checkbox", () => {
  it("submits BECA_MES with no resolution_cause when the checkbox stays checked (default)", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    const w = await mountDialog();
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    await selectFirstRow();
    await w.vm.$nextTick();
    await clickConfirmar();

    const emitted = w.emitted("submit");
    expect(emitted).toBeTruthy();
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.resolution_type).toBe("BECA_MES");
    expect(form).not.toHaveProperty("resolution_cause");
    expect(form.withholding_payments).toEqual([{ withholding_id: 10, amount: 500 }]);
  });

  it("submits SIN_PAGO with resolution_cause PAGO_MESES_RETENIDOS_SIN_MES_ACTUAL when unchecked", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    const w = await mountDialog();
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    await selectFirstRow();
    await w.vm.$nextTick();
    await uncheckPayCurrentMonth();
    await w.vm.$nextTick();
    await clickConfirmar();

    const emitted = w.emitted("submit");
    expect(emitted).toBeTruthy();
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.resolution_type).toBe("SIN_PAGO");
    expect(form.resolution_cause).toBe("PAGO_MESES_RETENIDOS_SIN_MES_ACTUAL");
    expect(form.withholding_payments).toEqual([{ withholding_id: 10, amount: 500 }]);
  });

  it("shows $0.00 for 'mes actual' in the breakdown when unchecked", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    const w = await mountDialog(800);
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    // Checked (default): breakdown shows the real current-month amount.
    expect(document.body.textContent).toContain("Mes actual $800.00");

    await uncheckPayCurrentMonth();
    await w.vm.$nextTick();

    expect(document.body.textContent).toContain("Mes actual $0.00");
    expect(document.body.textContent).not.toContain("Mes actual $800.00");
  });
});

describe("SituationPagoMesesDialog — readonly amount on selection", () => {
  it("becomes readonly and prefilled with the full remaining balance when selected", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    const w = await mountDialog();
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    const amountInput = body().find('input[type="number"]');
    expect(amountInput.element.hasAttribute("readonly")).toBe(false);
    expect((amountInput.element as HTMLInputElement).value).toBe("");

    await selectFirstRow();
    await w.vm.$nextTick();

    expect(amountInput.element.hasAttribute("readonly")).toBe(true);
    expect((amountInput.element as HTMLInputElement).value).toBe("500");
  });

  it("clears the amount and drops readonly when the row is deselected", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    const w = await mountDialog();
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    await selectFirstRow();
    await w.vm.$nextTick();

    const checkboxes = body().findAll('input[type="checkbox"]');
    await checkboxes[0].setValue(false);
    await w.vm.$nextTick();

    const amountInput = body().find('input[type="number"]');
    expect(amountInput.element.hasAttribute("readonly")).toBe(false);
    expect((amountInput.element as HTMLInputElement).value).toBe("");
  });

  it("keeps the running total in sync with the readonly (non-editable) amount", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    const w = await mountDialog(800);
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    await selectFirstRow();
    await w.vm.$nextTick();

    expect(document.body.textContent).toContain("retenciones seleccionadas $500.00");
  });
});

describe("SituationPagoMesesDialog — period props forwarded to the fetch", () => {
  it("forwards periodYear/periodMonth as relative_year/relative_month args", async () => {
    fetchPendingWithholdings.mockResolvedValue({ rows: [pendingWithholding] });
    await mountDialog(800, { periodYear: 2026, periodMonth: 8 });
    await new Promise((resolve) => setTimeout(resolve));

    expect(fetchPendingWithholdings).toHaveBeenCalledWith(1, 2026, 8);
  });
});

describe("SituationPagoMesesDialog — eligibility empty-state messaging", () => {
  it('shows "No hay meses pagables actualmente" when eligible_count is 0 but old debt exists', async () => {
    fetchPendingWithholdings.mockResolvedValue({
      rows: [],
      meta: {
        relative_year: 2026,
        relative_month: 8,
        eligible_count: 0,
        total_pending_count: 3,
        total_pending_amount: "900.00",
      },
    });
    const w = await mountDialog(800, { periodYear: 2026, periodMonth: 8 });
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    expect(document.body.textContent).toContain("No hay meses pagables actualmente.");
    expect(document.body.textContent).not.toContain(
      "Este becario no tiene retenciones pendientes.",
    );
  });

  it("shows the generic empty message when there is no debt at all", async () => {
    fetchPendingWithholdings.mockResolvedValue({
      rows: [],
      meta: {
        relative_year: 2026,
        relative_month: 8,
        eligible_count: 0,
        total_pending_count: 0,
        total_pending_amount: "0.00",
      },
    });
    const w = await mountDialog(800, { periodYear: 2026, periodMonth: 8 });
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    expect(document.body.textContent).toContain("Este becario no tiene retenciones pendientes.");
    expect(document.body.textContent).not.toContain("No hay meses pagables actualmente.");
  });

  it("shows eligible rows normally with no extra messaging when eligible_count > 0", async () => {
    fetchPendingWithholdings.mockResolvedValue({
      rows: [pendingWithholding],
      meta: {
        relative_year: 2026,
        relative_month: 8,
        eligible_count: 1,
        total_pending_count: 1,
        total_pending_amount: "500.00",
      },
    });
    const w = await mountDialog(800, { periodYear: 2026, periodMonth: 8 });
    await new Promise((resolve) => setTimeout(resolve));
    await w.vm.$nextTick();

    expect(document.body.textContent).not.toContain("No hay meses pagables actualmente.");
    expect(document.body.textContent).not.toContain("Este becario no tiene retenciones pendientes.");
  });
});
