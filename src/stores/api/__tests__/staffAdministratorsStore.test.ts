import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const patch = vi.fn();
vi.mock("@/axiosConfig", () => ({
  default: {
    get: (...a: unknown[]) => get(...a),
    post: (...a: unknown[]) => post(...a),
    put: (...a: unknown[]) => put(...a),
    patch: (...a: unknown[]) => patch(...a),
  },
}));
const showAlert = vi.fn();
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert }) }));

import { useStaffAdministratorsStore } from "@/stores/api/staffAdministratorsStore";

const admin = {
  id: 7, first_name: "Ana", last_name: "Lopez", email: "a@b.c", campus: "MERIDA", active: true,
  role: { id: 3, name: "ADMIN_X", is_obsolete: false }, is_root: false, is_editable: true,
};
const axiosError = (data: unknown) => ({ isAxiosError: true, response: { status: 422, data } });

beforeEach(() => {
  setActivePinia(createPinia());
  [get, post, put, patch, showAlert].forEach((m) => m.mockReset());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("staffAdministratorsStore reads", () => {
  it("fetchAdministrators loads the list", async () => {
    get.mockResolvedValue({ data: { res: true, administrators: [admin] } });
    const store = useStaffAdministratorsStore();
    expect(await store.fetchAdministrators()).toBe(true);
    expect(get.mock.calls[0][0]).toBe("api/admin/staff-administrators");
    expect(store.administrators).toEqual([admin]);
  });

  it("fetchAdministrator returns the detail or null on failure", async () => {
    get.mockResolvedValueOnce({ data: { res: true, administrator: admin } });
    const store = useStaffAdministratorsStore();
    expect(await store.fetchAdministrator(7)).toEqual(admin);
    expect(get.mock.calls[0][0]).toBe("api/admin/staff-administrators/7");
    get.mockRejectedValueOnce(new Error("404"));
    expect(await store.fetchAdministrator(8)).toBeNull();
  });

  it("list read returns false on failure", async () => {
    get.mockRejectedValue(new Error("boom"));
    expect(await useStaffAdministratorsStore().fetchAdministrators()).toBe(false);
  });
});

describe("staffAdministratorsStore writes", () => {
  const payload = {
    first_name: "Ana", last_name: "Lopez", email: "a@b.c", campus: "MERIDA", role_id: 3,
    password: "secret123", password_confirmation: "secret123",
  };

  it("createAdministrator posts the payload and returns the new administrator", async () => {
    post.mockResolvedValue({ data: { res: true, administrator: admin } });
    const store = useStaffAdministratorsStore();
    expect(await store.createAdministrator(payload)).toEqual(admin);
    expect(post.mock.calls[0][0]).toBe("api/admin/staff-administrators");
    expect(post.mock.calls[0][1]).toEqual(payload);
    expect(store.administrators).toEqual([admin]);
  });

  it("updateRole, setActive and resetPassword hit their endpoints", async () => {
    const store = useStaffAdministratorsStore();
    put.mockResolvedValueOnce({ data: { res: true, administrator: admin } });
    await store.updateRole(7, 4);
    expect(put.mock.calls[0][0]).toBe("api/admin/staff-administrators/7/role");
    expect(put.mock.calls[0][1]).toEqual({ role_id: 4 });

    patch.mockResolvedValueOnce({ data: { res: true, administrator: { ...admin, active: false } } });
    const updated = await store.setActive(7, false);
    expect(patch.mock.calls[0][0]).toBe("api/admin/staff-administrators/7/active");
    expect(patch.mock.calls[0][1]).toEqual({ active: false });
    expect(updated.active).toBe(false);

    put.mockResolvedValueOnce({ data: { res: true, msg: "ok" } });
    await store.resetPassword(7, { password: "newsecret1", password_confirmation: "newsecret1" });
    expect(put.mock.calls[1][0]).toBe("api/admin/staff-administrators/7/password");
    expect(put.mock.calls[1][1]).toEqual({ password: "newsecret1", password_confirmation: "newsecret1" });
  });

  it("does not keep the password anywhere in store state", async () => {
    post.mockResolvedValue({ data: { res: true, administrator: admin } });
    const store = useStaffAdministratorsStore();
    await store.createAdministrator(payload);
    expect(JSON.stringify(store.$state)).not.toContain("secret123");
  });

  it("writes throw and alert with the Laravel field error", async () => {
    post.mockRejectedValue(axiosError({ message: "The given data was invalid.", errors: { email: ["El correo ya está registrado."] } }));
    await expect(useStaffAdministratorsStore().createAdministrator(payload)).rejects.toBeTruthy();
    expect(showAlert).toHaveBeenCalledWith({ title: "El correo ya está registrado.", status: "error" });
  });

  it("surfaces the message of a 403", async () => {
    patch.mockRejectedValue(axiosError({ message: "Las cuentas ROOT no se pueden modificar." }));
    await expect(useStaffAdministratorsStore().setActive(1, false)).rejects.toBeTruthy();
    expect(showAlert).toHaveBeenCalledWith({ title: "Las cuentas ROOT no se pueden modificar.", status: "error" });
  });
});
