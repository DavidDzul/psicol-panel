import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { usePersonsStore } from "@/stores/api/personsStore";
import type { User } from "@/interfaces/user";

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const makeUser = (id: number, overrides: Partial<User> = {}): User => ({
  id,
  enrollment: `ENR${id}`,
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

const setup = (user: User) => {
  setActivePinia(createPinia());
  const persons = usePersonsStore();
  persons.allPersons = new Map([[user.id, user]]);
  return { persons, scholarship: useScholarshipStore() };
};

describe("scholarshipStore.uploadReticula", () => {
  it("patches curriculum_uploaded: true on the person row on success", async () => {
    const { persons, scholarship } = setup(makeUser(7, { curriculum_uploaded: false }));
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { id: 1, user_id: 7 } } });

    await scholarship.uploadReticula(7, new FormData());

    expect(persons.allPersons.get(7)?.curriculum_uploaded).toBe(true);
  });

  it("does not patch the person when the upload fails", async () => {
    const { persons, scholarship } = setup(makeUser(7, { curriculum_uploaded: false }));
    vi.mocked(axios.post).mockRejectedValue(new Error("boom"));

    await scholarship.uploadReticula(7, new FormData());

    expect(persons.allPersons.get(7)?.curriculum_uploaded).toBe(false);
  });
});

describe("scholarshipStore.saveProfile", () => {
  it("patches has_scholarship_profile: true when creating a profile", async () => {
    const { persons, scholarship } = setup(makeUser(7, { has_scholarship_profile: false }));
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { id: 1, user_id: 7 } } });

    await scholarship.saveProfile({ user_id: 7 } as never);

    expect(persons.allPersons.get(7)?.has_scholarship_profile).toBe(true);
  });

  it("does not patch the person when saving fails", async () => {
    const { persons, scholarship } = setup(makeUser(7, { has_scholarship_profile: false }));
    vi.mocked(axios.post).mockRejectedValue(new Error("boom"));

    await expect(scholarship.saveProfile({ user_id: 7 } as never)).rejects.toThrow();

    expect(persons.allPersons.get(7)?.has_scholarship_profile).toBe(false);
  });
});
