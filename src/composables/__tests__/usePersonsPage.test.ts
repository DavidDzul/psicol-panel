import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("@/stores/views/usersPage", () => ({
  useUserPageStore: () => ({
    links: [],
    users: [],
    editUser: undefined,
    createDialog: false,
    updateDialog: false,
    filteredCampus: [],
    loadingCreate: false,
    loadingUpdate: false,
    loadingTable: false,
    generations: [],
    readUsers: true,
    createUsers: true,
    editUsers: true,
    openCreateDialog: vi.fn(),
    openUpdateDialog: vi.fn(),
    openUserDetail: vi.fn(),
    onSaveUser: vi.fn(),
    onUpdateUser: vi.fn(),
  }),
}));

vi.mock("@/stores/views/graduatesPage", () => ({
  useGraduatesPageStore: () => ({
    links: [],
    graduates: [],
    editGraduate: undefined,
    createDialog: false,
    updateDialog: false,
    filteredCampus: [],
    loadingCreate: false,
    loadingUpdate: false,
    loadingTable: false,
    generations: [],
    readGraduates: true,
    createGraduates: true,
    editGraduates: true,
    openCreateDialog: vi.fn(),
    openUpdateDialog: vi.fn(),
    openGraduateDetail: vi.fn(),
    onSaveGradute: vi.fn(),
    onUpdateGraduate: vi.fn(),
  }),
}));

vi.mock("pinia", () => ({
  // Plain values are wrapped into refs, mirroring what storeToRefs exposes.
  storeToRefs: (store: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(store).map(([k, v]) => [k, ref(v)])),
}));

import { usePersonsPage } from "@/composables/usePersonsPage";

describe("usePersonsPage - defaultUserType", () => {
  beforeEach(() => vi.clearAllMocks());

  it("defaults the becarios page to BEC_ACTIVE", () => {
    expect(usePersonsPage("becarios").defaultUserType).toBe("BEC_ACTIVE");
  });

  it("keeps the egresados page unfiltered", () => {
    expect(usePersonsPage("egresados").defaultUserType).toBeNull();
  });
});
