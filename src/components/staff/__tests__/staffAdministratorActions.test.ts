// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VBtn, VSelect, VTextField } from "vuetify/components";
import StaffAdministratorsTable from "@/components/staff/StaffAdministratorsTable.vue";
import StaffAdministratorActions from "@/components/staff/StaffAdministratorActions.vue";
import AssignStaffRoleDialog from "@/components/staff/AssignStaffRoleDialog.vue";
import ResetStaffPasswordDialog from "@/components/staff/ResetStaffPasswordDialog.vue";
import ConfirmStaffActiveDialog from "@/components/staff/ConfirmStaffActiveDialog.vue";
import type { StaffAdministrator, StaffRole } from "@/interfaces/staff";

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

const field = (label: string) =>
  wrapper!.findAllComponents(VTextField).find((f) => f.props("label") === label)!;

const person = (overrides: Partial<StaffAdministrator> = {}): StaffAdministrator => ({
  id: 1,
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.com",
  campus: "MERIDA",
  active: true,
  role: { id: 3, name: "ADMIN_X", is_obsolete: false },
  is_root: false,
  is_editable: true,
  ...overrides,
});

const roles: StaffRole[] = [3, 5].map((id) => ({
  id,
  name: id === 3 ? "ADMIN_X" : "ADMIN_Y",
  type: "ADMIN",
  permissions_ids: [],
  users_count: 0,
}));

const mountWith = async (component: object, props: Record<string, unknown>) => {
  wrapper = mount(component, { props, global: { plugins: [vuetify] }, attachTo: document.body });
  await wrapper.vm.$nextTick();
};

describe("row actions in the table", () => {
  const render = async (administrators: StaffAdministrator[]) => {
    wrapper = mount(StaffAdministratorsTable, {
      props: { administrators },
      slots: {
        actions: `<template #actions="{ administrator }"><span class="row-action">{{ administrator.email }}</span></template>`,
      },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
  };

  it("hides actions for ROOT, self and any non-editable row", async () => {
    await render([
      person({ id: 1 }),
      person({ id: 2, email: "root@example.com", is_root: true, is_editable: false }),
      person({ id: 3, email: "me@example.com", is_editable: false }),
    ]);
    const actions = wrapper!.findAll(".row-action").map((a) => a.text());
    expect(actions).toEqual(["ana@example.com"]);
  });
});

describe("StaffAdministratorActions", () => {
  it("offers deactivate for an active account and emits each action", async () => {
    await mountWith(StaffAdministratorActions, { administrator: person() });
    const text = wrapper!.text();
    expect(text).toContain("Cambiar rol");
    expect(text).toContain("Restablecer contraseña");
    expect(text).toContain("Desactivar");

    await clickButton("Cambiar rol");
    await clickButton("Restablecer contraseña");
    await clickButton("Desactivar");
    expect(wrapper!.emitted("assign")).toHaveLength(1);
    expect(wrapper!.emitted("reset")).toHaveLength(1);
    expect(wrapper!.emitted("toggle")).toHaveLength(1);
  });

  it("offers activate for an inactive account", async () => {
    await mountWith(StaffAdministratorActions, { administrator: person({ active: false }) });
    expect(wrapper!.text()).toContain("Activar");
    expect(wrapper!.text()).not.toContain("Desactivar");
  });
});

describe("AssignStaffRoleDialog", () => {
  it("preselects the current role, warns about sessions and submits the chosen role", async () => {
    await mountWith(AssignStaffRoleDialog, { target: person(), roles });
    expect(wrapper!.findComponent(VSelect).props("modelValue")).toBe(3);
    expect(document.body.textContent).toContain("se cerrarán las sesiones");

    await wrapper!.findComponent(VSelect).vm.$emit("update:modelValue", 5);
    await clickButton("Guardar");
    expect(wrapper!.emitted("submit")?.[0]).toEqual([5]);
  });

  it("starts empty for an obsolete role and refuses to submit without a role", async () => {
    await mountWith(AssignStaffRoleDialog, {
      target: person({ role: { id: 4, name: "YUCATAN", is_obsolete: true } }),
      roles,
    });
    expect(wrapper!.findComponent(VSelect).props("modelValue")).toBeNull();

    await clickButton("Guardar");
    expect(wrapper!.emitted("submit")).toBeUndefined();
    expect(document.body.textContent).toContain("Campo requerido");
  });

  it("shows the server error and emits close on cancel", async () => {
    await mountWith(AssignStaffRoleDialog, { target: person(), roles, serverError: "Rol inválido." });
    expect(document.body.textContent).toContain("Rol inválido.");
    await clickButton("Cancelar");
    expect(wrapper!.emitted("close")).toHaveLength(1);
  });
});

describe("ResetStaffPasswordDialog", () => {
  it("requires both fields and a matching confirmation", async () => {
    await mountWith(ResetStaffPasswordDialog, { target: person() });
    await clickButton("Restablecer");
    expect(wrapper!.emitted("submit")).toBeUndefined();
    expect(document.body.textContent).toContain("Campo requerido");

    await field("Nueva contraseña").vm.$emit("update:modelValue", "abc");
    await field("Confirmar contraseña").vm.$emit("update:modelValue", "abd");
    await clickButton("Restablecer");
    expect(wrapper!.emitted("submit")).toBeUndefined();
    expect(document.body.textContent).toContain("Las contraseñas no coinciden.");
  });

  it("accepts a short password (no minimum length) and emits the payload", async () => {
    await mountWith(ResetStaffPasswordDialog, { target: person() });
    await field("Nueva contraseña").vm.$emit("update:modelValue", "a");
    await field("Confirmar contraseña").vm.$emit("update:modelValue", "a");
    await clickButton("Restablecer");
    expect(wrapper!.emitted("submit")?.[0]).toEqual([
      { password: "a", password_confirmation: "a" },
    ]);
  });

  it("clears typed passwords when reopened for another target and shows server errors", async () => {
    await mountWith(ResetStaffPasswordDialog, { target: person(), serverError: "No permitido." });
    await field("Nueva contraseña").vm.$emit("update:modelValue", "secreta");
    expect(document.body.textContent).toContain("No permitido.");

    await wrapper!.setProps({ target: null });
    await wrapper!.setProps({ target: person({ id: 2 }) });
    expect(field("Nueva contraseña").props("modelValue")).toBe("");
  });
});

describe("ConfirmStaffActiveDialog", () => {
  it("warns that deactivating blocks login and closes sessions, and emits confirm", async () => {
    await mountWith(ConfirmStaffActiveDialog, { target: person() });
    const text = document.body.textContent ?? "";
    expect(text).toContain("no podrá iniciar sesión");
    expect(text).toContain("se cerrarán sus sesiones");

    await clickButton("Desactivar");
    expect(wrapper!.emitted("confirm")).toHaveLength(1);
  });

  it("offers activation for an inactive account and emits cancel", async () => {
    await mountWith(ConfirmStaffActiveDialog, { target: person({ active: false }) });
    expect(document.body.textContent).toContain("podrá iniciar sesión de nuevo");
    await clickButton("Cancelar");
    expect(wrapper!.emitted("cancel")).toHaveLength(1);
  });

  it("renders nothing without a target", async () => {
    await mountWith(ConfirmStaffActiveDialog, { target: null });
    expect(document.body.textContent).not.toContain("administrador");
  });
});
