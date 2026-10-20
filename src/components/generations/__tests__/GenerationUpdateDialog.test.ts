// @vitest-environment jsdom
//
// sdd/generaciones-activas-refrendos: an active generación with becarios that
// still have pending payments cannot be deactivated (the API answers 422
// GENERATION_HAS_PENDING_BECARIOS); the checkbox is disabled with a
// persistent hint. Inactive generaciones can always be re-activated.

import { afterEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createVuetify } from "vuetify";
import GenerationUpdateDialog from "@/components/generations/GenerationUpdateDialog.vue";
import type { Generation } from "@/interfaces/generation";

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

const baseGeneration: Generation = {
  id: 1,
  campus: "CDMX",
  generation_active: true,
  generation_name: "Gen A",
};

const mountDialog = async (editItem: Generation) => {
  wrapper = mount(GenerationUpdateDialog, {
    props: { modelValue: false, loading: false, editItem },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  await wrapper.setProps({ modelValue: true });
  await nextTick();
  await flushPromises();
  return wrapper;
};

const activeCheckbox = (w: ReturnType<typeof mount>) => {
  const checkbox = w
    .findAllComponents({ name: "VCheckbox" })
    .find((c) => c.props("label") === "¿Generación activa?");
  if (!checkbox) throw new Error("¿Generación activa? checkbox not found");
  return checkbox;
};

describe("GenerationUpdateDialog — desactivación bloqueada", () => {
  it("disables the checkbox and shows the persistent hint when active with pending becarios", async () => {
    const w = await mountDialog({ ...baseGeneration, pending_becarios_count: 3 });
    const checkbox = activeCheckbox(w);

    expect(checkbox.props("disabled")).toBe(true);
    expect(checkbox.props("hint")).toBe(
      "No se puede desactivar: 3 becarios con pagos pendientes (retícula o meses de gracia vigentes)",
    );
    expect(checkbox.props("persistentHint")).toBe(true);
    expect(checkbox.props("modelValue")).toBe(true);
  });

  it("reflects the actual count in the hint", async () => {
    const w = await mountDialog({ ...baseGeneration, pending_becarios_count: 12 });

    expect(activeCheckbox(w).props("hint")).toContain("12 becarios");
  });

  it("keeps the checkbox enabled without hint when the count is 0", async () => {
    const w = await mountDialog({ ...baseGeneration, pending_becarios_count: 0 });
    const checkbox = activeCheckbox(w);

    expect(checkbox.props("disabled")).toBe(false);
    expect(checkbox.props("hint")).toBeFalsy();
    expect(checkbox.props("persistentHint")).toBeFalsy();
  });

  it("keeps the checkbox enabled when pending_becarios_count is missing (treated as 0)", async () => {
    const w = await mountDialog({ ...baseGeneration });

    expect(activeCheckbox(w).props("disabled")).toBe(false);
  });

  it("keeps the checkbox enabled for an inactive generación even with pending becarios", async () => {
    const w = await mountDialog({
      ...baseGeneration,
      generation_active: false,
      pending_becarios_count: 5,
    });
    const checkbox = activeCheckbox(w);

    expect(checkbox.props("disabled")).toBe(false);
    expect(checkbox.props("hint")).toBeFalsy();
    expect(checkbox.props("modelValue")).toBe(false);
  });
});
