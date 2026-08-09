// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DOMWrapper, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import type { ResolutionType, WorkflowStatus } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// v-menu (like v-dialog/v-overlay) teleports its content to `document.body`
// — outside the mounted wrapper's own DOM subtree — so once the menu is
// opened, DOM queries for its items go through a `DOMWrapper` over
// `document.body` instead of `wrapper.find*`, same pattern as
// SituationPagoMesesDialog.test.ts. The activator button itself (and the
// resolved-state chip/undo button, which are NOT inside a v-menu) stay
// queryable directly on `wrapper`.

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

const RESOLUTION_CHIP = { label: "Sin pago", color: "red", icon: "mdi-cash-remove" };

let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

const body = () => new DOMWrapper(document.body);

const mountBar = (props: {
  currentResolution?: ResolutionType | null;
  resolutionChip?: { label: string; color: string; icon: string };
  locked?: boolean;
  loading?: boolean;
  workflowStatus?: WorkflowStatus | null;
}): ReturnType<typeof mount> => {
  wrapper = mount(RefrendSituationBar, {
    props: {
      currentResolution: props.currentResolution ?? null,
      resolutionChip: props.resolutionChip ?? RESOLUTION_CHIP,
      locked: props.locked ?? false,
      loading: props.loading ?? false,
      workflowStatus: props.workflowStatus ?? "DRAFT",
    },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  return wrapper;
};

const openAccionesMenu = async (w: ReturnType<typeof mount>): Promise<void> => {
  await w.find("button").trigger("click");
  await w.vm.$nextTick();
  await w.vm.$nextTick();
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe("RefrendSituationBar — unresolved state (DRAFT / CON_INCIDENCIA)", () => {
  it("shows the full Acciones menu (activator) when workflow_status is DRAFT, no chip/undo button", () => {
    const w = mountBar({ workflowStatus: "DRAFT" });

    expect(w.text()).toContain("Acciones");
    expect(w.findComponent({ name: "VChip" }).exists()).toBe(false);
    expect(w.text()).not.toContain("Deshacer resolución");
  });

  it("shows the full Acciones menu when workflow_status is CON_INCIDENCIA", () => {
    const w = mountBar({ workflowStatus: "CON_INCIDENCIA" });

    expect(w.text()).toContain("Acciones");
    expect(w.text()).not.toContain("Deshacer resolución");
  });

  it('opens to reveal "Pago al 100%" and situation items, but never "Aprobar con descuento"', async () => {
    const w = mountBar({ workflowStatus: "CON_INCIDENCIA" });

    await openAccionesMenu(w);

    expect(body().text()).toContain("Pago al 100% (sin descuento)");
    expect(body().text()).toContain("Sin pago (0%)");
    expect(body().text()).not.toContain("Aprobar con descuento");
  });

  it('emits "approve-full" when "Pago al 100%" is clicked', async () => {
    const w = mountBar({ workflowStatus: "DRAFT" });

    await openAccionesMenu(w);

    const items = body().findAll(".v-list-item");
    const payFullItem = items.find((el) => el.text().includes("Pago al 100%"));
    expect(payFullItem).toBeTruthy();
    await payFullItem!.trigger("click");

    expect(w.emitted()).toHaveProperty("approve-full");
  });
});

describe("RefrendSituationBar — resolved state (LISTO_PARA_PAGO)", () => {
  it('hides the Acciones menu and shows the chip + "Deshacer resolución" button when unlocked', () => {
    const w = mountBar({
      workflowStatus: "LISTO_PARA_PAGO",
      currentResolution: "SIN_PAGO",
      resolutionChip: RESOLUTION_CHIP,
    });

    expect(w.text()).not.toContain("Acciones");
    expect(w.findComponent({ name: "VChip" }).exists()).toBe(true);
    expect(w.text()).toContain(RESOLUTION_CHIP.label);
    expect(w.text()).toContain("Deshacer resolución");
  });

  it("renders resolutionChip.label even when currentResolution is null (legacy ApproveRefrendAction rows)", () => {
    const w = mountBar({
      workflowStatus: "LISTO_PARA_PAGO",
      currentResolution: null,
      resolutionChip: { label: "Listo para pago", color: "green", icon: "mdi-check-circle-outline" },
    });

    expect(w.text()).toContain("Listo para pago");
    expect(w.find("[data-resolution]").attributes("data-resolution")).toBe("NONE");
  });

  it('emits "clear-resolution" when "Deshacer resolución" is clicked', async () => {
    const w = mountBar({
      workflowStatus: "LISTO_PARA_PAGO",
      currentResolution: "SIN_PAGO",
    });

    const undoButton = w
      .findAll("button")
      .find((btn) => btn.text().includes("Deshacer resolución"));
    expect(undoButton).toBeTruthy();
    await undoButton!.trigger("click");

    expect(w.emitted()).toHaveProperty("clear-resolution");
  });

  it("passes the loading prop through to the undo button", () => {
    const w = mountBar({
      workflowStatus: "LISTO_PARA_PAGO",
      currentResolution: "SIN_PAGO",
      loading: true,
    });

    const undoButton = w
      .findAll("button")
      .find((btn) => btn.text().includes("Deshacer resolución"));
    expect(undoButton!.classes()).toContain("v-btn--loading");
  });
});

describe("RefrendSituationBar — locked / CLOSED", () => {
  it("renders neither the Acciones menu nor the undo button when locked, regardless of workflow_status", () => {
    const wUnresolved = mountBar({ workflowStatus: "DRAFT", locked: true });
    expect(wUnresolved.text()).not.toContain("Acciones");
    expect(wUnresolved.text()).not.toContain("Deshacer resolución");
    wUnresolved.unmount();

    const wResolved = mountBar({
      workflowStatus: "LISTO_PARA_PAGO",
      currentResolution: "SIN_PAGO",
      locked: true,
    });
    expect(wResolved.text()).not.toContain("Acciones");
    expect(wResolved.text()).not.toContain("Deshacer resolución");
    expect(wResolved.findComponent({ name: "VChip" }).exists()).toBe(false);
  });
});
