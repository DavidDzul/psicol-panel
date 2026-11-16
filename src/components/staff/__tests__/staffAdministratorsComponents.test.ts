// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VBtn, VSelect, VTextField } from "vuetify/components";
import StaffAdministratorsTable from "@/components/staff/StaffAdministratorsTable.vue";
import CreateStaffAdministratorDialog from "@/components/staff/CreateStaffAdministratorDialog.vue";
import StaffCredentialsDialog from "@/components/staff/StaffCredentialsDialog.vue";
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

const person = (overrides: Partial<StaffAdministrator>): StaffAdministrator => ({
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

describe("StaffAdministratorsTable", () => {
  const render = async (administrators: StaffAdministrator[]) => {
    wrapper = mount(StaffAdministratorsTable, {
      props: { administrators },
      slots: { actions: '<span class="row-action">acciones</span>' },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
  };

  it("shows name, email, campus text, role and active state", async () => {
    await render([person({})]);
    const text = wrapper!.text();
    expect(text).toContain("Ana Lopez");
    expect(text).toContain("ana@example.com");
    expect(text).toContain("Mérida");
    expect(text).toContain("ADMIN_X");
    expect(text).toContain("Activo");
    expect(text).not.toContain("obsoleto");
  });

  it("renders the actions slot only for editable rows and marks the rest read-only", async () => {
    await render([
      person({ id: 1 }),
      person({ id: 2, email: "root@example.com", is_root: true, is_editable: false }),
    ]);
    expect(wrapper!.findAll(".row-action")).toHaveLength(1);
    expect(wrapper!.text()).toContain("Solo lectura");
  });

  it("flags an obsolete (YUCATAN) role with an obsoleto badge", async () => {
    await render([person({ role: { id: 4, name: "YUCATAN", is_obsolete: true } })]);
    expect(wrapper!.text()).toContain("YUCATAN");
    expect(wrapper!.text()).toContain("obsoleto");
  });

  it("shows inactive accounts and the no-role note", async () => {
    await render([person({ active: false, role: null })]);
    expect(wrapper!.text()).toContain("Inactivo");
    expect(wrapper!.text()).toContain("Sin rol");
    expect(wrapper!.text()).toContain("Accesos");
  });

  it("emits create from the toolbar button", async () => {
    await render([]);
    await clickButton("Nuevo administrador");
    expect(wrapper!.emitted("create")).toHaveLength(1);
  });
});

describe("CreateStaffAdministratorDialog", () => {
  const roles: StaffRole[] = [
    { id: 3, name: "ADMIN_X", type: "ADMIN", permissions_ids: [], users_count: 0 },
  ];

  const open = async (props: Record<string, unknown> = {}) => {
    wrapper = mount(CreateStaffAdministratorDialog, {
      props: { modelValue: false, roles, ...props },
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();
  };

  const fill = async (password: string, confirmation: string): Promise<void> => {
    field("Nombre(s)").vm.$emit("update:modelValue", "Ana");
    field("Apellidos").vm.$emit("update:modelValue", "Lopez");
    field("Correo electrónico").vm.$emit("update:modelValue", "ana@example.com");
    field("Contraseña").vm.$emit("update:modelValue", password);
    field("Confirmar contraseña").vm.$emit("update:modelValue", confirmation);
    const [campus, role] = wrapper!.findAllComponents(VSelect);
    campus.vm.$emit("update:modelValue", "MERIDA");
    role.vm.$emit("update:modelValue", 3);
    await wrapper!.vm.$nextTick();
  };

  it("emits the payload for a one-character password (no min length)", async () => {
    await open();
    await fill("x", "x");
    await clickButton("Crear");
    expect(wrapper!.emitted("submit")?.[0]).toEqual([
      {
        first_name: "Ana",
        last_name: "Lopez",
        email: "ana@example.com",
        campus: "MERIDA",
        role_id: 3,
        password: "x",
        password_confirmation: "x",
      },
    ]);
  });

  it("blocks submit when the confirmation does not match", async () => {
    await open();
    await fill("secreta", "otra");
    await clickButton("Crear");
    expect(wrapper!.emitted("submit")).toBeUndefined();
    expect(document.body.textContent).toContain("Las contraseñas no coinciden.");
  });

  it("blocks submit and shows required errors on an empty form", async () => {
    await open();
    await clickButton("Crear");
    expect(wrapper!.emitted("submit")).toBeUndefined();
    expect(document.body.textContent).toContain("Campo requerido");
  });

  it("shows the server error message", async () => {
    await open({ serverError: "El correo ya está registrado." });
    expect(document.body.textContent).toContain("El correo ya está registrado.");
  });

  it("resets the form (including passwords) when reopened", async () => {
    await open();
    await fill("secreta", "secreta");
    await wrapper!.setProps({ modelValue: false });
    await wrapper!.setProps({ modelValue: true });
    await wrapper!.vm.$nextTick();
    expect(field("Contraseña").props("modelValue")).toBe("");
    expect(field("Confirmar contraseña").props("modelValue")).toBe("");
  });
});

describe("StaffCredentialsDialog", () => {
  const credentials = { email: "ana@example.com", password: "secreta" };

  const open = async (props: { credentials: typeof credentials | null } = { credentials }) => {
    wrapper = mount(StaffCredentialsDialog, {
      props,
      global: { plugins: [vuetify] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
  };

  it("shows email, password and the shown-once warning", async () => {
    await open();
    const text = document.body.textContent ?? "";
    expect(text).toContain("ana@example.com");
    expect(text).toContain("secreta");
    expect(text).toContain("no se volverá a mostrar");
  });

  it("copies email and password to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await open();
    await clickButton("Copiar");
    expect(writeText).toHaveBeenCalledWith("Correo: ana@example.com\nContraseña: secreta");
    expect(document.body.textContent).toContain("Copiado al portapapeles.");
  });

  it("emits close, and renders nothing once the credentials are cleared", async () => {
    await open();
    await clickButton("Cerrar");
    expect(wrapper!.emitted("close")).toHaveLength(1);

    await wrapper!.setProps({ credentials: null });
    await wrapper!.vm.$nextTick();
    expect(document.body.textContent).not.toContain("secreta");
  });
});
