import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useBusinessAutocomplete } from "@/composables/useBusinessAutocomplete";
import { useBusinessSearchStore } from "@/stores/views/businessSearch";

vi.mock("vue-router", () => ({
  useRouter: () => ({}),
}));

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn() },
}));

beforeEach(() => {
  vi.useFakeTimers();
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useBusinessAutocomplete", () => {
  it("debounces the search by 500ms for queries of 3+ chars", async () => {
    const store = useBusinessSearchStore();
    const spy = vi.spyOn(store, "getBusiness").mockResolvedValue();
    const { searchQuery } = useBusinessAutocomplete();

    searchQuery.value = "Acm";
    await nextTick();
    searchQuery.value = "Acme";
    await nextTick();
    vi.advanceTimersByTime(499);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("Acme", null);
  });

  it("handles short queries immediately and passes the selection", async () => {
    const store = useBusinessSearchStore();
    const spy = vi.spyOn(store, "getBusiness").mockResolvedValue();
    const { searchQuery, selectedBusiness } = useBusinessAutocomplete();
    selectedBusiness.value = 5;

    searchQuery.value = "Ac";
    await nextTick();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("Ac", 5);
  });
});
