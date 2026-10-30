// @vitest-environment jsdom
//
// sdd/egresar-boton-corte-ciclo: holders of a scholarship profile cannot have
// their user_type changed from the edit dialog (the API answers 422
// USER_TYPE_LOCKED); the select is read-only with a persistent hint.

import { afterEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createVuetify } from "vuetify";
import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";
import type { User } from "@/interfaces/user";

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

const LOCK_MESSAGE = "Para egresar a un becario usa la situación Egresado en su refrendo.";

const vuetify = createVuetify();

let wrapper: ReturnType<typeof mount> | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

const baseUser: User = {
  id: 1,
  enrollment: "ABC123456",
  first_name: "Ana",
  last_name: "Pérez",
  email: "ana@example.com",
  email_verified_at: null,
  phone: "5512345678",
  workstation: null,
  user_type: "BEC_ACTIVE",
  campus: "CDMX",
  generation_id: 1,
  active: true,
  created_at: null,
  updated_at: "2026-01-01",
};

const mountDialog = async (editItem: User) => {
  wrapper = mount(UserUpdateDialog, {
    props: { modelValue: false, editItem },
    global: { plugins: [vuetify] },
    attachTo: document.body,
  });
  await wrapper.setProps({ modelValue: true });
  await nextTick();
  await flushPromises();
  return wrapper;
};

const userTypeSelect = (w: ReturnType<typeof mount>) => {
  const select = w
    .findAllComponents({ name: "VSelect" })
    .find((c) => c.props("label") === "Tipo de usuario");
  if (!select) throw new Error("Tipo de usuario select not found");
  return select;
};

describe("UserUpdateDialog — tipo de usuario bloqueado", () => {
  it("makes the select readonly and shows the persistent hint when the user has a scholarship profile", async () => {
    const w = await mountDialog({ ...baseUser, has_scholarship_profile: true });
    const select = userTypeSelect(w);

    expect(select.props("readonly")).toBe(true);
    expect(select.props("hint")).toBe(LOCK_MESSAGE);
    expect(select.props("persistentHint")).toBe(true);
    expect(select.props("modelValue")).toBe("BEC_ACTIVE");
  });

  it.each([[false], [undefined]])(
    "keeps the select editable without hint when has_scholarship_profile is %s",
    async (flag) => {
      const w = await mountDialog({ ...baseUser, has_scholarship_profile: flag });
      const select = userTypeSelect(w);

      expect(select.props("readonly")).toBeFalsy();
      expect(select.props("hint")).toBeFalsy();
    },
  );

  it("still submits the unchanged user_type when locked", async () => {
    const w = await mountDialog({ ...baseUser, has_scholarship_profile: true });
    const saveBtn = w
      .findAllComponents({ name: "VBtn" })
      .find((b) => b.text().includes("Actualizar"));
    if (!saveBtn) throw new Error("Actualizar button not found");
    await saveBtn.trigger("click");
    await flushPromises();

    const submitted = w.emitted("submit");
    expect(submitted).toBeTruthy();
    expect((submitted![0][0] as { user_type: string }).user_type).toBe("BEC_ACTIVE");
  });
});

// sdd/retenciones-pendientes S7 (R7.3): deactivating a becario cancels pending
// withholdings and advance payments, so the dialog asks for confirmation first.
describe("UserUpdateDialog — confirmación de desactivación", () => {
  const CONFIRM_BODY =
    "Al desactivar a este usuario se cancelarán sus retenciones pendientes y sus pagos adelantados.";

  const clickSave = async (w: ReturnType<typeof mount>) => {
    const saveBtn = w
      .findAllComponents({ name: "VBtn" })
      .find((b) => b.text().includes("Actualizar"));
    if (!saveBtn) throw new Error("Actualizar button not found");
    await saveBtn.trigger("click");
    await flushPromises();
  };

  const uncheckActive = async (w: ReturnType<typeof mount>) => {
    const checkbox = w
      .findAllComponents({ name: "VCheckbox" })
      .find((c) => c.props("label") === "¿Permitir acceso a la plataforma?");
    if (!checkbox) throw new Error("active checkbox not found");
    checkbox.vm.$emit("update:modelValue", false);
    await flushPromises();
  };

  const confirmationButton = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>(".v-dialog button")).find((b) =>
      b.textContent?.includes(label),
    );

  it("asks for confirmation and submits only after confirming", async () => {
    const w = await mountDialog({ ...baseUser, has_scholarship_profile: true });
    await uncheckActive(w);
    await clickSave(w);

    expect(document.body.textContent).toContain(CONFIRM_BODY);
    expect(w.emitted("submit")).toBeFalsy();

    confirmationButton("Confirmar")!.click();
    await flushPromises();

    const submitted = w.emitted("submit");
    expect(submitted).toBeTruthy();
    expect((submitted![0][0] as { active: boolean }).active).toBe(false);
  });

  it("does not submit when the confirmation is cancelled", async () => {
    const w = await mountDialog({ ...baseUser, has_scholarship_profile: true });
    await uncheckActive(w);
    await clickSave(w);

    const cancelButtons = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>(".v-dialog button"),
    ).filter((b) => b.textContent?.includes("Cancelar"));
    cancelButtons[cancelButtons.length - 1].click();
    await flushPromises();

    expect(w.emitted("submit")).toBeFalsy();
  });

  it("submits directly when the user stays active", async () => {
    const w = await mountDialog({ ...baseUser, has_scholarship_profile: true });
    await clickSave(w);

    expect(document.body.textContent).not.toContain(CONFIRM_BODY);
    expect(w.emitted("submit")).toBeTruthy();
  });

  it("submits directly when deactivating a non-becario", async () => {
    const w = await mountDialog({ ...baseUser, user_type: "ADMIN", has_scholarship_profile: false });
    await uncheckActive(w);
    await clickSave(w);

    expect(document.body.textContent).not.toContain(CONFIRM_BODY);
    expect(w.emitted("submit")).toBeTruthy();
  });
});
