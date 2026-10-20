import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useAlertStore } from "@/stores/alert";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// sdd/generaciones-activas-refrendos: the API refuses to deactivate a
// generación with pending becarios (422 GENERATION_HAS_PENDING_BECARIOS with
// a human-readable `message`). updateGeneration must surface that server
// message in the alert, fall back to `msg`, then to the generic text, and
// always rethrow so the caller keeps the dialog open.

vi.mock("@/axiosConfig", () => ({
  default: { put: vi.fn(), get: vi.fn(), post: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({}),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const GENERIC = "Error al actualizar la información, intente nuevamente.";

const setup = () => {
  setActivePinia(createPinia());
  const alertStore = useAlertStore();
  const showAlertSpy = vi.spyOn(alertStore, "showAlert");
  const store = useGenerationsStore();
  return { showAlertSpy, store };
};

describe("generationStore.updateGeneration — error handling", () => {
  it("shows response.data.message in the alert and rethrows on a 422", async () => {
    const { showAlertSpy, store } = setup();
    const axiosError = {
      response: {
        status: 422,
        data: {
          res: false,
          msg: "msg del servidor",
          message: "No se puede desactivar: 3 becarios con pagos pendientes.",
          code: "GENERATION_HAS_PENDING_BECARIOS",
          pending_becarios_count: 3,
        },
      },
    };
    vi.mocked(axios.put).mockRejectedValue(axiosError);

    await expect(store.updateGeneration({}, 1)).rejects.toBe(axiosError);

    expect(showAlertSpy).toHaveBeenCalledTimes(1);
    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "No se puede desactivar: 3 becarios con pagos pendientes.",
      status: "error",
    });
  });

  it("falls back to response.data.msg when there is no message", async () => {
    const { showAlertSpy, store } = setup();
    vi.mocked(axios.put).mockRejectedValue({
      response: { data: { msg: "solo msg" } },
    });

    await expect(store.updateGeneration({}, 1)).rejects.toBeDefined();

    expect(showAlertSpy).toHaveBeenCalledWith({ title: "solo msg", status: "error" });
  });

  it("falls back to the generic text when the error has no response body (network error)", async () => {
    const { showAlertSpy, store } = setup();
    const networkError = new Error("Network Error");
    vi.mocked(axios.put).mockRejectedValue(networkError);

    await expect(store.updateGeneration({}, 1)).rejects.toBe(networkError);

    expect(showAlertSpy).toHaveBeenCalledWith({ title: GENERIC, status: "error" });
  });

  it("keeps the success alert and stores the updated generación", async () => {
    const { showAlertSpy, store } = setup();
    const data = { id: 1, campus: "CDMX", generation_active: true, generation_name: "A", pending_becarios_count: 0 };
    vi.mocked(axios.put).mockResolvedValue({ data: { data } });

    await store.updateGeneration({}, 1);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Información actualizada exitosamente.",
      status: "success",
    });
    expect(store.resGenerations.get(1)).toEqual(data);
  });
});
