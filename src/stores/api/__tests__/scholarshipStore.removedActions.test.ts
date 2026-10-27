import { describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";

// Guard: these actions targeted endpoints that no longer exist in the API
// (review stages, authorize, paid, withhold). They must not come back.
describe("scholarshipStore — removed legacy actions", () => {
  it.each([
    "fetchRefrend",
    "selectedRefrend",
    "submitStageReview",
    "authorizeRefrend",
    "markPaid",
    "withholdRefrend",
  ])("does not expose %s", (name) => {
    setActivePinia(createPinia());
    const store = useScholarshipStore() as unknown as Record<string, unknown>;
    expect(store[name]).toBeUndefined();
  });
});
