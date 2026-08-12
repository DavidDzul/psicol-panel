// @vitest-environment jsdom
//
// Mirrors SituationSinPagoDialog.test.ts / SituationRetenidaDialog.test.ts's
// mount/DOMWrapper pattern (sdd/retencion-no-recuperable).

import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import SituationDescuentoDefinitivoDialog from "@/components/scholarships/SituationDescuentoDefinitivoDialog.vue";

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

const mountDialog = (finalAmount: number | string | null = 1000) => {
  wrapper = mount(SituationDescuentoDefinitivoDialog, {
    props: { modelValue: true, loading: false, finalAmount },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  return wrapper;
};

const setWithholdingValue = async (value: number): Promise<void> => {
  const input = body().find('input[type="number"]');
  await input.setValue(value);
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

const findConfirmar = () => {
  const buttons = body().findAll("button");
  const confirmBtn = buttons.find((b) => b.text() === "Confirmar");
  if (!confirmBtn) throw new Error("Confirmar button not found");
  return confirmBtn;
};

const clickConfirmar = async (): Promise<void> => {
  await findConfirmar().trigger("click");
};

const clickCancelar = async (): Promise<void> => {
  const buttons = body().findAll("button");
  const cancelBtn = buttons.find((b) => b.text() === "Cancelar");
  if (!cancelBtn) throw new Error("Cancelar button not found");
  await cancelBtn.trigger("click");
};

describe("SituationDescuentoDefinitivoDialog — confirm", () => {
  it("emits a DESCUENTO_DEFINITIVO submit payload with the discount fields and cause", async () => {
    mountDialog(1000);
    await wrapper!.vm.$nextTick();

    await setWithholdingValue(20);
    await selectCause("Bajo promedio");
    await wrapper!.vm.$nextTick();
    await clickConfirmar();

    const emitted = wrapper!.emitted("submit");
    expect(emitted).toBeTruthy();
    const form = emitted![0][0] as Record<string, unknown>;
    expect(form.resolution_type).toBe("DESCUENTO_DEFINITIVO");
    expect(form.withholding_mode).toBe("percentage");
    expect(form.withholding_value).toBe(20);
    expect(form.resolution_cause).toBe("BAJO_PROMEDIO");
  });

  it("shows the computed discount and resulting amounts, matching RETENIDA's math", async () => {
    mountDialog(1000);
    await wrapper!.vm.$nextTick();

    await setWithholdingValue(20);
    await wrapper!.vm.$nextTick();

    expect(body().text()).toContain("$200.00");
    expect(body().text()).toContain("$800.00");
  });

  it("requires a specified cause note when 'Otro' is selected", async () => {
    mountDialog(1000);
    await wrapper!.vm.$nextTick();

    await setWithholdingValue(20);
    await selectCause("Otro");
    await wrapper!.vm.$nextTick();

    expect(findConfirmar().attributes("disabled")).not.toBeUndefined();
  });

  it("disables Confirmar when no value has been entered yet", async () => {
    mountDialog(1000);
    await wrapper!.vm.$nextTick();

    await selectCause("Bajo promedio");
    await wrapper!.vm.$nextTick();

    expect(findConfirmar().attributes("disabled")).not.toBeUndefined();
  });

  it("disables Confirmar when the fixed amount exceeds the due amount", async () => {
    mountDialog(1000);
    await wrapper!.vm.$nextTick();

    const radios = body().findAll('input[type="radio"]');
    const fixedRadio = radios.find((r) => (r.element.closest(".v-radio")?.textContent ?? "").includes("Monto fijo"));
    if (!fixedRadio) throw new Error('"Monto fijo" radio not found');
    await fixedRadio.setValue();
    await wrapper!.vm.$nextTick();

    await setWithholdingValue(1500);
    await selectCause("Bajo promedio");
    await wrapper!.vm.$nextTick();

    expect(findConfirmar().attributes("disabled")).not.toBeUndefined();
  });
});

describe("SituationDescuentoDefinitivoDialog — cancel", () => {
  it("resets the form when the dialog is closed via Cancelar", async () => {
    mountDialog(1000);
    await wrapper!.vm.$nextTick();

    await setWithholdingValue(20);
    await selectCause("Bajo promedio");
    await wrapper!.vm.$nextTick();

    await clickCancelar();
    expect(wrapper!.emitted("update:modelValue")).toEqual([[false]]);

    await wrapper!.setProps({ modelValue: true });
    await wrapper!.vm.$nextTick();

    expect(body().text()).not.toContain("$200.00");
  });
});
