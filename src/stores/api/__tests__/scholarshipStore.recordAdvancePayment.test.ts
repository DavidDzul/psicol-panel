import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAlertStore } from "@/stores/alert";
import type { AdvancePaymentForm } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// scholarshipStore has no repository seam — it calls axios directly (same as
// every other action in this store, see recordPaymentSituation). This is the
// first direct scholarshipStore test in the codebase (component tests mock
// the whole store instead); it follows the same axios/error-handling/alert
// conventions every existing store method uses.

vi.mock("@/axiosConfig", () => ({
  default: { post: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const form: AdvancePaymentForm = {
  months: [
    { year: 2026, month: 10 },
    { year: 2026, month: 11 },
  ],
};

describe("scholarshipStore.recordAdvancePayment", () => {
  it("POSTs to the advance-payment endpoint with the exact form payload, never a client-supplied amount", async () => {
    setActivePinia(createPinia());
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { id: 1, months_count: 2, total_amount: "2000.00" } },
    });
    const store = useScholarshipStore();

    await store.recordAdvancePayment(42, form);

    expect(axios.post).toHaveBeenCalledWith(
      "api/admin/scholarship-refrends/42/advance-payment",
      form,
    );
  });

  it("shows a success alert and returns the created advance payment on success", async () => {
    setActivePinia(createPinia());
    const created = { id: 1, months_count: 2, total_amount: "2000.00" };
    vi.mocked(axios.post).mockResolvedValue({ data: { data: created } });
    // Spy BEFORE useScholarshipStore() — scholarshipStore's setup destructures
    // `showAlert` from useAlertStore() once at store-creation time, so the
    // spy must already be in place on alertStore.showAlert before that
    // destructuring happens, or the store keeps a reference to the
    // pre-spy function.
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.recordAdvancePayment(42, form);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Pago adelantado registrado.",
      status: "success",
    });
    expect(result).toEqual(created);
  });

  it("shows the backend msg and returns undefined on a domain-error rejection (e.g. cap exceeded)", async () => {
    setActivePinia(createPinia());
    const axiosError = {
      isAxiosError: true,
      response: { data: { msg: "Máximo 3 meses por adelanto." } },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    const result = await store.recordAdvancePayment(42, form);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Máximo 3 meses por adelanto.",
      status: "error",
    });
    expect(result).toBeUndefined();
  });

  it('falls back to "Error de red." on a non-axios rejection', async () => {
    setActivePinia(createPinia());
    vi.mocked(axios.post).mockRejectedValue(new Error("network down"));
    const alertStore = useAlertStore();
    const showAlertSpy = vi.spyOn(alertStore, "showAlert");
    const store = useScholarshipStore();

    await store.recordAdvancePayment(42, form);

    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Error de red.",
      status: "error",
    });
  });
});
