// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";

// jsdom doesn't define `visualViewport` at all, and Vuetify's VOverlay
// location strategy references the bare global — without this stub,
// mounting a real (non-stubbed) v-dialog throws "visualViewport is not
// defined".
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

describe("SituationSinPagoDialog — resulting amount", () => {
  it('shows "$0.00" as the resulting payment amount, since SIN_PAGO is always 0', async () => {
    // v-dialog content teleports to document.body — outside the mounted
    // wrapper's own DOM subtree — so query via a DOMWrapper over
    // document.body instead of wrapper.text() (same pattern as
    // RefrendSituationBar.test.ts / SituationPagoMesesDialog.test.ts).
    wrapper = mount(SituationSinPagoDialog, {
      props: { modelValue: true, loading: false },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(body().text()).toContain("$0.00");
  });
});
