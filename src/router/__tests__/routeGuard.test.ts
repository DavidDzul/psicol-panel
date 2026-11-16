// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const get = vi.fn();
vi.mock("@/axiosConfig", () => ({
  default: {
    get: (...a: unknown[]) => get(...a),
    defaults: { headers: { common: {} } },
  },
}));
vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert: vi.fn() }) }));
vi.mock("@/stores/api/generationStore", () => ({
  useGenerationsStore: () => ({ fetchGenerations: vi.fn() }),
}));
vi.mock("@/stores/api/rolesStore", () => ({
  useRolesStore: () => ({ fetchRoles: vi.fn() }),
}));

// Lazy views are stubbed so an allowed navigation does not load Vuetify layouts.
const stub = { default: { render: () => null } };
vi.mock("@/layouts/AdminLayout.vue", () => stub);
vi.mock("@/layouts/AuthLayout.vue", () => stub);
vi.mock("@/views/auth/LoginView.vue", () => stub);
vi.mock("@/views/HomeView.vue", () => stub);
vi.mock("@/views/NotFound.vue", () => stub);
vi.mock("@/views/roles/RolesView.vue", () => stub);
vi.mock("@/views/administrators/StaffAdministratorsView.vue", () => stub);
vi.mock("@/views/users/BusinessDetailsView.vue", () => stub);
vi.mock("@/views/classes/ClassDetailsView.vue", () => stub);

import router from "@/router";
import { useAuthStore } from "@/stores/api/authStore";
import navMenuSource from "@/layouts/NavMenu.vue?raw";

const profile = (roleName: string) => ({
  id: 1,
  first_name: "A",
  last_name: "B",
  email: "a@b.c",
  campus: "MERIDA",
  roles: [{ name: roleName }],
});

/** Backend answers for a user holding `roleName` and `permissions`. */
const mockApi = (roleName: string, permissions: string[]) => {
  get.mockImplementation(async (url: string) => {
    if (url === "api/admin/admin") return { data: profile(roleName) };
    if (url === "/api/admin/permissions") return { data: { permissions } };
    return { data: {} };
  });
};

/** A session that is already fully loaded (login flow). */
const loggedIn = async (roleName: string, permissions: string[]) => {
  mockApi(roleName, permissions);
  localStorage.setItem("token", "t");
  const store = useAuthStore();
  store.loggedUser = true;
  store.userProfile = profile(roleName) as never;
  await store.getPermissions("t");
};

const visit = async (path: string): Promise<string> => {
  await router.push(path);
  return router.currentRoute.value.fullPath;
};

beforeEach(async () => {
  setActivePinia(createPinia());
  get.mockReset();
  localStorage.clear();
  await router.replace("/404");
});

describe("route permission guard", () => {
  it("redirects /roles to the index when the user lacks PS_ROLES", async () => {
    await loggedIn("ADMIN_JOB", ["PS_VACANT"]);

    expect(await visit("/roles")).toBe("/");
  });

  it("opens /roles when the user holds PS_ROLES", async () => {
    await loggedIn("ROOT_JOB", ["PS_ROLES"]);

    expect(await visit("/roles")).toBe("/roles");
  });

  it("lets ROOT open any guarded route even without the permission", async () => {
    await loggedIn("ROOT", []);

    expect(await visit("/roles")).toBe("/roles");
    expect(await visit("/empresas/5")).toBe("/empresas/5");
  });

  describe("/administradores", () => {
    it("redirects a non-ROOT user without PS_MANAGE_ADMINS", async () => {
      await loggedIn("ROOT_JOB", ["PS_ROLES"]);
      expect(await visit("/administradores")).toBe("/");
    });

    it("opens for ROOT even without the permission row", async () => {
      await loggedIn("ROOT", []);
      expect(await visit("/administradores")).toBe("/administradores");
    });

    it("opens for a user holding PS_MANAGE_ADMINS", async () => {
      await loggedIn("ROOT_JOB", ["PS_MANAGE_ADMINS"]);
      expect(await visit("/administradores")).toBe("/administradores");
    });
  });

  it.each([
    ["/empresas/5", "PS_BUSINESS"],
    ["/clases/3", "PS_CLASSES"],
  ])("detail route %s inherits the list permission %s", async (path, key) => {
    await loggedIn("ADMIN_JOB", ["PS_ROLES"]);
    expect(await visit(path)).toBe("/");

    await router.replace("/404");
    setActivePinia(createPinia());
    await loggedIn("ADMIN_JOB", [key]);
    expect(await visit(path)).toBe(path);
  });

  it("waits for profile and permissions on a reload instead of redirecting a valid user", async () => {
    mockApi("ROOT_JOB", ["PS_ROLES"]);
    localStorage.setItem("token", "t");

    expect(await visit("/roles")).toBe("/roles");
    expect(useAuthStore().permissions).toEqual(["PS_ROLES"]);
  });

  it("redirects after the async load when the reloaded user lacks the permission", async () => {
    mockApi("ADMIN_JOB", ["PS_VACANT"]);
    localStorage.setItem("token", "t");

    expect(await visit("/roles")).toBe("/");
  });

  it("loads permissions when the profile is known but permissions are not (profile-only entry)", async () => {
    mockApi("ROOT_JOB", ["PS_ROLES"]);
    localStorage.setItem("token", "t");
    const store = useAuthStore();
    store.loggedUser = true;
    store.userProfile = profile("ROOT_JOB") as never;

    expect(await visit("/roles")).toBe("/roles");
  });

  it("keeps the auth guard: no token goes to the login with the redirect query", async () => {
    expect(await visit("/roles")).toBe("/auth/login?redirect=/roles");
  });

  it("does not guard the index", async () => {
    await loggedIn("ATTENDANCE", []);

    expect(await visit("/")).toBe("/");
  });
});

describe("route permissions match the NavMenu keys", () => {
  const menuLines = navMenuSource
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const pairs = [
    ...menuLines.matchAll(/link:\s*"([^"]+)",\s*key:\s*"(PS_[A-Z_]+)"/g),
  ].map((m) => [m[1], m[2]] as const);

  it("finds the menu entries", () => {
    expect(pairs.length).toBeGreaterThanOrEqual(12);
  });

  it.each(pairs)("%s requires %s", (link, key) => {
    const record = router.getRoutes().find((r) => r.path === link);

    expect(record?.meta.permission).toBe(key);
  });
});
