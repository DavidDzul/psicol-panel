import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const { get, post, put, patch, showAlert } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  showAlert: vi.fn(),
}));
vi.mock("@/axiosConfig", () => ({ default: { get, post, put, patch } }));
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert }) }));

import { useStaffAdministratorsPage } from "@/composables/useStaffAdministratorsPage";
import { useStaffAdministratorsStore } from "@/stores/api/staffAdministratorsStore";
import type { CreateStaffAdministratorPayload } from "@/interfaces/staff";

const role = (id: number, name: string) => ({
  id,
  name,
  type: "ADMIN" as const,
  permissions_ids: [],
  users_count: 0,
});
const admin = {
  id: 9,
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.com",
  campus: "MERIDA",
  active: true,
  role: { id: 3, name: "ADMIN_X", is_obsolete: false },
  is_root: false,
  is_editable: true,
};
const payload: CreateStaffAdministratorPayload = {
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.com",
  campus: "MERIDA",
  role_id: 3,
  password: "secreta",
  password_confirmation: "secreta",
};

beforeEach(() => {
  setActivePinia(createPinia());
  [get, post, put, patch, showAlert].forEach((m) => m.mockReset());
  vi.spyOn(console, "error").mockImplementation(() => {});
  get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith("staff-roles")
        ? { res: true, roles: [role(3, "ADMIN_X"), role(4, "YUCATAN"), role(1, "ROOT")] }
        : { res: true, administrators: [admin] },
    }),
  );
});

describe("useStaffAdministratorsPage", () => {
  it("loads administrators and roles, and only offers assignable roles", async () => {
    const page = useStaffAdministratorsPage();
    await page.load();

    expect(page.administrators.value).toHaveLength(1);
    expect(page.assignableRoles.value.map((r) => r.name)).toEqual(["ADMIN_X"]);
    expect(page.loadFailed.value).toBe(false);
  });

  it("flags a failed load", async () => {
    get.mockRejectedValue(new Error("boom"));
    const page = useStaffAdministratorsPage();
    await page.load();
    expect(page.loadFailed.value).toBe(true);
  });

  it("keeps the one-time credentials in transient state and clears them on close", async () => {
    post.mockResolvedValue({ data: { res: true, administrator: admin } });
    const page = useStaffAdministratorsPage();

    const ok = await page.createAdministrator(payload);

    expect(ok).toBe(true);
    expect(page.createDialog.value).toBe(false);
    expect(page.credentials.value).toEqual({ email: "ana@example.com", password: "secreta" });

    page.closeCredentials();
    expect(page.credentials.value).toBeNull();
  });

  it("never persists the password in the store", async () => {
    post.mockResolvedValue({ data: { res: true, administrator: admin } });
    const page = useStaffAdministratorsPage();
    await page.createAdministrator(payload);

    expect(JSON.stringify(useStaffAdministratorsStore().$state)).not.toContain("secreta");
  });

  it("shows the server 422 message and keeps the dialog open without credentials", async () => {
    post.mockRejectedValue({
      isAxiosError: true,
      response: { status: 422, data: { errors: { email: ["El correo ya está registrado."] } } },
    });
    const page = useStaffAdministratorsPage();
    page.openCreate();

    const ok = await page.createAdministrator(payload);

    expect(ok).toBe(false);
    expect(page.createError.value).toBe("El correo ya está registrado.");
    expect(page.createDialog.value).toBe(true);
    expect(page.credentials.value).toBeNull();
  });

  it("clears a previous create error when the dialog is reopened", async () => {
    post.mockRejectedValue({ isAxiosError: true, response: { status: 422, data: { msg: "x" } } });
    const page = useStaffAdministratorsPage();
    await page.createAdministrator(payload);
    page.openCreate();
    expect(page.createError.value).toBeNull();
  });
});

describe("useStaffAdministratorsPage - assign role", () => {
  it("updates the row in place, closes the dialog, alerts and refreshes roles", async () => {
    put.mockResolvedValue({
      data: { res: true, administrator: { ...admin, role: { id: 5, name: "OTRO", is_obsolete: false } } },
    });
    const page = useStaffAdministratorsPage();
    await page.load();
    page.openAssign(admin);

    const ok = await page.assignRole(5);

    expect(ok).toBe(true);
    expect(put).toHaveBeenCalledWith(
      "api/admin/staff-administrators/9/role",
      { role_id: 5 },
      expect.anything(),
    );
    expect(page.administrators.value[0].role?.name).toBe("OTRO");
    expect(page.administrators.value).toHaveLength(1);
    expect(page.assignTarget.value).toBeNull();
    expect(showAlert).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
    expect(get).toHaveBeenCalledWith("api/admin/staff-roles", expect.anything());
  });

  it("keeps the dialog open with the server message on error", async () => {
    put.mockRejectedValue({
      isAxiosError: true,
      response: { status: 422, data: { errors: { role_id: ["Rol inválido."] } } },
    });
    const page = useStaffAdministratorsPage();
    page.openAssign(admin);

    const ok = await page.assignRole(5);

    expect(ok).toBe(false);
    expect(page.assignError.value).toBe("Rol inválido.");
    expect(page.assignTarget.value).toEqual(admin);
  });
});

describe("useStaffAdministratorsPage - reset password", () => {
  const reset = { password: "nueva", password_confirmation: "nueva" };

  it("sends the payload, shows the password once and never stores it", async () => {
    put.mockResolvedValue({ data: { res: true, msg: "ok" } });
    const page = useStaffAdministratorsPage();
    page.openReset(admin);

    const ok = await page.resetPassword(reset);

    expect(ok).toBe(true);
    expect(put).toHaveBeenCalledWith(
      "api/admin/staff-administrators/9/password",
      reset,
      expect.anything(),
    );
    expect(page.resetTarget.value).toBeNull();
    expect(page.credentials.value).toEqual({ email: "ana@example.com", password: "nueva" });
    expect(JSON.stringify(useStaffAdministratorsStore().$state)).not.toContain("nueva");

    page.closeCredentials();
    expect(page.credentials.value).toBeNull();
  });

  it("keeps the dialog open and exposes no credentials on error", async () => {
    put.mockRejectedValue({ isAxiosError: true, response: { status: 403, data: { msg: "No permitido." } } });
    const page = useStaffAdministratorsPage();
    page.openReset(admin);

    const ok = await page.resetPassword(reset);

    expect(ok).toBe(false);
    expect(page.resetError.value).toBe("No permitido.");
    expect(page.credentials.value).toBeNull();
    expect(page.resetTarget.value).toEqual(admin);
  });
});

describe("useStaffAdministratorsPage - activate / deactivate", () => {
  it("does nothing until confirmed, then deactivates in place", async () => {
    patch.mockResolvedValue({ data: { res: true, administrator: { ...admin, active: false } } });
    const page = useStaffAdministratorsPage();
    await page.load();
    page.askToggleActive(admin);
    expect(patch).not.toHaveBeenCalled();

    await page.confirmToggleActive();

    expect(patch).toHaveBeenCalledWith(
      "api/admin/staff-administrators/9/active",
      { active: false },
      expect.anything(),
    );
    expect(page.administrators.value[0].active).toBe(false);
    expect(page.activeTarget.value).toBeNull();
    expect(showAlert).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
  });

  it("activates an inactive account", async () => {
    patch.mockResolvedValue({ data: { res: true, administrator: admin } });
    const page = useStaffAdministratorsPage();
    page.askToggleActive({ ...admin, active: false });
    await page.confirmToggleActive();
    expect(patch).toHaveBeenCalledWith(expect.any(String), { active: true }, expect.anything());
  });

  it("cancelling sends nothing; a failure surfaces an error alert and closes", async () => {
    const page = useStaffAdministratorsPage();
    page.askToggleActive(admin);
    page.cancelToggleActive();
    expect(page.activeTarget.value).toBeNull();
    expect(patch).not.toHaveBeenCalled();

    patch.mockRejectedValue({ isAxiosError: true, response: { status: 403, data: { msg: "No." } } });
    page.askToggleActive(admin);
    const ok = await page.confirmToggleActive();
    expect(ok).toBe(false);
    expect(showAlert).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }));
    expect(page.activeTarget.value).toBeNull();
  });
});
