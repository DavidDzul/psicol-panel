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

// ---------------------------------------------------------------------------
// Default sort (last name, then first name) + Generación column
// ---------------------------------------------------------------------------
type CompareFn = (a: unknown, b: unknown) => number;

const generations: Generation[] = [
  { id: 1, campus: "CDMX", generation_active: true, generation_name: "Gen Uno" },
  { id: 2, campus: "CDMX", generation_active: false, generation_name: "Gen Dos" },
];

const mountWithGenerations = async (
  users: User[],
  gens: Generation[] = generations,
  defaultUserType: UserType | null = null,
) => {
  wrapper = mount(UsersTable, {
    props: { users, generations: gens, defaultUserType },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  await nextTick();
  await flushPromises();
  return wrapper;
};

const colIndex = (w: ReturnType<typeof mount>, title: string) =>
  w.findAll("th").findIndex((th) => th.text().includes(title));

const columnValues = (w: ReturnType<typeof mount>, title: string) => {
  const idx = colIndex(w, title);
  return w.findAll("tbody tr").map((tr) => tr.findAll("td")[idx].text());
};

describe("UsersTable - default sort by last name then first name", () => {
  it("sorts accent-insensitively and case-insensitively, with first-name tiebreak", async () => {
    const w = await mountTable([
      makeUser({ id: 1, last_name: "Bravo", first_name: "Zoe" }),
      makeUser({ id: 2, last_name: "Álvarez", first_name: "Luis" }),
      makeUser({ id: 3, last_name: "alvarez", first_name: "Ana" }),
      makeUser({ id: 4, last_name: "Alvarez", first_name: "Beto" }),
    ]);

    expect(columnValues(w, "Nombre(s)")).toEqual(["Ana", "Beto", "Luis", "Zoe"]);
  });

  it("places null or empty last names after the rest", async () => {
    const w = await mountTable([
      makeUser({ id: 1, last_name: "", first_name: "Vacio" }),
      makeUser({ id: 2, last_name: "Zuñiga", first_name: "Zeta" }),
      makeUser({ id: 3, last_name: null as unknown as string, first_name: "Nulo" }),
      makeUser({ id: 4, last_name: "Acosta", first_name: "Alfa" }),
    ]);

    const names = columnValues(w, "Nombre(s)");
    expect(names.slice(0, 2)).toEqual(["Alfa", "Zeta"]);
    expect(names.slice(2).sort()).toEqual(["Nulo", "Vacio"]);
  });

  it("sorts only the rows left by the filters", async () => {
    const w = await mountTable(
      [
        makeUser({ id: 1, last_name: "Zeta", user_type: "BEC_ACTIVE" }),
        makeUser({ id: 2, last_name: "Beta", user_type: "BEC_INACTIVE" }),
        makeUser({ id: 3, last_name: "Alfa", user_type: "BEC_ACTIVE" }),
      ],
      "BEC_ACTIVE",
    );

    expect(columnValues(w, "Apellido(s)")).toEqual(["Alfa", "Zeta"]);
  });

  it("wires sort-by and custom-key-sort on the data table", async () => {
    const w = await mountTable([makeUser({ id: 1 })]);
    const table = w.findComponent({ name: "VDataTable" });

    expect(table.props("sortBy")).toEqual([
      { key: "last_name", order: "asc" },
      { key: "first_name", order: "asc" },
    ]);
    const custom = table.props("customKeySort") as Record<string, CompareFn>;
    expect(Object.keys(custom).sort()).toEqual(["first_name", "generation", "last_name"]);
    expect(custom.last_name("Álvarez", "Alvarez")).toBe(0);
    expect(custom.last_name("Alvarez", "Bravo")).toBeLessThan(0);
    expect(custom.last_name(null, "Bravo")).toBeGreaterThan(0);
    expect(custom.last_name("", "Bravo")).toBeGreaterThan(0);
  });

  it("lets the user toggle the order by clicking the Apellido(s) header", async () => {
    const w = await mountTable([
      makeUser({ id: 1, last_name: "Alfa" }),
      makeUser({ id: 2, last_name: "Beta" }),
    ]);
    expect(columnValues(w, "Apellido(s)")).toEqual(["Alfa", "Beta"]);

    await w.findAll("th")[colIndex(w, "Apellido(s)")].trigger("click");
    await nextTick();

    expect(columnValues(w, "Apellido(s)")).toEqual(["Beta", "Alfa"]);
  });
});

describe("UsersTable - Generación column", () => {
  it("sits right after Apellido(s) and before Tipo when Tipo is shown", async () => {
    const w = await mountTable([makeUser({ id: 1 })], null);

    expect(headers(w)).toEqual([
      "ID",
      "Matrícula",
      "Nombre(s)",
      "Apellido(s)",
      "Generación",
      "Tipo",
      "Activo",
      "",
    ]);
  });

  it("sits right after Apellido(s) when Tipo is hidden", async () => {
    const w = await mountTable([makeUser({ id: 1 })], "BEC_ACTIVE");

    expect(headers(w)).toEqual([
      "ID",
      "Matrícula",
      "Nombre(s)",
      "Apellido(s)",
      "Generación",
      "Activo",
      "",
    ]);
  });

  it("resolves generation_id to generation_name, including string ids", async () => {
    const w = await mountWithGenerations([
      makeUser({ id: 1, last_name: "A", generation_id: 1 }),
      makeUser({ id: 2, last_name: "B", generation_id: "2" as unknown as number }),
    ]);

    expect(columnValues(w, "Generación")).toEqual(["Gen Uno", "Gen Dos"]);
  });

  it('shows "Sin generación" for null or unknown generation ids', async () => {
    const w = await mountWithGenerations([
      makeUser({ id: 1, last_name: "A", generation_id: null }),
      makeUser({ id: 2, last_name: "B", generation_id: 999 }),
    ]);

    expect(columnValues(w, "Generación")).toEqual(["Sin generación", "Sin generación"]);
  });

  it('compares generation names numerically with "Sin generación" last', async () => {
    const w = await mountTable([makeUser({ id: 1 })]);
    const custom = w.findComponent({ name: "VDataTable" }).props("customKeySort") as Record<
      string,
      CompareFn
    >;

    const sorted = ["Generación 19", "Sin generación", "Generación 2", "Generación 10"].sort(
      custom.generation,
    );
    expect(sorted).toEqual(["Generación 2", "Generación 10", "Generación 19", "Sin generación"]);
  });

  it("sorts rows by generation numerically when the Generación header is clicked", async () => {
    const gens: Generation[] = [
      { id: 1, campus: "CDMX", generation_active: true, generation_name: "Generación 19" },
      { id: 2, campus: "CDMX", generation_active: true, generation_name: "Generación 2" },
      { id: 3, campus: "CDMX", generation_active: false, generation_name: "Generación 10" },
    ];
    const w = await mountWithGenerations(
      [
        makeUser({ id: 1, last_name: "A", generation_id: 1 }),
        makeUser({ id: 2, last_name: "B", generation_id: null }),
        makeUser({ id: 3, last_name: "C", generation_id: 2 }),
        makeUser({ id: 4, last_name: "D", generation_id: 3 }),
      ],
      gens,
    );

    await w.findAll("th")[colIndex(w, "Generación")].trigger("click");
    await nextTick();

    expect(columnValues(w, "Generación")).toEqual([
      "Generación 2",
      "Generación 10",
      "Generación 19",
      "Sin generación",
    ]);
  });
});
