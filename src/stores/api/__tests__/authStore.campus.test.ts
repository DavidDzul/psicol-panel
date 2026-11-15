import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const get = vi.fn();
vi.mock("@/axiosConfig", () => ({
  default: { get: (...a: unknown[]) => get(...a), defaults: { headers: { common: {} } } },
}));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert: vi.fn() }) }));
vi.mock("@/stores/api/generationStore", () => ({
  useGenerationsStore: () => ({ fetchGenerations: vi.fn() }),
}));
vi.mock("@/stores/api/rolesStore", () => ({
  useRolesStore: () => ({ fetchRoles: vi.fn() }),
}));

import { useAuthStore } from "@/stores/api/authStore";
import type { UserProfile } from "@/interfaces/user";

const profileWith = (roleName: string, campus: string): UserProfile =>
  ({
    id: 1,
    first_name: "A",
    last_name: "B",
    email: "a@b.c",
    campus,
    roles: [{ name: roleName }],
  }) as unknown as UserProfile;

const setup = async (roleName: string, campus: string, payload: Record<string, unknown>) => {
  const store = useAuthStore();
  store.userProfile = profileWith(roleName, campus);
  get.mockResolvedValue({ data: payload });
  await store.getPermissions("t");
  return store;
};

beforeEach(() => {
  setActivePinia(createPinia());
  get.mockReset();
});

describe("authStore - canViewAllCampuses", () => {
  it("is true when the server flag is true and offers every campus", async () => {
    const store = await setup("ROOT_CAMPUS", "MERIDA", { permissions: [], can_view_all_campuses: true });
    expect(store.canViewAllCampuses).toBe(true);
    expect(store.businessCampusOptions).toHaveLength(4);
  });

  it("is false when the server flag is false, even for a ROOT role", async () => {
    const store = await setup("ROOT", "MERIDA", { permissions: [], can_view_all_campuses: false });
    expect(store.canViewAllCampuses).toBe(false);
    expect(store.businessCampusOptions).toEqual([{ value: "MERIDA", text: "Mérida" }]);
  });

  it.each(["ROOT", "ROOT_JOB"])("falls back to the %s role check when the key is absent", async (role) => {
    const store = await setup(role, "VALLADOLID", { permissions: [] });
    expect(store.canViewAllCampuses).toBe(true);
  });

  it("falls back to false for other roles when the key is absent", async () => {
    const store = await setup("ROOT_CAMPUS", "VALLADOLID", { permissions: [] });
    expect(store.canViewAllCampuses).toBe(false);
    expect(store.businessCampusOptions).toEqual([{ value: "VALLADOLID", text: "Valladolid" }]);
  });

  it("does not change filteredCampus", async () => {
    const store = await setup("ROOT_CAMPUS", "VALLADOLID", { permissions: [], can_view_all_campuses: true });
    expect(store.filteredCampus).toEqual([{ value: "VALLADOLID", text: "Valladolid" }]);
  });
});
