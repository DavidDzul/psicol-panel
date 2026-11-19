import { describe, expect, it } from "vitest";
import * as v from "@/validations/vacant";

describe("vacant validators (API max:255)", () => {
  it("rejects strings longer than 255 chars", () => {
    const long = "a".repeat(256);
    expect(v.vacant_name().isValidSync(long)).toBe(false);
    expect(v.skills().isValidSync(long)).toBe(false);
    expect(v.semester().isValidSync(long)).toBe(false);
    expect(v.additional_time_info().isValidSync(long)).toBe(false);
    expect(v.saturday_start_hour().isValidSync(long)).toBe(false);
  });

  it("accepts exactly 255 chars", () => {
    expect(v.vacant_name().isValidSync("a".repeat(255))).toBe(true);
  });

  it("leaves description-like fields unbounded", () => {
    const long = "a".repeat(1000);
    expect(v.activities().isValidSync(long)).toBe(true);
    expect(v.observations().isValidSync(long)).toBe(true);
    expect(v.compensations().isValidSync(long)).toBe(true);
  });
});
