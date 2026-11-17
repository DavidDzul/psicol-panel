import { describe, expect, it } from "vitest";
import { canSeeEntry, visibleNavItems, type NavItem } from "@/utils/navVisibility";

const items: NavItem[] = [
  { text: "Inicio", link: "/", group: false },
  {
    text: "Usuarios",
    group: true,
    key: "PS_GROUP_USERS",
    links: [{ text: "Becarios", link: "/becarios", key: "PS_USERS" }],
  },
  {
    text: "Asistencias",
    group: true,
    key: "PS_GROUP_ATTENDANCE",
    links: [
      { text: "Checador", link: "/checador", key: "PS_CHECK" },
      { text: "Avisos", link: "/avisos", key: "PS_NOTICES" },
    ],
  },
  {
    text: "Vinculación laboral",
    group: true,
    key: "PS_GROUP_JOBS",
    links: [
      { text: "Vacantes", link: "/vacantes", key: "PS_VACANT" },
      { text: "Roles", link: "/roles", key: "PS_ROLES" },
      { text: "Áreas e informes", link: "/datos", key: "PS_GRAPHICS" },
    ],
  },
  {
    text: "Configuración",
    group: true,
    key: "PS_GROUP_CONFIG",
    links: [
      { text: "Generaciones", link: "/generaciones", key: "PS_GENERATIONS" },
      { text: "Administradores", link: "/administradores", key: "PS_MANAGE_ADMINS" },
    ],
  },
];

const names = (list: NavItem[]) => list.map((i) => i.text);
const childNames = (list: NavItem[], text: string) =>
  (list.find((i) => i.text === text)?.links ?? []).map((l) => l.text);

describe("canSeeEntry", () => {
  it("lets ROOT see everything and requires the permission otherwise", () => {
    expect(canSeeEntry("PS_MANAGE_ADMINS", [], true)).toBe(true);
    expect(canSeeEntry("PS_MANAGE_ADMINS", ["PS_MANAGE_ADMINS"], false)).toBe(true);
    expect(canSeeEntry("PS_MANAGE_ADMINS", ["PS_ROLES"], false)).toBe(false);
    expect(canSeeEntry(undefined, [], false)).toBe(true);
  });
});

describe("visibleNavItems", () => {
  it("shows every entry to ROOT without any permission rows", () => {
    const result = visibleNavItems(items, [], true);
    expect(names(result)).toEqual([
      "Inicio",
      "Usuarios",
      "Asistencias",
      "Vinculación laboral",
      "Configuración",
    ]);
    expect(childNames(result, "Vinculación laboral")).toEqual([
      "Vacantes",
      "Roles",
      "Áreas e informes",
    ]);
    expect(childNames(result, "Asistencias")).toEqual(["Checador", "Avisos"]);
    expect(childNames(result, "Configuración")).toEqual(["Generaciones", "Administradores"]);
  });

  it("shows Administradores to a non-ROOT user holding the permission", () => {
    const result = visibleNavItems(items, ["PS_GROUP_CONFIG", "PS_MANAGE_ADMINS"], false);
    expect(childNames(result, "Configuración")).toEqual(["Administradores"]);
  });

  it("hides Administradores from a non-ROOT user without it", () => {
    const result = visibleNavItems(items, ["PS_GROUP_CONFIG", "PS_GENERATIONS"], false);
    expect(childNames(result, "Configuración")).toEqual(["Generaciones"]);
  });

  it("shows Roles under Vinculación laboral to a role without the Configuración group", () => {
    const result = visibleNavItems(items, ["PS_GROUP_JOBS", "PS_ROLES"], false);
    expect(names(result)).toEqual(["Inicio", "Vinculación laboral"]);
    expect(childNames(result, "Vinculación laboral")).toEqual(["Roles"]);
  });

  it("shows Avisos under Asistencias and Áreas e informes under Vinculación laboral", () => {
    const result = visibleNavItems(
      items,
      ["PS_GROUP_ATTENDANCE", "PS_NOTICES", "PS_GROUP_JOBS", "PS_GRAPHICS"],
      false,
    );
    expect(childNames(result, "Asistencias")).toEqual(["Avisos"]);
    expect(childNames(result, "Vinculación laboral")).toEqual(["Áreas e informes"]);
  });

  it("hides a group when none of its children is visible", () => {
    const result = visibleNavItems(items, ["PS_GROUP_CONFIG"], false);
    expect(names(result)).toEqual(["Inicio"]);
  });

  it("requires the group key as well as a visible child", () => {
    const result = visibleNavItems(items, ["PS_USERS"], false);
    expect(names(result)).toEqual(["Inicio"]);
  });
});
