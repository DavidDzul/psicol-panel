import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useVacantPositionStore } from "@/stores/api/vacanPositionStore";

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({}),
}));

const showAlert = vi.fn();
vi.mock("@/stores/alert", () => ({
  useAlertStore: () => ({ showAlert }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const setup = () => {
  setActivePinia(createPinia());
  return useVacantPositionStore();
};

const row = {
  id: 1,
  user_id: "5",
  vacant_name: "Dev",
  status: true,
  category: "JOB_POSITION",
  created_at: "2026-01-01",
  business: { id: 2, user_id: "7", bs_name: "Acme" },
};

describe("vacanPositionStore", () => {
  it("resetVacant sends a null body and the headers as config", async () => {
    const store = setup();
    vi.mocked(axios.put).mockResolvedValue({
      data: { vacant: row, res: true },
    });

    await store.resetVacant(1);

    expect(axios.put).toHaveBeenCalledWith(
      "api/admin/vacantPositions/1/reset",
      null,
      { headers: { accept: "application/json" } },
    );
  });

  it("normalizes string user_id values in the index", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({ data: { positions: [row] } });

    await store.fetchVacantPositions();

    const stored = store.resPositions.get(1);
    expect(stored?.user_id).toBe(5);
    expect(stored?.business?.user_id).toBe(7);
  });

  it("normalizes user_id on show", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({ data: { vacant: row } });

    await store.showVacant(1);

    expect(store.resVacantDetails?.user_id).toBe(5);
    expect(store.resVacantDetails?.business?.user_id).toBe(7);
  });

  it("shows the field error from a 422 on create", async () => {
    const store = setup();
    const error = Object.assign(new Error("422"), {
      isAxiosError: true,
      response: {
        data: {
          message: "invalid",
          errors: { vacant_name: ["Nombre inválido"] },
        },
      },
    });
    vi.mocked(axios.post).mockRejectedValue(error);

    await expect(store.createVacantLaboral(1, {} as never)).rejects.toBe(error);

    expect(showAlert).toHaveBeenCalledWith({
      title: "Nombre inválido",
      status: "error",
    });
  });
});
