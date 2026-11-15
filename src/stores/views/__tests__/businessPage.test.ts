import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("@/stores/api/businessStore", async () => {
  const { ref } = await import("vue");
  return {
    useBusinessStore: () => ({
      resBusiness: ref(new Map()),
      fetchBusiness: vi.fn(),
      createBusiness: vi.fn(),
    }),
  };
});
vi.mock("@/stores/app", () => ({ useAppStore: () => ({ setLoading: vi.fn() }) }));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/axiosConfig", () => ({ default: { get: vi.fn(), defaults: { headers: { common: {} } } } }));
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert: vi.fn() }) }));
vi.mock("@/stores/api/generationStore", () => ({ useGenerationsStore: () => ({ fetchGenerations: vi.fn() }) }));
vi.mock("@/stores/api/rolesStore", () => ({ useRolesStore: () => ({ fetchRoles: vi.fn() }) }));

import { useBusinessPageStore } from "@/stores/views/businessPage";
import { useAuthStore } from "@/stores/api/authStore";
import type { UserProfile } from "@/interfaces/user";

beforeEach(() => setActivePinia(createPinia()));

const login = (campus: string, canViewAll: boolean) => {
  const auth = useAuthStore();
  auth.userProfile = { id: 1, campus, roles: [] } as unknown as UserProfile;
  auth.canViewAllCampuses = canViewAll;
};

describe("businessPage store - campus selector", () => {
  it("defaults to the own campus and offers every campus when global", () => {
    login("MERIDA", true);
    const page = useBusinessPageStore();
    expect(page.ownCampus).toBe("MERIDA");
    expect(page.canViewAllCampuses).toBe(true);
    expect(page.businessCampusOptions).toHaveLength(4);
  });

  it("offers only the own campus when not global", () => {
    login("TIZIMIN", false);
    const page = useBusinessPageStore();
    expect(page.canViewAllCampuses).toBe(false);
    expect(page.businessCampusOptions).toEqual([{ value: "TIZIMIN", text: "Tizimín" }]);
  });
});
