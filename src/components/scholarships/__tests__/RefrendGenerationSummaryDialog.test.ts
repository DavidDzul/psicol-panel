// @vitest-environment jsdom
//
// sdd/verificacion-incidencias-ux PR3: one summary per generación processed
// by useSedeRefrendGeneration's sequential loop — created/omitidos (ya
// existían)/fuera de retícula/errores, plus the failures list (becario +
// motivo). A generación whose HTTP request itself failed (requestError) is
// rendered distinctly from one that completed with its own errors count.

import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import RefrendGenerationSummaryDialog from "@/components/scholarships/RefrendGenerationSummaryDialog.vue";
import type { GenerationRunSummary } from "@/interfaces/scholarship";

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

const mountDialog = (summaries: GenerationRunSummary[]) => {
  wrapper = mount(RefrendGenerationSummaryDialog, {
    props: { modelValue: true, summaries },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  return wrapper;
};

describe("RefrendGenerationSummaryDialog", () => {
  it("renders one entry per generación with created/omitidos/fuera de retícula/errores counts", () => {
    mountDialog([
      {
        generationId: 1,
        generationName: "Generación A",
        result: {
          created: 5,
          skipped: 2,
          skipped_out_of_reticula: 1,
          errors: 0,
          failures: [],
        },
      },
    ]);

    const text = body().text();
    expect(text).toContain("Generación A");
    expect(text).toContain("5");
    expect(text).toContain("2");
    expect(text).toContain("1");
  });

  it("lists failures with becario name and reason", () => {
    mountDialog([
      {
        generationId: 1,
        generationName: "Generación A",
        result: {
          created: 1,
          skipped: 0,
          skipped_out_of_reticula: 1,
          errors: 0,
          failures: [
            {
              user_id: 42,
              name: "Juan Pérez",
              reason: "El periodo está fuera de la retícula del becario.",
              kind: "skipped_out_of_reticula",
            },
          ],
        },
      },
    ]);

    const text = body().text();
    expect(text).toContain("Juan Pérez");
    expect(text).toContain("El periodo está fuera de la retícula del becario.");
  });

  it("renders a request-error generación distinctly from a completed one", () => {
    mountDialog([
      {
        generationId: 1,
        generationName: "Generación A",
        result: { created: 3, skipped: 0, skipped_out_of_reticula: 0, errors: 0, failures: [] },
      },
      {
        generationId: 2,
        generationName: "Generación B",
        requestError: "Error del servidor.",
      },
    ]);

    const text = body().text();
    expect(text).toContain("Generación B");
    expect(text).toContain("Error del servidor.");
  });

  it("emits update:modelValue false when closed", async () => {
    mountDialog([
      {
        generationId: 1,
        generationName: "Generación A",
        result: { created: 1, skipped: 0, skipped_out_of_reticula: 0, errors: 0, failures: [] },
      },
    ]);

    const buttons = body().findAll("button");
    const closeBtn = buttons.find((b) => b.text() === "Cerrar");
    if (!closeBtn) throw new Error("Cerrar button not found");
    await closeBtn.trigger("click");

    expect(wrapper?.emitted("update:modelValue")).toEqual([[false]]);
  });

  it("shows an info message when there are no summaries (empty sede)", () => {
    mountDialog([]);

    expect(body().text()).toContain("No hay generaciones");
  });
});
