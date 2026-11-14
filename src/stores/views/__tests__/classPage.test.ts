import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const fetchClasses = vi.fn();

vi.mock("@/stores/api/classStore", async () => {
  const { ref } = await import("vue");
  return {
    useClassStore: () => ({
      classMap: ref(new Map()),
      fetchClasses,
      createClass: vi.fn(),
      updateClass: vi.fn(),
      deleteClass: vi.fn(),
      reportSemesterPDF: vi.fn(),
      reportSemesterExcel: vi.fn(),
    }),
  };
});

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { useClassPageStore } from "@/stores/views/classPage";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 14, 10));
  setActivePinia(createPinia());
  fetchClasses.mockReset();
});

afterEach(() => vi.useRealTimers());

describe("classPage store - period filter", () => {
  it("defaults to the current year and month", () => {
    const store = useClassPageStore();
    expect(store.year).toBe(2026);
    expect(store.month).toBe(11);
  });

  it("offers years from 2025 to next year", () => {
    expect(useClassPageStore().yearOptions).toEqual([2025, 2026, 2027]);
  });

  it("sends year and month with the search", async () => {
    const store = useClassPageStore();
    await store.searchData({ campus: "MERIDA", generation_id: 1 });
    expect(fetchClasses).toHaveBeenCalledWith({
      campus: "MERIDA",
      generation_id: 1,
      year: 2026,
      month: 11,
    });
  });

  it("sends year only when 'Todos los meses' (0) is selected", async () => {
    const store = useClassPageStore();
    store.month = 0;
    await store.searchData({ campus: "MERIDA", generation_id: 1 });
    expect(fetchClasses).toHaveBeenCalledWith({
      campus: "MERIDA",
      generation_id: 1,
      year: 2026,
    });
  });
});
