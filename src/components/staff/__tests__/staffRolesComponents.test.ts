// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VBtn, VTextField } from "vuetify/components";
import CreateStaffRoleDialog from "@/components/staff/CreateStaffRoleDialog.vue";
import EditStaffRolePermissionsDialog from "@/components/staff/EditStaffRolePermissionsDialog.vue";
import type { StaffPermissionModule, StaffRole } from "@/interfaces/staff";

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

const clickButton = async (label: string): Promise<void> => {
  const btn = wrapper?.findAllComponents(VBtn).find((b) => b.text() === label);
  await btn?.trigger("click");
  await wrapper?.vm.$nextTick();
};

describe("CreateStaffRoleDialog", () => {
  const open = async (props: Record<string, unknown> = {}) => {
    wrapper = mount(CreateStaffRoleDialog, {
      props: { modelValue: false, ...props },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();
  };

  it("uppercases the name and emits it on submit", async () => {
    await open();
    await wrapper!.findComponent(VTextField).vm.$emit("update:modelValue", "ventas_2");
    await clickButton("Crear");
    expect(wrapper!.emitted("submit")?.[0]).toEqual(["VENTAS_2"]);
  });

  it("blocks submit and shows the format hint for an invalid name", async () => {
    await open();
    await wrapper!.findComponent(VTextField).vm.$emit("update:modelValue", "a b");
    await clickButton("Crear");
    expect(wrapper!.emitted("submit")).toBeUndefined();
    expect(document.body.textContent).toContain("Solo mayúsculas, números y guion bajo");
  });

  it("shows the server error message", async () => {
    await open({ serverError: "Ya existe un rol con ese nombre." });
    expect(document.body.textContent).toContain("Ya existe un rol con ese nombre.");
  });
});

describe("EditStaffRolePermissionsDialog", () => {
  const role: StaffRole = { id: 7, name: "ADMIN_X", type: "ADMIN", permissions_ids: [1, 2], users_count: 4 };
  const catalog: StaffPermissionModule[] = [
    {
      module: "Becas",
      permissions: [
        { id: 1, name: "PS_GROUP_BECAS", description: "Menú Becas", kind: "menu-group", menu_group: null },
        { id: 2, name: "PS_VIEW_BECAS", description: "Ver becas", kind: "page", menu_group: "PS_GROUP_BECAS" },
        { id: 3, name: "PS_EDIT_BECAS", description: "Editar becas", kind: "action", menu_group: null },
      ],
    },
  ];
  const noLockout = { removedMenus: [], removedActions: [], orphanedPages: [] };

  const open = async (props: Record<string, unknown> = {}) => {
    wrapper = mount(EditStaffRolePermissionsDialog, {
      props: { modelValue: true, role, catalog, draftIds: [1, 2], lockout: noLockout, ...props },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
  };

  it("groups permissions by module with kind chips and shows the next-login note", async () => {
    await open();
    const text = document.body.textContent ?? "";
    expect(text).toContain("Becas");
    expect(text).toContain("Ver becas");
    expect(text).toContain("Menú");
    expect(text).toContain("Página");
    expect(text).toContain("Acción");
    expect(text).toContain("4 usuario(s)");
    expect(text).toContain("vuelvan a iniciar sesión");
  });

  it("emits the full id list when a permission is toggled", async () => {
    await open();
    const boxes = document.body.querySelectorAll<HTMLInputElement>("input[type=checkbox]");
    boxes[2].click();
    await wrapper!.vm.$nextTick();
    const emitted = wrapper!.emitted("update:draftIds");
    expect((emitted?.[0]?.[0] as number[]).sort()).toEqual([1, 2, 3]);
  });

  it("lists the removed menus in the lockout confirmation and emits confirm / cancel-confirm", async () => {
    const lockout = { ...noLockout, removedMenus: [catalog[0].permissions[1]] };
    await open({ confirmOpen: true, lockout });
    const text = document.body.textContent ?? "";
    expect(text).toContain("Los usuarios con este rol dejarán de ver:");
    expect(text).toContain("Ver becas");
    await clickButton("Confirmar y guardar");
    expect(wrapper!.emitted("confirm")).toHaveLength(1);
    await clickButton("Volver");
    expect(wrapper!.emitted("cancel-confirm")).toHaveLength(1);
  });

  it("emits save from the main button", async () => {
    await open();
    await clickButton("Guardar");
    expect(wrapper!.emitted("save")).toHaveLength(1);
  });
});
