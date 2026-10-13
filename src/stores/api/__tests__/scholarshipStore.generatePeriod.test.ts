import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAlertStore } from "@/stores/alert";
import type { GeneratePeriodForm, GenerateRefrendsResult } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// sdd/verificacion-incidencias-ux PR3: generatePeriod is now called in a
// SEQUENTIAL loop by useSedeRefrendGeneration, once per generación of a
// sede. A per-call alert (the old behavior) would spam staff with one toast
// per generación, so the store method must return the typed result on
// success and RETHROW on failure — with NO alert in either case. The
// composable is the one responsible for aggregating and reporting outcomes.

vi.mock("@/axiosConfig", () => ({
  default: { post: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const form: GeneratePeriodForm = {
  year: 2026,
  month: 10,
  campus: "CDMX",
  generation_id: 7,
};

describe("scholarshipStore.generatePeriod", () => {
  it("returns the typed result on success and shows NO alert", async () => {
    setActivePinia(createPinia());
    const result: GenerateRefrendsResult = {
      created: 3,
      skipped: 1,
      skipped_out_of_reticula: 1,
      errors: 0,
      failures: [
        {
          user_id: 42,
          name: "Becario Fuera de Retícula",
          reason: "El periodo está fuera de la retícula del becario.",
          kind: "skipped_out_of_reticula",
        },
      ],
    };
    vi.mocked(axios.post).mockResolvedValue({ data: { data: result } });
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const returned = await store.generatePeriod(form);

    expect(returned).toEqual(result);
    expect(showAlertSpy).not.toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "api/admin/scholarship-refrends/generate",
      form,
    );
  });

  it("rethrows the rejection and shows NO alert, so the caller can aggregate failures itself", async () => {
    setActivePinia(createPinia());
    const axiosError = {
      isAxiosError: true,
      response: { data: { msg: "Error del servidor." } },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    await expect(store.generatePeriod(form)).rejects.toEqual(axiosError);
    expect(showAlertSpy).not.toHaveBeenCalled();
  });
});
