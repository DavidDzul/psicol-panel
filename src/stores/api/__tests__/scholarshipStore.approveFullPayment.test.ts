import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAlertStore } from "@/stores/alert";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// Same axios/error-handling/alert conventions as
// scholarshipStore.recordPaymentSituation.test.ts. Live bug report
// (2026-09-27): approveFullPayment (the quick "Aprobar" menu item) is
// staff's most natural way to approve at 100%, but it went through a
// DIFFERENT backend action (ApproveFullPaymentAction) that used to bypass
// advance-payment reconciliation entirely. The backend now shares the same
// ADVANCE_DIVERGENCE_REQUIRED code (AdvancePaymentReconciler), so this store
// method must surface it the same discriminated way as
// recordPaymentSituation, instead of a bare refrend/undefined.

vi.mock("@/axiosConfig", () => ({
  default: { post: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("scholarshipStore.approveFullPayment", () => {
  it("POSTs with no body when no reason is given, and returns a success result", async () => {
    setActivePinia(createPinia());
    const refrend = { id: 5, resolution_type: "BECA_MES" };
    vi.mocked(axios.post).mockResolvedValue({ data: { data: refrend } });
    const store = useScholarshipStore();

    const result = await store.approveFullPayment(5);

    expect(axios.post).toHaveBeenCalledWith("api/admin/scholarship-refrends/5/approve-full", {});
    expect(result.status).toBe("success");
  });

  it("includes advance_divergence_reason in the body when a reason is given", async () => {
    setActivePinia(createPinia());
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { id: 5 } } });
    const store = useScholarshipStore();

    await store.approveFullPayment(5, "Autorizado por dirección.");

    expect(axios.post).toHaveBeenCalledWith("api/admin/scholarship-refrends/5/approve-full", {
      advance_divergence_reason: "Autorizado por dirección.",
    });
  });

  it('returns status "divergence_required" (and shows NO error toast) when the server responds with code ADVANCE_DIVERGENCE_REQUIRED', async () => {
    setActivePinia(createPinia());
    const axiosError = {
      isAxiosError: true,
      response: {
        data: {
          res: false,
          message: "Este mes ya fue pagado por adelantado: indique el motivo del cambio de resolución.",
          code: "ADVANCE_DIVERGENCE_REQUIRED",
        },
      },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.approveFullPayment(5);

    expect(result).toEqual({ status: "divergence_required" });
    expect(showAlertSpy).not.toHaveBeenCalled();
  });

  it("shows the backend message and returns a generic error result on a domain-error rejection without the divergence code", async () => {
    setActivePinia(createPinia());
    const axiosError = {
      isAxiosError: true,
      response: { data: { message: "El refrendo está bloqueado y no admite cambios." } },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.approveFullPayment(5);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "El refrendo está bloqueado y no admite cambios.",
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

    const result = await store.approveFullPayment(5);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Error de red.",
      status: "error",
    });
    expect(result).toEqual({ status: "error" });
  });
});
