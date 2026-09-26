// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import AdvanceDivergenceReasonDialog from "@/components/scholarships/AdvanceDivergenceReasonDialog.vue";

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

const mountDialog = async (): Promise<ReturnType<typeof mount>> => {
  wrapper = mount(AdvanceDivergenceReasonDialog, {
    props: { modelValue: true, loading: false },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
};

const clickConfirmar = async (): Promise<void> => {
  const btn = body().findAll("button").find((b) => b.text() === "Confirmar");
  if (!btn) throw new Error("Confirmar button not found");
  await btn.trigger("click");
};

describe("AdvanceDivergenceReasonDialog", () => {
  it("disables Confirmar until a non-blank reason is entered", async () => {
    await mountDialog();

    const confirmBtn = body().findAll("button").find((b) => b.text() === "Confirmar");
    expect(confirmBtn!.attributes("disabled")).toBeDefined();

    const textarea = body().find('textarea[name="advance-divergence-reason"]');
    await textarea.setValue("  ");
    await wrapper!.vm.$nextTick();
    expect(
      body().findAll("button").find((b) => b.text() === "Confirmar")!.attributes("disabled"),
    ).toBeDefined();
  });

  it("emits submit with the trimmed reason when confirmed", async () => {
    const w = await mountDialog();

    const textarea = body().find('textarea[name="advance-divergence-reason"]');
    await textarea.setValue("  Autorizado por dirección.  ");
    await w.vm.$nextTick();

    await clickConfirmar();

    const emitted = w.emitted("submit");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toBe("Autorizado por dirección.");
  });

  it('emits cancel and closes when "Cancelar" is clicked', async () => {
    const w = await mountDialog();

    const cancelBtn = body().findAll("button").find((b) => b.text() === "Cancelar");
    await cancelBtn!.trigger("click");

    expect(w.emitted("cancel")).toBeTruthy();
  });

  it("resets the reason after closing and reopening", async () => {
    const w = await mountDialog();
    const textarea = body().find('textarea[name="advance-divergence-reason"]');
    await textarea.setValue("Motivo anterior");
    await w.vm.$nextTick();

    await w.setProps({ modelValue: false });
    await w.vm.$nextTick();
    await w.setProps({ modelValue: true });
    await w.vm.$nextTick();
    await w.vm.$nextTick();

    const reopenedTextarea = body().find(
      'textarea[name="advance-divergence-reason"]',
    ).element as HTMLTextAreaElement;
    expect(reopenedTextarea.value).toBe("");
  });
});
