import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
vi.mock("@/axiosConfig", () => ({
  default: {
    get: (...a: unknown[]) => get(...a),
    post: (...a: unknown[]) => post(...a),
    put: (...a: unknown[]) => put(...a),
  },
}));
const showAlert = vi.fn();
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert }) }));

import { useStaffRolesStore } from "@/stores/api/staffRolesStore";

const role = { id: 3, name: "ADMIN_X", type: "ADMIN", permissions_ids: [1], users_count: 2 };
const axiosError = (data: unknown) => ({ isAxiosError: true, response: { status: 422, data } });

beforeEach(() => {
  setActivePinia(createPinia());
  [get, post, put, showAlert].forEach((m) => m.mockReset());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("staffRolesStore reads", () => {
  it("fetchRoles loads roles from api/admin/staff-roles", async () => {
    get.mockResolvedValue({ data: { res: true, roles: [role] } });
    const store = useStaffRolesStore();
    expect(await store.fetchRoles()).toBe(true);
    expect(get.mock.calls[0][0]).toBe("api/admin/staff-roles");
    expect(store.roles).toEqual([role]);
  });

  it("fetchCatalog keeps module grouping", async () => {
    const modules = [{ module: "Usuarios", permissions: [] }];
    get.mockResolvedValue({ data: { res: true, modules } });
    const store = useStaffRolesStore();
    expect(await store.fetchCatalog()).toBe(true);
    expect(get.mock.calls[0][0]).toBe("api/admin/staff-roles/permissions");
    expect(store.catalog).toEqual(modules);
  });

  it("reads return false instead of throwing", async () => {
    get.mockRejectedValue(new Error("boom"));
    const store = useStaffRolesStore();
    expect(await store.fetchRoles()).toBe(false);
    expect(await store.fetchCatalog()).toBe(false);
  });
});

describe("staffRolesStore writes", () => {
  it("createRole posts the name and adds the role", async () => {
    post.mockResolvedValue({ data: { res: true, role } });
    const store = useStaffRolesStore();
    await store.createRole({ name: "ADMIN_X" });
    expect(post.mock.calls[0][0]).toBe("api/admin/staff-roles");
    expect(post.mock.calls[0][1]).toEqual({ name: "ADMIN_X" });
    expect(store.roles).toEqual([role]);
  });

  it("updateRolePermissions puts permissions_ids and replaces the role", async () => {
    get.mockResolvedValue({ data: { res: true, roles: [role] } });
    const store = useStaffRolesStore();
    await store.fetchRoles();
    const updated = { ...role, permissions_ids: [1, 2] };
    put.mockResolvedValue({ data: { res: true, role: updated } });
    await store.updateRolePermissions(3, [1, 2]);
    expect(put.mock.calls[0][0]).toBe("api/admin/staff-roles/3/permissions");
    expect(put.mock.calls[0][1]).toEqual({ permissions_ids: [1, 2] });
    expect(store.roles).toEqual([updated]);
  });

  it("writes throw and alert with the Laravel field error", async () => {
    post.mockRejectedValue(axiosError({ message: "The given data was invalid.", errors: { name: ["El nombre ya existe."] } }));
    const store = useStaffRolesStore();
    await expect(store.createRole({ name: "X" })).rejects.toBeTruthy();
    expect(showAlert).toHaveBeenCalledWith({ title: "El nombre ya existe.", status: "error" });
  });
});
