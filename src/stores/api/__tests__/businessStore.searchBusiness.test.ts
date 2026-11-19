import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useBusinessStore } from "@/stores/api/businessStore";

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({}),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const setup = () => {
  setActivePinia(createPinia());
  return useBusinessStore();
};

describe("businessStore.searchBusiness", () => {
  it("sends the search term as params.search", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({
      data: { businesses: [{ id: 1, user_id: 5, bs_name: "Acme" }] },
    });

    const res = await store.searchBusiness("Acme");

    expect(axios.get).toHaveBeenCalledWith(
      "api/admin/search",
      expect.objectContaining({ params: { search: "Acme" } }),
    );
    expect(res?.businesses).toEqual([{ id: 1, user_id: 5, bs_name: "Acme" }]);
  });

  it("normalizes string ids to numbers", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({
      data: { businesses: [{ id: "1", user_id: "5", bs_name: "Acme" }] },
    });

    const res = await store.searchBusiness("Acme");

    expect(res?.businesses[0]).toEqual({ id: 1, user_id: 5, bs_name: "Acme" });
  });

  it("does not log to the console", async () => {
    const store = setup();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.mocked(axios.get).mockResolvedValue({ data: { businesses: [] } });

    await store.searchBusiness("Acme");

    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
