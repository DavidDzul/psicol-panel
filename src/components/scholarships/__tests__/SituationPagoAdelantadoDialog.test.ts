// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import SituationPagoAdelantadoDialog from "@/components/scholarships/SituationPagoAdelantadoDialog.vue";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// v-dialog teleports its content to `document.body` — outside the mounted
// wrapper's own DOM subtree — so DOM queries go through a `DOMWrapper` over
// `document.body`, same pattern as SituationPagoMesesDialog.test.ts /
// SituationRetenidaDialog's siblings.

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
// candidate month list is (re)built on a false→true `watch` transition, same
// convention as SituationPagoMesesDialog's `load()`.
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

const clickConfirmar = async (): Promise<void> => {
  const buttons = body().findAll("button");
  const confirmBtn = buttons.find((b) => b.text() === "Confirmar");
  if (!confirmBtn) throw new Error("Confirmar button not found");
  await confirmBtn.trigger("click");
};

describe("SituationPagoAdelantadoDialog — candidate months", () => {
  it("renders septiembre 2026 (origin + 1) as the first candidate, pre-selected", async () => {
    await mountDialog();

    expect(body().text()).toContain("septiembre 2026");
    const checkboxes = body().findAll('input[type="checkbox"]');
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true);
  });

  it("does not offer the origin period itself (agosto 2026) as a candidate — advance path requires a strictly future period", async () => {
    await mountDialog();

    expect(body().text()).not.toContain("agosto 2026");
  });
});

describe("SituationPagoAdelantadoDialog — client-side 1-3 cap (UX convenience only, server re-validates)", () => {
  it("allows selecting up to 3 months", async () => {
    await mountDialog();
    const checkboxes = body().findAll('input[type="checkbox"]');

    await checkboxes[1].setValue(true);
    await checkboxes[2].setValue(true);
    await wrapper!.vm.$nextTick();

    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true);
  });

  it("disables further selection once 3 months are already selected", async () => {
    await mountDialog();
    const checkboxes = body().findAll('input[type="checkbox"]');

    await checkboxes[1].setValue(true);
    await checkboxes[2].setValue(true);
    await wrapper!.vm.$nextTick();

    expect((checkboxes[3].element as HTMLInputElement).disabled).toBe(true);
  });

  it("shows a validation message and disables Confirmar when 0 months are selected", async () => {
    await mountDialog();
    const checkboxes = body().findAll('input[type="checkbox"]');

    await checkboxes[0].setValue(false);
    await wrapper!.vm.$nextTick();

    expect(body().text()).toContain("Seleccioná al menos un mes.");
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

  it("emits submit with all 3 months in chronological order when 3 are selected", async () => {
    const w = await mountDialog();
    const checkboxes = body().findAll('input[type="checkbox"]');

    await checkboxes[1].setValue(true);
    await checkboxes[2].setValue(true);
    await w.vm.$nextTick();

    await clickConfirmar();

    const emitted = w.emitted("submit");
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.months).toEqual([
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
      { year: 2026, month: 11 },
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
  it("resets selection back to the default (origin+1 only) after closing and reopening", async () => {
    const w = await mountDialog();
    const checkboxes = body().findAll('input[type="checkbox"]');
    await checkboxes[1].setValue(true);
    await w.vm.$nextTick();

    await w.setProps({ modelValue: false });
    await w.vm.$nextTick();
    await w.setProps({ modelValue: true });
    await w.vm.$nextTick();
    await w.vm.$nextTick();

    const reopenedCheckboxes = body().findAll('input[type="checkbox"]');
    expect((reopenedCheckboxes[0].element as HTMLInputElement).checked).toBe(true);
    expect((reopenedCheckboxes[1].element as HTMLInputElement).checked).toBe(false);
  });
});
