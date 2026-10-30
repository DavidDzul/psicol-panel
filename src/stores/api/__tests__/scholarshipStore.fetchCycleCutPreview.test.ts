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

const setup = () => {
  setActivePinia(createPinia());
  const showAlertSpy = vi.spyOn(useAlertStore(), "showAlert");
  return { store: useScholarshipStore(), showAlertSpy };
};

describe("scholarshipStore.fetchCycleCutPreview", () => {
  it("GETs the preview endpoint with the reason and returns data", async () => {
    const { store } = setup();
    const data = { reason: "BAJA_DEFINITIVA", can_cut: true, blockers: [], advance: { months: [] } };
    vi.mocked(axios.get).mockResolvedValue({ data: { res: true, data } });

    const result = await store.fetchCycleCutPreview(42, "BAJA_DEFINITIVA");

    expect(axios.get).toHaveBeenCalledWith(
      "api/admin/scholarship-refrends/42/cycle-cut-preview",
      { params: { reason: "BAJA_DEFINITIVA" } },
    );
    expect(result).toEqual(data);
  });

  it("returns null on error WITHOUT a toast (S52)", async () => {
    const { store, showAlertSpy } = setup();
    vi.mocked(axios.get).mockRejectedValue(new Error("boom"));

    const result = await store.fetchCycleCutPreview(42, "EGRESADO");

    expect(result).toBeNull();
    expect(showAlertSpy).not.toHaveBeenCalled();
  });
});
