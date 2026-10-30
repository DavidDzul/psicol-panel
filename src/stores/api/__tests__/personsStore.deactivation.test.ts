import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { usePersonsStore } from "@/stores/api/personsStore";
import { useAlertStore } from "@/stores/alert";
import type { User, UserUpdateForm } from "@/interfaces/user";

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

afterEach(() => vi.clearAllMocks());

const user: User = {
  id: 1,
  enrollment: "E1",
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
};

const form = { ...user, active: false } as unknown as UserUpdateForm;

// Spy BEFORE creating the store: it destructures showAlert at creation time.
const setup = () => {
  setActivePinia(createPinia());
  const showAlertSpy = vi.spyOn(useAlertStore(), "showAlert");
  const store = usePersonsStore();
  store.allPersons = new Map([[1, user]]);
  store.personDetails = user;
  return { store, showAlertSpy };
};

const conflict = {
  isAxiosError: true,
  response: {
    status: 409,
    data: {
      res: false,
      msg: "No se puede desactivar: 11/2026 está pagado.",
      code: "CYCLE_CUT_BLOCKED",
      data: { blocking_months: [{ year: 2026, month: 11, reason: "LOCKED" }] },
    },
  },
};

describe("personsStore.updatePerson — deactivation", () => {
  it("shows the effects summary when the API reports cancellations", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.patch).mockResolvedValue({
      data: {
        res: true,
        updateUser: { ...user, active: false },
        deactivation_effects: { withholdings_cancelled: 2, advance_months_cancelled: 1, overpaid_amount: "0.00" },
      },
    });

    await store.updatePerson(form, 1);

    const titles = showAlertSpy.mock.calls.map((c) => c[0].title);
    expect(titles).toContain("Información actualizada exitosamente.");
    expect(titles).toContain("Se cancelaron 2 retenciones pendientes y 1 mes de pago adelantado.");
    expect(store.allPersons.get(1)?.active).toBe(false);
  });

  it("shows no summary when effects are null or all zero", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.patch).mockResolvedValue({
      data: { res: true, updateUser: { ...user, active: false }, deactivation_effects: null },
    });

    await store.updatePerson(form, 1);

    expect(showAlertSpy).toHaveBeenCalledTimes(1);
  });

  it("shows the API msg on 409 CYCLE_CUT_BLOCKED, rethrows and leaves the user active", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.patch).mockRejectedValue(conflict);

    await expect(store.updatePerson(form, 1)).rejects.toBe(conflict);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "No se puede desactivar: 11/2026 está pagado.",
      status: "error",
    });
    expect(store.allPersons.get(1)?.active).toBe(true);
    expect(store.personDetails?.active).toBe(true);
  });
});
