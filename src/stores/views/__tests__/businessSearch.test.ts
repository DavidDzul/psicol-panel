import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import axios from "@/axiosConfig";
import { useBusinessSearchStore } from "@/stores/views/businessSearch";

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
  return useBusinessSearchStore();
};

const respond = (businesses: unknown[]) =>
  vi.mocked(axios.get).mockResolvedValueOnce({ data: { businesses } });

describe("businessSearch.getBusiness", () => {
  it("keeps the selected item when the query is too short", async () => {
    const store = setup();
    respond([{ id: 1, user_id: 5, bs_name: "Acme" }]);
    await store.getBusiness("Acme", null);

    await store.getBusiness("Ac", 5);

    expect(store.businessList).toEqual([{ id: 1, user_id: 5, bs_name: "Acme" }]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("clears the list on a short query when nothing is selected", async () => {
    const store = setup();
    respond([{ id: 1, user_id: 5, bs_name: "Acme" }]);
    await store.getBusiness("Acme", null);

    await store.getBusiness("", null);

    expect(store.businessList).toEqual([]);
  });

  it("prepends the selected item when results do not include it", async () => {
    const store = setup();
    respond([{ id: 1, user_id: 5, bs_name: "Acme" }]);
    await store.getBusiness("Acme", null);
    respond([{ id: 2, user_id: 6, bs_name: "Beta" }]);

    await store.getBusiness("Beta", 5);

    expect(store.businessList.map((b) => b.user_id)).toEqual([5, 6]);
  });

  it("does not duplicate the selected item when results include it", async () => {
    const store = setup();
    respond([{ id: 1, user_id: 5, bs_name: "Acme" }]);
    await store.getBusiness("Acme", null);
    respond([{ id: 1, user_id: 5, bs_name: "Acme" }]);

    await store.getBusiness("Acme", 5);

    expect(store.businessList).toHaveLength(1);
  });

  it("keeps the selection when the API returns user_id as a string", async () => {
    const store = setup();
    respond([{ id: "1", user_id: "5", bs_name: "Acme" }]);
    await store.getBusiness("Acme", null);
    respond([{ id: "1", user_id: "5", bs_name: "Acme" }]);

    await store.getBusiness("Acme", 5);

    expect(store.businessList).toEqual([{ id: 1, user_id: 5, bs_name: "Acme" }]);
  });

  it("ignores a stale response that resolves after a newer request", async () => {
    const store = setup();
    let resolveFirst: (v: unknown) => void = () => {};
    vi.mocked(axios.get).mockImplementationOnce(
      () => new Promise((r) => (resolveFirst = r)),
    );
    const first = store.getBusiness("Acme", null);
    respond([{ id: 2, user_id: 6, bs_name: "Beta" }]);
    await store.getBusiness("Beta", null);

    resolveFirst({
      data: { businesses: [{ id: 1, user_id: 5, bs_name: "Acme" }] },
    });
    await first;

    expect(store.businessList.map((b) => b.bs_name)).toEqual(["Beta"]);
  });
});
