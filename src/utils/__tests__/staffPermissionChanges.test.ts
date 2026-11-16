import { describe, expect, it } from "vitest";
import { staffPermissionChanges } from "@/utils/staffPermissionChanges";
import type { StaffPermission } from "@/interfaces/staff";

const catalog: StaffPermission[] = [
  { id: 1, name: "PS_GROUP_USERS", description: "Menú Usuarios", kind: "menu-group", menu_group: null },
  { id: 2, name: "PS_USERS", description: "Becarios", kind: "page", menu_group: "PS_GROUP_USERS" },
  { id: 3, name: "PS_USERS_EXPORT", description: "Exportar", kind: "action", menu_group: "PS_GROUP_USERS" },
  { id: 4, name: "PS_CLASSES", description: "Clases", kind: "page", menu_group: "PS_GROUP_ATTENDANCE" },
];

describe("staffPermissionChanges", () => {
  it("returns empty sets when nothing is removed or only additions happen", () => {
    const none = { removedMenus: [], removedActions: [], orphanedPages: [] };
    expect(staffPermissionChanges([1, 2], [1, 2], catalog)).toEqual(none);
    expect(staffPermissionChanges([1], [1, 2, 3], catalog)).toEqual(none);
  });

  it("separates removed menu-group/page (lockout) from removed actions", () => {
    const result = staffPermissionChanges([1, 2, 3], [], catalog);
    expect(result.removedMenus.map((p) => p.name)).toEqual(["PS_GROUP_USERS", "PS_USERS"]);
    expect(result.removedActions.map((p) => p.name)).toEqual(["PS_USERS_EXPORT"]);
  });

  it("flags selected pages whose menu group is not selected", () => {
    const result = staffPermissionChanges([4], [2, 4], catalog);
    expect(result.orphanedPages.map((p) => p.name)).toEqual(["PS_USERS", "PS_CLASSES"]);
  });

  it("ignores ids that are not in the catalog", () => {
    expect(staffPermissionChanges([999], [], catalog).removedMenus).toEqual([]);
  });
});
