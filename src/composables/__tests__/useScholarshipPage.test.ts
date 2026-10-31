import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("vue", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue")>()),
  onBeforeMount: vi.fn(),
}));

vi.mock("pinia", () => ({
  storeToRefs: (store: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(store).map(([k, v]) => [k, ref(v)])),
}));

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({ refrends: new Map(), fetchRefrends: vi.fn() }),
}));

vi.mock("@/stores/api/authStore", () => ({
  useAuthStore: () => ({ filteredCampus: [] }),
}));

vi.mock("@/composables/useSedeRefrendGeneration", () => ({
  useSedeRefrendGeneration: () => ({ run: vi.fn(), running: ref(false) }),
}));

import { useScholarshipPage } from "@/composables/useScholarshipPage";

// sdd/refrendo-mes-siguiente PR3 (S8.1): the page opens on NEXT month because
// refrends are generated one month ahead; December rolls over to January of
// the following year.
describe("useScholarshipPage - default period", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("defaults to the next month within the same year", () => {
    vi.setSystemTime(new Date(2026, 9, 29, 10));
    const { selectedYear, selectedMonth } = useScholarshipPage();

    expect(selectedYear.value).toBe(2026);
    expect(selectedMonth.value).toBe(11);
  });

  it("rolls December over to January of the next year", () => {
    vi.setSystemTime(new Date(2026, 11, 15, 10));
    const { selectedYear, selectedMonth } = useScholarshipPage();

    expect(selectedYear.value).toBe(2027);
    expect(selectedMonth.value).toBe(1);
  });

  it("defaults to February in January", () => {
    vi.setSystemTime(new Date(2027, 0, 5, 10));
    const { selectedYear, selectedMonth } = useScholarshipPage();

    expect(selectedYear.value).toBe(2027);
    expect(selectedMonth.value).toBe(2);
  });
});
