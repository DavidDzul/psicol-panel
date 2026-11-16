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
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert: vi.fn() }) }));

import { useStaffRolesPage } from "@/composables/useStaffRolesPage";

const modules = [
  {
    module: "Becas",
    permissions: [
      { id: 1, name: "PS_GROUP_BECAS", description: "Menú Becas", kind: "menu-group", menu_group: null },
      { id: 2, name: "PS_VIEW_BECAS", description: "Ver becas", kind: "page", menu_group: "PS_GROUP_BECAS" },
      { id: 3, name: "PS_EDIT_BECAS", description: "Editar becas", kind: "action", menu_group: null },
    ],
  },
];
const role = { id: 7, name: "ADMIN_X", type: "ADMIN" as const, permissions_ids: [1, 2, 3], users_count: 4 };
const axiosError = (data: unknown) => ({ isAxiosError: true, response: { status: 422, data } });

beforeEach(() => {
  setActivePinia(createPinia());
  [get, post, put].forEach((m) => m.mockReset());
  vi.spyOn(console, "error").mockImplementation(() => {});
  get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith("/permissions") ? { res: true, modules } : { res: true, roles: [role] },
    }),
  );
});

const loaded = async () => {
  const page = useStaffRolesPage();
  await page.load();
  return page;
};

describe("useStaffRolesPage", () => {
  it("loads roles and catalog and flags a failed load", async () => {
    const page = await loaded();
    expect(page.roles.value).toEqual([role]);
    expect(page.catalog.value).toEqual(modules);
    expect(page.loadFailed.value).toBe(false);

    get.mockRejectedValue(new Error("x"));
    await page.load();
    expect(page.loadFailed.value).toBe(true);
  });

  it("createRole closes dialog on success", async () => {
    post.mockResolvedValue({ data: { res: true, role: { ...role, id: 9, name: "NUEVO" } } });
    const page = await loaded();
    page.createDialog.value = true;
    expect(await page.createRole("NUEVO")).toBe(true);
    expect(post).toHaveBeenCalledWith("api/admin/staff-roles", { name: "NUEVO" }, expect.anything());
    expect(page.createDialog.value).toBe(false);
    expect(page.createError.value).toBeNull();
  });

  it("createRole exposes the server 422 message and keeps the dialog open", async () => {
    post.mockRejectedValue(
      axiosError({ message: "invalid", errors: { name: ["Ya existe un rol con ese nombre."] } }),
    );
    const page = await loaded();
    page.createDialog.value = true;
    expect(await page.createRole("ADMIN_X")).toBe(false);
    expect(page.createError.value).toBe("Ya existe un rol con ese nombre.");
    expect(page.createDialog.value).toBe(true);
  });

  it("saves directly when no menu or page permission is removed", async () => {
    put.mockResolvedValue({ data: { res: true, role: { ...role, permissions_ids: [1, 2] } } });
    const page = await loaded();
    page.openEdit(role);
    page.draftIds.value = [1, 2];
    await page.requestSave();
    expect(page.confirmOpen.value).toBe(false);
    expect(put).toHaveBeenCalledWith(
      "api/admin/staff-roles/7/permissions",
      { permissions_ids: [1, 2] },
      expect.anything(),
    );
    expect(page.editDialog.value).toBe(false);
    expect(page.savedNotice.value).toBe(true);
  });

  it("asks for confirmation when pages are removed and saves only after confirming", async () => {
    put.mockResolvedValue({ data: { res: true, role: { ...role, permissions_ids: [1, 3] } } });
    const page = await loaded();
    page.openEdit(role);
    page.draftIds.value = [1, 3];
    await page.requestSave();
    expect(page.confirmOpen.value).toBe(true);
    expect(put).not.toHaveBeenCalled();
    expect(page.lockout.value.removedMenus.map((p) => p.name)).toEqual(["PS_VIEW_BECAS"]);

    await page.confirmSave();
    expect(put).toHaveBeenCalledTimes(1);
    expect(page.confirmOpen.value).toBe(false);
  });

  it("cancelling the confirmation keeps the draft and sends nothing", async () => {
    const page = await loaded();
    page.openEdit(role);
    page.draftIds.value = [3];
    await page.requestSave();
    page.cancelConfirm();
    expect(page.confirmOpen.value).toBe(false);
    expect(page.draftIds.value).toEqual([3]);
    expect(page.editDialog.value).toBe(true);
    expect(put).not.toHaveBeenCalled();
  });

  it("shows the server error when saving fails", async () => {
    put.mockRejectedValue(
      axiosError({ message: "m", errors: { permissions_ids: ["Permiso no válido."] } }),
    );
    const page = await loaded();
    page.openEdit(role);
    page.draftIds.value = [1, 2];
    await page.requestSave();
    expect(page.saveError.value).toBe("Permiso no válido.");
    expect(page.editDialog.value).toBe(true);
    expect(page.confirmOpen.value).toBe(false);
  });
});
