import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAlertStore } from "@/stores/alert";
import type { RecordSituationForm } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// Same axios/error-handling/alert conventions as
// scholarshipStore.recordAdvancePayment.test.ts. This is the first direct
// test of recordPaymentSituation — it previously returned a bare
// ScholarshipRefrend | undefined and toasted a generic error on ANY
// failure, including the server's ADVANCE_DIVERGENCE_REQUIRED case, which
// left staff with no way to supply the reason and complete the resolution
// (sdd-verify CRITICAL finding, sdd/pago-adelantado design D4 fix
// 2026-09-25). This file locks in the corrected discriminated-result
// contract.

vi.mock("@/axiosConfig", () => ({
  default: { post: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const form: RecordSituationForm = { resolution_type: "BECA_MES" };

describe("scholarshipStore.recordPaymentSituation", () => {
  it("returns a success result with the merged refrend on 200", async () => {
    setActivePinia(createPinia());
    const refrend = { id: 5, resolution_type: "BECA_MES" };
    vi.mocked(axios.post).mockResolvedValue({ data: { data: refrend } });
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.recordPaymentSituation(5, form);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Situación registrada.",
      status: "success",
    });
    expect(result.status).toBe("success");
  });

  // The exact scenario the CRITICAL finding was about: the server's 422
  // carries a machine-readable `code`, distinct from a plain error message,
  // so the caller can react by opening AdvanceDivergenceReasonDialog and
  // resubmitting — not dead-end on a generic toast.
  it('returns status "divergence_required" (and shows NO error toast) when the server responds with code ADVANCE_DIVERGENCE_REQUIRED', async () => {
    setActivePinia(createPinia());
    const axiosError = {
      isAxiosError: true,
      response: {
        data: {
          res: false,
          msg: "Este mes ya fue pagado por adelantado: indique el motivo del cambio de resolución.",
          code: "ADVANCE_DIVERGENCE_REQUIRED",
        },
      },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.recordPaymentSituation(5, form);

    expect(result).toEqual({ status: "divergence_required" });
    expect(showAlertSpy).not.toHaveBeenCalled();
  });

  it("shows the backend msg and returns a generic error result on a domain-error rejection without the divergence code", async () => {
    setActivePinia(createPinia());
    const axiosError = {
      isAxiosError: true,
      response: { data: { msg: "Solo se puede registrar en refrendos DRAFT." } },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.recordPaymentSituation(5, form);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Solo se puede registrar en refrendos DRAFT.",
      status: "error",
    });
    expect(result).toEqual({ status: "error" });
  });

  it('falls back to "Error de red." and a generic error result on a non-axios rejection', async () => {
    setActivePinia(createPinia());
    vi.mocked(axios.post).mockRejectedValue(new Error("network down"));
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.recordPaymentSituation(5, form);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Error de red.",
      status: "error",
    });
    expect(result).toEqual({ status: "error" });
  });
});
