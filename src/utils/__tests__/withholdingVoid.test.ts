import { describe, expect, it } from "vitest";
import { hasPaymentHistory, isVoidReasonValid, MIN_VOID_REASON_LENGTH } from "../withholdingVoid";

describe("hasPaymentHistory", () => {
  it("returns true when paid amount is greater than zero", () => {
    expect(hasPaymentHistory(150)).toBe(true);
  });

  it("returns false when paid amount is zero", () => {
    expect(hasPaymentHistory(0)).toBe(false);
  });

  it("returns false for a negative paid amount (defensive)", () => {
    expect(hasPaymentHistory(-5)).toBe(false);
  });
});

describe("isVoidReasonValid", () => {
  it(`rejects a reason shorter than ${MIN_VOID_REASON_LENGTH} characters`, () => {
    expect(isVoidReasonValid("corto")).toBe(false);
  });

  it(`accepts a reason with exactly ${MIN_VOID_REASON_LENGTH} characters`, () => {
    expect(isVoidReasonValid("a".repeat(MIN_VOID_REASON_LENGTH))).toBe(true);
  });

  it("rejects a reason that is only whitespace padding around a short string", () => {
    expect(isVoidReasonValid("   corto   ")).toBe(false);
  });

  it("accepts a reason long enough after trimming surrounding whitespace", () => {
    expect(isVoidReasonValid("   motivo suficientemente largo   ")).toBe(true);
  });

  it("rejects an empty reason", () => {
    expect(isVoidReasonValid("")).toBe(false);
  });
});
