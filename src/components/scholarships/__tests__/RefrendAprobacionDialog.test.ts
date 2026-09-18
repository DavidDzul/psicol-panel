// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import RefrendAprobacionDialog from "@/components/scholarships/RefrendAprobacionDialog.vue";

// Same jsdom shims as SituationSinPagoDialog.test.ts.
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
const body = () => new DOMWrapper(document.body);

let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

describe("RefrendAprobacionDialog — readonly mode (Pagado rows: view only, no edit)", () => {
  it("hides Remover respuesta and Guardar cambios, shows only Cerrar, when readonly", async () => {
    wrapper = mount(RefrendAprobacionDialog, {
      props: { modelValue: true, initialComment: "Ya resuelto.", readonly: true },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const buttons = body()
      .findAll("button")
      .map((b) => b.text());
    expect(buttons).not.toContain("Remover respuesta");
    expect(buttons).not.toContain("Guardar cambios");
    expect(buttons.some((t) => t === "Cerrar")).toBe(true);
  });

  it("shows the existing comment, with the textarea marked readonly", async () => {
    wrapper = mount(RefrendAprobacionDialog, {
      props: { modelValue: true, initialComment: "Ya resuelto.", readonly: true },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const textarea = body().find("textarea");
    expect(textarea.attributes("readonly")).toBeDefined();
    expect((textarea.element as HTMLTextAreaElement).value).toBe("Ya resuelto.");
  });

  it("still shows the normal edit actions when not readonly", async () => {
    wrapper = mount(RefrendAprobacionDialog, {
      props: { modelValue: true, initialComment: "Ya resuelto.", readonly: false },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const buttons = body()
      .findAll("button")
      .map((b) => b.text());
    expect(buttons).toContain("Remover respuesta");
    expect(buttons).toContain("Guardar cambios");
  });
});
