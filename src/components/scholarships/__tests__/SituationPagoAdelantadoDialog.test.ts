// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VBtn, VSelect } from "vuetify/components";
import SituationPagoAdelantadoDialog from "@/components/scholarships/SituationPagoAdelantadoDialog.vue";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// v-dialog teleports its content to `document.body` — outside the mounted
// wrapper's own DOM subtree — so DOM queries go through a `DOMWrapper` over
// `document.body`, same pattern as SituationPagoMesesDialog.test.ts /
// SituationRetenidaDialog's siblings. Year/Month selection is asserted and
// driven through `VSelect` component wrappers directly (same pattern as
// ScholarshipFilters.test.ts / ClassCreateDialog.test.ts), not by clicking
// through Vuetify's actual dropdown DOM.

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

// Mounted with `modelValue: false` and flipped to `true` right after — the
// row list is (re)built on a false→true `watch` transition, same convention
// as SituationPagoMesesDialog's `load()`.
const mountDialog = async (
  extraProps: Record<string, unknown> = {},
): Promise<ReturnType<typeof mount>> => {
  wrapper = mount(SituationPagoAdelantadoDialog, {
    props: {
      modelValue: false,
      periodYear: 2026,
      periodMonth: 8,
      ...extraProps,
    },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  await wrapper.setProps({ modelValue: true });
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
};

const yearSelects = (w: ReturnType<typeof mount>) =>
  w.findAllComponents(VSelect).filter((s) => s.props("label") === "Año");

const monthSelects = (w: ReturnType<typeof mount>) =>
  w.findAllComponents(VSelect).filter((s) => s.props("label") === "Mes");

const setRow = async (
  w: ReturnType<typeof mount>,
  rowIndex: number,
  year: number,
  month: number,
): Promise<void> => {
  await yearSelects(w)[rowIndex]!.vm.$emit("update:modelValue", year);
  await monthSelects(w)[rowIndex]!.vm.$emit("update:modelValue", month);
  await w.vm.$nextTick();
};

const addMonthButton = (w: ReturnType<typeof mount>) =>
  w.findAllComponents(VBtn).find((b) => b.text() === "Agregar mes");

const clickConfirmar = async (): Promise<void> => {
  const buttons = body().findAll("button");
  const confirmBtn = buttons.find((b) => b.text() === "Confirmar");
  if (!confirmBtn) throw new Error("Confirmar button not found");
  await confirmBtn.trigger("click");
};

describe("SituationPagoAdelantadoDialog — default row", () => {
  it("starts with a single row pre-filled with septiembre 2026 (origin + 1)", async () => {
    const w = await mountDialog();

    expect(yearSelects(w)).toHaveLength(1);
    expect(yearSelects(w)[0]!.props("modelValue")).toBe(2026);
    expect(monthSelects(w)[0]!.props("modelValue")).toBe(9);
  });

  it("disables the origin period itself (agosto 2026) and anything before it in the month options — advance path requires a strictly future period", async () => {
    const w = await mountDialog();

    const items = monthSelects(w)[0]!.props("items") as {
      title: string;
      value: number;
      props?: { disabled?: boolean };
    }[];
    const august = items.find((i) => i.value === 8);
    const september = items.find((i) => i.value === 9);

    expect(august?.props?.disabled).toBe(true);
    expect(september?.props?.disabled ?? false).toBe(false);
  });

  it("offers years well beyond the next 12 months — a becario can advance-pay periods years into the future", async () => {
    const w = await mountDialog();

    const items = yearSelects(w)[0]!.props("items") as number[];
    expect(items).toContain(2030);
  });
});

describe("SituationPagoAdelantadoDialog — free month+year selection (not limited to the next 12 months)", () => {
  it("lets staff pick an arbitrary far-future month+year on the first row, e.g. junio 2030", async () => {
    const w = await mountDialog();

    await setRow(w, 0, 2030, 6);

    expect(yearSelects(w)[0]!.props("modelValue")).toBe(2030);
    expect(monthSelects(w)[0]!.props("modelValue")).toBe(6);
  });
});

describe("SituationPagoAdelantadoDialog — client-side 1-6 cap (UX convenience only, server re-validates)", () => {
  it("adds a new row via 'Agregar mes', up to 6 rows total", async () => {
    const w = await mountDialog();

    for (let i = 2; i <= 6; i++) {
      await addMonthButton(w)?.trigger("click");
      await w.vm.$nextTick();
      expect(yearSelects(w)).toHaveLength(i);
    }
  });

  it("hides 'Agregar mes' once 6 rows already exist", async () => {
    const w = await mountDialog();

    for (let i = 2; i <= 6; i++) {
      await addMonthButton(w)?.trigger("click");
      await w.vm.$nextTick();
    }

    expect(addMonthButton(w)).toBeUndefined();
  });

  it("removes a row via its remove button, but never the last remaining row", async () => {
    const w = await mountDialog();
    await addMonthButton(w)?.trigger("click");
    await w.vm.$nextTick();
    expect(yearSelects(w)).toHaveLength(2);

    const removeButtons = w
      .findAllComponents(VBtn)
      .filter((b) => (b.attributes("aria-label") ?? "").startsWith("Quitar mes"));
    expect(removeButtons).toHaveLength(2);

    await removeButtons[1]!.trigger("click");
    await w.vm.$nextTick();
    expect(yearSelects(w)).toHaveLength(1);

    // With a single row left, there is nothing left to remove.
    const removeButtonsAfter = w
      .findAllComponents(VBtn)
      .filter((b) => (b.attributes("aria-label") ?? "").startsWith("Quitar mes"));
    expect(removeButtonsAfter).toHaveLength(0);
  });
});

describe("SituationPagoAdelantadoDialog — validation", () => {
  it("shows a warning and disables Confirmar when two rows share the same month+year", async () => {
    const w = await mountDialog();
    await addMonthButton(w)?.trigger("click");
    await w.vm.$nextTick();

    await setRow(w, 1, 2026, 9); // same as the row 0 default

    expect(body().text()).toContain("No podés repetir el mismo mes en dos filas.");
    const confirmBtn = body()
      .findAll("button")
      .find((b) => b.text() === "Confirmar");
    expect(confirmBtn!.attributes("disabled")).toBeDefined();
  });
});

describe("SituationPagoAdelantadoDialog — submit payload", () => {
  it("emits submit with the single pre-selected month and no amount field (server-computed, never client-supplied)", async () => {
    const w = await mountDialog();

    await clickConfirmar();

    const emitted = w.emitted("submit");
    expect(emitted).toBeTruthy();
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.months).toEqual([{ year: 2026, month: 9 }]);
    expect(form).not.toHaveProperty("amount");
    expect((form.months as unknown[])[0]).not.toHaveProperty("amount");
  });

  it("emits submit with far-future and near-future months together, sorted chronologically", async () => {
    const w = await mountDialog();
    await addMonthButton(w)?.trigger("click");
    await w.vm.$nextTick();
    await addMonthButton(w)?.trigger("click");
    await w.vm.$nextTick();

    // Row 0 default is 2026-09. Set row 1 to a far-future year, row 2 to a
    // nearer one — out of chronological order on purpose, to prove the
    // payload gets sorted regardless of entry order.
    await setRow(w, 1, 2030, 6);
    await setRow(w, 2, 2027, 1);

    await clickConfirmar();

    const emitted = w.emitted("submit");
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.months).toEqual([
      { year: 2026, month: 9 },
      { year: 2027, month: 1 },
      { year: 2030, month: 6 },
    ]);
  });

  it("includes a trimmed cause when provided", async () => {
    const w = await mountDialog();

    const causeInput = body().find('input[name="advance-payment-cause"]');
    await causeInput.setValue("  Beca de excelencia  ");
    await w.vm.$nextTick();

    await clickConfirmar();

    const emitted = w.emitted("submit");
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.cause).toBe("Beca de excelencia");
  });

  it("omits cause when left blank", async () => {
    const w = await mountDialog();

    await clickConfirmar();

    const emitted = w.emitted("submit");
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.cause).toBeUndefined();
  });
});

describe("SituationPagoAdelantadoDialog — reset on reopen", () => {
  it("resets back to a single default row after closing and reopening", async () => {
    const w = await mountDialog();
    await addMonthButton(w)?.trigger("click");
    await w.vm.$nextTick();
    await setRow(w, 1, 2030, 6);
    expect(yearSelects(w)).toHaveLength(2);

    await w.setProps({ modelValue: false });
    await w.vm.$nextTick();
    await w.setProps({ modelValue: true });
    await w.vm.$nextTick();
    await w.vm.$nextTick();

    expect(yearSelects(w)).toHaveLength(1);
    expect(yearSelects(w)[0]!.props("modelValue")).toBe(2026);
    expect(monthSelects(w)[0]!.props("modelValue")).toBe(9);
  });
});
