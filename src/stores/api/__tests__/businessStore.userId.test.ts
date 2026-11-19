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

describe("businessStore user_id normalization", () => {
  it("converts a string business_data.user_id to number in the list", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        business: [
          { id: 1, business_data: { id: 9, user_id: "5", bs_name: "Acme" } },
          { id: 2, business_data: null },
        ],
      },
    });

    await store.fetchBusiness();

    expect(store.resBusiness.get(1)?.business_data?.user_id).toBe(5);
    expect(store.resBusiness.get(2)?.business_data).toBeNull();
  });

  it("converts user_id in getBusinessData", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({
      data: { data: { id: 9, user_id: "5", bs_name: "Acme" } },
    });

    await store.getBusinessData(1);

    expect(store.resBusinessData?.user_id).toBe(5);
  });

  it("converts user_id in getBusiness details", async () => {
    const store = setup();
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        business: { id: 1, business_data: { id: 9, user_id: "5", bs_name: "A" } },
      },
    });

    await store.getBusiness(1);

    expect(store.resBusinessDetails?.business_data?.user_id).toBe(5);
  });
});
