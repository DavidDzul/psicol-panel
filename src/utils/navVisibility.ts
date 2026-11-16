export interface NavItem {
  text: string;
  icon?: string;
  link?: string;
  key?: string;
  group?: boolean;
  links?: NavItem[];
}

/** ROOT sees every entry regardless of DB permission rows (same rule as the router guard). */
export const canSeeEntry = (
  key: string | undefined,
  permissions: readonly string[],
  isRoot: boolean,
): boolean => !key || isRoot || permissions.includes(key);

export const visibleNavItems = (
  items: readonly NavItem[],
  permissions: readonly string[],
  isRoot: boolean,
): NavItem[] =>
  items.flatMap((item): NavItem[] => {
    if (!canSeeEntry(item.key, permissions, isRoot)) return [];
    if (!item.group) return [item];
    const links = (item.links ?? []).filter((l) => canSeeEntry(l.key, permissions, isRoot));
    return links.length ? [{ ...item, links }] : [];
  });
