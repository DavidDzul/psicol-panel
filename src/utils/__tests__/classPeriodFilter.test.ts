import { describe, expect, it } from "vitest";
import {
  ALL_MONTHS,
  CLASS_FIRST_YEAR,
  buildClassListParams,
  buildYearOptions,
} from "@/utils/classPeriodFilter";

describe("buildClassListParams", () => {
  const base = { campus: "MERIDA", generation_id: 1 };

  it("sends year and month when both are set", () => {
    expect(buildClassListParams({ ...base, year: 2026, month: 11 })).toEqual({
      campus: "MERIDA",
      generation_id: 1,
      year: 2026,
      month: 11,
    });
  });

  it("strips the 'all months' sentinel and sends year only", () => {
    const params = buildClassListParams({ ...base, year: 2026, month: ALL_MONTHS });
    expect(params).toEqual({ campus: "MERIDA", generation_id: 1, year: 2026 });
    expect("month" in params).toBe(false);
  });

  it("omits year and month when year is null", () => {
    const params = buildClassListParams({ ...base, year: null, month: 5 });
    expect(params).toEqual({ campus: "MERIDA", generation_id: 1 });
  });

  it("returns a new object without mutating the input", () => {
    const input = { ...base, year: 2026, month: 3 };
    const snapshot = { ...input };
    const params = buildClassListParams(input);
    expect(params).not.toBe(input);
    expect(input).toEqual(snapshot);
  });
});

describe("buildYearOptions", () => {
  it("spans from the first class year to next year", () => {
    expect(buildYearOptions(2026)).toEqual([2025, 2026, 2027]);
    expect(buildYearOptions(2026)[0]).toBe(CLASS_FIRST_YEAR);
  });

  it("never returns an empty list for years before the first class year", () => {
    expect(buildYearOptions(2020)).toEqual([CLASS_FIRST_YEAR]);
  });
});
