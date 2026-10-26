import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { usePersonsStore } from "@/stores/api/personsStore";
import type { User } from "@/interfaces/user";

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const makeUser = (overrides: Partial<User> & { id: number }): User => ({
  enrollment: `ENR${overrides.id}`,
  first_name: "Ana",
  last_name: "Perez",
  email: "a@example.com",
  email_verified_at: null,
  phone: "5512345678",
  workstation: null,
  user_type: "BEC_ACTIVE",
  campus: "CDMX",
  generation_id: 1,
  active: true,
  created_at: null,
  updated_at: "2026-01-01",
  ...overrides,
});

const seed = (user: User) => {
  setActivePinia(createPinia());
  const store = usePersonsStore();
  store.allPersons = new Map([[user.id, user]]);
  return store;
};

describe("personsStore.patchPersonFlags", () => {
  it("replaces the Map entry immutably with the merged flags", () => {
    const store = seed(makeUser({ id: 1, curriculum_uploaded: false }));
    const previousMap = store.allPersons;
    const previousRow = store.allPersons.get(1);

    store.patchPersonFlags(1, { curriculum_uploaded: true });

    expect(store.allPersons).not.toBe(previousMap);
    expect(store.allPersons.get(1)).not.toBe(previousRow);
    expect(store.allPersons.get(1)?.curriculum_uploaded).toBe(true);
    expect(previousRow?.curriculum_uploaded).toBe(false);
    expect(store.allPersons.get(1)?.first_name).toBe("Ana");
  });

  it("also patches personDetails when it holds the same person", () => {
    const user = makeUser({ id: 1, has_scholarship_profile: false });
    const store = seed(user);
    store.personDetails = user;

    store.patchPersonFlags(1, { has_scholarship_profile: true });

    expect(store.personDetails?.has_scholarship_profile).toBe(true);
  });

  it("leaves personDetails alone when it is a different person", () => {
    const store = seed(makeUser({ id: 1 }));
    const other = makeUser({ id: 2, curriculum_uploaded: false });
    store.personDetails = other;

    store.patchPersonFlags(1, { curriculum_uploaded: true });

    expect(store.personDetails).toStrictEqual(other);
  });

  it("is a no-op for a person that is not in the list", () => {
    const store = seed(makeUser({ id: 1 }));
    const previousMap = store.allPersons;

    store.patchPersonFlags(99, { curriculum_uploaded: true });

    expect(store.allPersons).toBe(previousMap);
  });
});

describe("personsStore.updatePerson flag merging", () => {
  it("keeps previous computed flags when the response lacks them (old API)", async () => {
    const store = seed(
      makeUser({ id: 1, has_scholarship_profile: true, curriculum_uploaded: true }),
    );
    store.personDetails = store.allPersons.get(1) ?? null;
    vi.mocked(axios.patch).mockResolvedValue({
      data: { updateUser: makeUser({ id: 1, first_name: "Nueva" }) },
    });

    await store.updatePerson({} as never, 1);

    const row = store.allPersons.get(1);
    expect(row?.first_name).toBe("Nueva");
    expect(row?.has_scholarship_profile).toBe(true);
    expect(row?.curriculum_uploaded).toBe(true);
    expect(store.personDetails?.curriculum_uploaded).toBe(true);
  });

  it("takes the flags from the response when present", async () => {
    const store = seed(makeUser({ id: 1, curriculum_uploaded: false }));
    vi.mocked(axios.patch).mockResolvedValue({
      data: { updateUser: makeUser({ id: 1, curriculum_uploaded: true }) },
    });

    await store.updatePerson({} as never, 1);

    expect(store.allPersons.get(1)?.curriculum_uploaded).toBe(true);
  });
});
