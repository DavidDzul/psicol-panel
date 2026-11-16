import type { StaffPermission } from "@/interfaces/staff";

export interface StaffPermissionChanges {
  /** Removed menu-group/page permissions: users may lose access to screens. */
  removedMenus: StaffPermission[];
  /** Removed action permissions: users keep the screen but lose a button. */
  removedActions: StaffPermission[];
  /** Selected pages whose menu group is not selected (they would be unreachable from the menu). */
  orphanedPages: StaffPermission[];
}

export const staffPermissionChanges = (
  previousIds: readonly number[],
  nextIds: readonly number[],
  catalog: readonly StaffPermission[],
): StaffPermissionChanges => {
  const next = new Set(nextIds);
  const previous = new Set(previousIds);
  const selected = catalog.filter((p) => next.has(p.id));
  const selectedNames = new Set(selected.map((p) => p.name));

  const removed = catalog.filter((p) => previous.has(p.id) && !next.has(p.id));

  return {
    removedMenus: removed.filter((p) => p.kind !== "action"),
    removedActions: removed.filter((p) => p.kind === "action"),
    orphanedPages: selected.filter(
      (p) => p.kind === "page" && p.menu_group !== null && !selectedNames.has(p.menu_group),
    ),
  };
};
