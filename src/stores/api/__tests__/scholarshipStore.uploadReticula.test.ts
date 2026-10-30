import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAlertStore } from "@/stores/alert";

vi.mock("@/axiosConfig", () => ({
  default: { post: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const setup = () => {
  setActivePinia(createPinia());
  const showAlertSpy = vi.spyOn(useAlertStore(), "showAlert");
  return { store: useScholarshipStore(), showAlertSpy };
};

describe("scholarshipStore.uploadReticula error handling", () => {
  it("shows the server msg verbatim on RETICULA_ADVANCE_CONFLICT (S58)", async () => {
    const { store, showAlertSpy } = setup();
    const msg =
      "No puedes cambiar la fecha de la retícula: hay pagos adelantados pendientes en 05/2026, 06/2026 y 07/2026.";
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          res: false,
          msg,
          code: "RETICULA_ADVANCE_CONFLICT",
          data: { egreso_period_year: 2026, egreso_period_month: 5, months: [] },
        },
      },
    });

    const result = await store.uploadReticula(7, new FormData());

    expect(result).toBeUndefined();
    expect(showAlertSpy).toHaveBeenCalledWith({ title: msg, status: "error" });
  });

  it("keeps the generic message when the failure carries no server msg", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.post).mockRejectedValue(new Error("boom"));

    await store.uploadReticula(7, new FormData());

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Error al guardar retícula.",
      status: "error",
    });
  });
});
