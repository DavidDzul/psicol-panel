// @vitest-environment jsdom
//
// UsersTable: "Constancia pendiente" chip next to the active icon, and the
// Tipo filter behaviour (default filter vs. cleared filter).

import { afterEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createVuetify } from "vuetify";
import UsersTable from "@/components/users/UsersTable.vue";
import type { User, UserType } from "@/interfaces/user";

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

const CHIP_TEXT = "Constancia pendiente";
const TOOLTIP_TEXT = "Sin constancia o malla curricular cargada";

const vuetify = createVuetify();

let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

const makeUser = (overrides: Partial<User> & { id: number }): User => ({
  enrollment: `ENR${overrides.id}`,
  first_name: `Nombre${overrides.id}`,
  last_name: `Apellido${overrides.id}`,
  email: `u${overrides.id}@example.com`,
  email_verified_at: null,
  phone: "5512345678",
  workstation: null,
  user_type: "BEC_ACTIVE",
  campus: "CDMX",
  generation_id: 1,
  active: true,
  created_at: null,
  updated_at: "2026-01-01",
  ...overrides,
});

const mountTable = async (users: User[], defaultUserType: UserType | null = null) => {
  wrapper = mount(UsersTable, {
    props: { users, defaultUserType },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  await nextTick();
  await flushPromises();
  return wrapper;
};

const headers = (w: ReturnType<typeof mount>) => w.findAll("th").map((th) => th.text());

const bodyRows = (w: ReturnType<typeof mount>) => w.findAll("tbody tr");

const chips = (w: ReturnType<typeof mount>) =>
  w.findAll(".v-chip").filter((c) => c.text() === CHIP_TEXT);

describe("UsersTable - Tipo filter", () => {
  const mixed = [
    makeUser({ id: 1, user_type: "BEC_ACTIVE" }),
    makeUser({ id: 2, user_type: "BEC_INACTIVE" }),
  ];

  it("shows only becarios, the Becarios header and no Tipo column when defaultUserType is BEC_ACTIVE", async () => {
    const w = await mountTable(mixed, "BEC_ACTIVE");

    expect(bodyRows(w)).toHaveLength(1);
    expect(bodyRows(w)[0].text()).toContain("Nombre1");
    expect(w.text()).toContain("Becarios");
    expect(w.text()).not.toContain("Todos los usuarios");
    expect(headers(w)).not.toContain("Tipo");
  });

  it("shows everyone, the Todos los usuarios header and the Tipo column once the filter is cleared", async () => {
    const w = await mountTable(mixed, "BEC_ACTIVE");

    // The Tipo select lives inside a lazy menu: open it, then clear the select.
    await w.find("button .mdi-filter").trigger("click");
    await flushPromises();
    const select = w
      .findAllComponents({ name: "VSelect" })
      .find((c) => c.props("label") === "Tipo de usuario");
    if (!select) throw new Error("Tipo de usuario select not found");
    expect(select.props("clearable")).toBe(true);
    select.vm.$emit("update:modelValue", null);
    await nextTick();
    await flushPromises();

    expect(bodyRows(w)).toHaveLength(2);
    expect(w.text()).toContain("Todos los usuarios");
    expect(headers(w)).toContain("Tipo");
  });

  it("shows everyone with the Tipo column when defaultUserType is null", async () => {
    const w = await mountTable(mixed, null);

    expect(bodyRows(w)).toHaveLength(2);
    expect(w.text()).toContain("Todos los usuarios");
    expect(headers(w)).toContain("Tipo");
  });
});

describe("UsersTable - constancia pendiente chip", () => {
  it.each([[false], [undefined]])(
    "shows the chip when curriculum_uploaded is %s",
    async (flag) => {
      const w = await mountTable([makeUser({ id: 1, curriculum_uploaded: flag })]);

      expect(chips(w)).toHaveLength(1);
    },
  );

  it("hides the chip when curriculum_uploaded is true", async () => {
    const w = await mountTable([makeUser({ id: 1, curriculum_uploaded: true })]);

    expect(chips(w)).toHaveLength(0);
  });

  it("shows the chip for egresados too", async () => {
    const w = await mountTable([
      makeUser({ id: 1, user_type: "BEC_INACTIVE", curriculum_uploaded: false }),
    ]);

    expect(chips(w)).toHaveLength(1);
  });

  it("coexists with the check icon for active users", async () => {
    const w = await mountTable([makeUser({ id: 1, active: true, curriculum_uploaded: false })]);
    const cell = chips(w)[0].element.parentElement as HTMLElement;

    expect(cell.querySelector(".mdi-check")).not.toBeNull();
    expect(cell.querySelector(".mdi-close")).toBeNull();
  });

  it("coexists with the close icon for inactive users", async () => {
    const w = await mountTable([makeUser({ id: 1, active: false, curriculum_uploaded: false })]);
    const cell = chips(w)[0].element.parentElement as HTMLElement;

    expect(cell.querySelector(".mdi-close")).not.toBeNull();
    expect(cell.querySelector(".mdi-check")).toBeNull();
  });

  it("wraps the chip in a tooltip with the explanatory text and the warning style", async () => {
    const w = await mountTable([makeUser({ id: 1, curriculum_uploaded: false })]);
    const tooltip = w
      .findAllComponents({ name: "VTooltip" })
      .find((t) => t.props("text") === TOOLTIP_TEXT);

    expect(tooltip).toBeDefined();
    expect(tooltip!.props("location")).toBe("top");
    const chip = w.findAllComponents({ name: "VChip" }).find((c) => c.text() === CHIP_TEXT)!;
    expect(chip.props("color")).toBe("warning");
    expect(chip.props("prependIcon")).toBe("mdi-file-alert-outline");
  });
});
