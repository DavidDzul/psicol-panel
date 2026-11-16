import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/axiosConfig", () => ({ default: { get, post } }));
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert: vi.fn() }) }));

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
  [get, post].forEach((m) => m.mockReset());
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
