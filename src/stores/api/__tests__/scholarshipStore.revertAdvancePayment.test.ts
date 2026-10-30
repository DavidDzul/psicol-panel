import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAlertStore } from "@/stores/alert";

vi.mock("@/axiosConfig", () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

const REASON = "Se registró por error";

// Spy BEFORE useScholarshipStore(): the store destructures showAlert once at
// creation time (same pattern as the recordAdvancePayment tests).
const setup = () => {
  setActivePinia(createPinia());
  const showAlertSpy = vi.spyOn(useAlertStore(), "showAlert");
  return { store: useScholarshipStore(), showAlertSpy };
};

describe("scholarshipStore.revertAdvancePayment", () => {
  it("POSTs the reason to the revert endpoint", async () => {
    const { store } = setup();
    vi.mocked(axios.post).mockResolvedValue({ data: { res: true, data: {} } });

    await store.revertAdvancePayment(42, REASON);

    expect(axios.post).toHaveBeenCalledWith(
      "api/admin/scholarship-refrends/42/advance-payment/revert",
      { reason: REASON },
    );
  });

  it("returns success and shows a success toast", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.post).mockResolvedValue({ data: { res: true, data: {} } });

    const result = await store.revertAdvancePayment(42, REASON);

    expect(result).toEqual({ status: "success" });
    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "Pago adelantado revertido.",
      status: "success",
    });
  });

  it("surfaces the server msg and returns the code on a domain error", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 422,
        data: { res: false, msg: "El refrendo de origen ya se pagó.", code: "ADVANCE_ORIGIN_PAID" },
      },
    });

    const result = await store.revertAdvancePayment(42, REASON);

    expect(result).toEqual({
      status: "error",
      code: "ADVANCE_ORIGIN_PAID",
      msg: "El refrendo de origen ya se pagó.",
    });
    expect(showAlertSpy).toHaveBeenCalledWith({
      title: "El refrendo de origen ya se pagó.",
      status: "error",
    });
  });

  it("falls back to a generic message with a null code on a non-axios failure", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.post).mockRejectedValue(new Error("network down"));

    const result = await store.revertAdvancePayment(42, REASON);

    expect(result).toEqual({ status: "error", code: null, msg: "Error de red." });
    expect(showAlertSpy).toHaveBeenCalledWith({ title: "Error de red.", status: "error" });
  });
});
