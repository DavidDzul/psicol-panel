// @vitest-environment jsdom
//
// sdd/revertir-pago-adelantado S11a (R9, S17): the revert confirmation dialog.
// Lists the months/amounts that will be removed, states the origin refrend is
// otherwise untouched, and requires a 10-500 char trimmed reason.

import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import RevertAdvancePaymentDialog from "@/components/scholarships/RevertAdvancePaymentDialog.vue";
import type { ActiveAdvance } from "@/interfaces/scholarship";

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

const advance: ActiveAdvance = {
  id: 1,
  status: "ACTIVE",
  months_count: 2,
  total_amount: "5000.00",
  months: [
    { id: 11, period_year: 2026, period_month: 4, amount: "2500.00", status: "PENDING" },
    { id: 12, period_year: 2026, period_month: 5, amount: "2500.00", status: "PENDING" },
  ],
};

const mountDialog = (props: Record<string, unknown> = {}) => {
  wrapper = mount(RevertAdvancePaymentDialog, {
    props: {
      modelValue: true,
      activeAdvance: advance,
      originPeriod: { year: 2026, month: 3 },
      loading: false,
      ...props,
    },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  return wrapper;
};

const confirmBtn = () => {
  const btn = body()
    .findAll("button")
    .find((b) => b.text().includes("Revertir adelanto"));
  if (!btn) throw new Error("confirm button not found");
  return btn;
};

const typeReason = async (value: string) => {
  const ta = body().find("textarea");
  await ta.setValue(value);
};

describe("RevertAdvancePaymentDialog — content", () => {
  it("lists each month with its amount and the total", () => {
    mountDialog();
    const text = body().text();
    expect(text).toContain("Abril 2026");
    expect(text).toContain("Mayo 2026");
    expect(text).toContain("$2,500.00");
    expect(text).toContain("$5,000.00");
  });

  it("mentions the origin period", () => {
    mountDialog();
    expect(body().text()).toContain("Marzo 2026");
  });

  it("states the origin incidencias, descuentos and resolución are not modified", () => {
    mountDialog();
    const text = body().text();
    expect(text).toContain("incidencias");
    expect(text).toContain("descuentos");
    expect(text).toContain("resolución");
    expect(text).toContain("no se modifican");
  });
});

describe("RevertAdvancePaymentDialog — reason validation (S17)", () => {
  it("disables confirm while the reason is empty", () => {
    mountDialog();
    expect(confirmBtn().attributes("disabled")).toBeDefined();
  });

  it("shows 'Escribe al menos 10 caracteres' and keeps confirm disabled for 9 chars", async () => {
    mountDialog();
    await typeReason("123456789");
    expect(body().text()).toContain("Escribe al menos 10 caracteres");
    expect(confirmBtn().attributes("disabled")).toBeDefined();
  });

  it("trims before counting", async () => {
    mountDialog();
    await typeReason("   123456789   ");
    expect(confirmBtn().attributes("disabled")).toBeDefined();
  });

  it("shows a max-length error over 500 chars and disables confirm", async () => {
    mountDialog();
    await typeReason("a".repeat(501));
    expect(body().text()).toContain("No puede superar 500 caracteres");
    expect(confirmBtn().attributes("disabled")).toBeDefined();
  });

  it("enables confirm for a valid reason and emits the trimmed reason", async () => {
    mountDialog();
    await typeReason("  Se registró por error  ");
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
    await confirmBtn().trigger("click");
    expect(wrapper!.emitted("confirm")).toEqual([["Se registró por error"]]);
  });

  it("accepts exactly 500 chars", async () => {
    mountDialog();
    await typeReason("a".repeat(500));
    expect(confirmBtn().attributes("disabled")).toBeUndefined();
  });
});

describe("RevertAdvancePaymentDialog — loading, error and close", () => {
  it("disables confirm and cancel while loading", async () => {
    mountDialog({ loading: true });
    await typeReason("Se registró por error");
    expect(confirmBtn().attributes("disabled")).toBeDefined();
    const cancel = body()
      .findAll("button")
      .find((b) => b.text().includes("Cancelar"));
    expect(cancel!.attributes("disabled")).toBeDefined();
  });

  it("shows the error message and stays open", () => {
    mountDialog({ errorMessage: "No puedes revertir: el refrendo de origen ya se pagó." });
    expect(body().text()).toContain("No puedes revertir: el refrendo de origen ya se pagó.");
    expect(body().text()).toContain("Abril 2026");
  });

  it("emits close when cancelled", async () => {
    mountDialog();
    const cancel = body()
      .findAll("button")
      .find((b) => b.text().includes("Cancelar"));
    await cancel!.trigger("click");
    expect(wrapper!.emitted("close")).toBeTruthy();
  });

  it("clears the reason when reopened", async () => {
    mountDialog();
    await typeReason("Se registró por error");
    await wrapper!.setProps({ modelValue: false });
    await wrapper!.setProps({ modelValue: true });
    expect((body().find("textarea").element as HTMLTextAreaElement).value).toBe("");
  });
});
