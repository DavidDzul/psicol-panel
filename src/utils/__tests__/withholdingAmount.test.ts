import { describe, expect, it } from "vitest";
import {
  computeResultingFinal,
  computeWithheld,
  isWithholdingInputValid,
} from "@/utils/withholdingAmount";

describe("computeWithheld", () => {
  it("computes a percentage withholding against the due amount", () => {
    expect(computeWithheld("percentage", 20, 1000)).toBe(200);
  });

  it("clamps a percentage above 100 to 100", () => {
    expect(computeWithheld("percentage", 150, 1000)).toBe(1000);
  });

  it("clamps a negative percentage to 0", () => {
    expect(computeWithheld("percentage", -10, 1000)).toBe(0);
  });

  it("computes a fixed withholding amount", () => {
    expect(computeWithheld("fixed", 300, 1000)).toBe(300);
  });

  it("clamps a fixed amount above the due amount to the due amount", () => {
    expect(computeWithheld("fixed", 1500, 1000)).toBe(1000);
  });

  it("clamps a negative fixed amount to 0", () => {
    expect(computeWithheld("fixed", -50, 1000)).toBe(0);
  });

  it("treats a null value as 0", () => {
    expect(computeWithheld("percentage", null, 1000)).toBe(0);
    expect(computeWithheld("fixed", null, 1000)).toBe(0);
  });

  it("rounds a percentage result to 2 decimals", () => {
    expect(computeWithheld("percentage", 33.33, 100)).toBe(33.33);
  });
});

describe("computeResultingFinal", () => {
  it("subtracts the withheld amount from the due amount (percentage)", () => {
    expect(computeResultingFinal("percentage", 20, 1000)).toBe(800);
  });

  it("subtracts the withheld amount from the due amount (fixed)", () => {
    expect(computeResultingFinal("fixed", 300, 1000)).toBe(700);
  });

  it("floors at 0 when a fixed amount is clamped to the full due amount", () => {
    expect(computeResultingFinal("fixed", 5000, 1000)).toBe(0);
  });
});

describe("isWithholdingInputValid", () => {
  it("rejects a null value", () => {
    expect(isWithholdingInputValid("percentage", null, 1000)).toBe(false);
  });

  it("rejects a zero or negative value", () => {
    expect(isWithholdingInputValid("fixed", 0, 1000)).toBe(false);
    expect(isWithholdingInputValid("fixed", -10, 1000)).toBe(false);
  });

  it("rejects a percentage above 100", () => {
    expect(isWithholdingInputValid("percentage", 101, 1000)).toBe(false);
  });

  it("accepts a percentage of exactly 100", () => {
    expect(isWithholdingInputValid("percentage", 100, 1000)).toBe(true);
  });

  it("rejects a fixed amount above the due amount", () => {
    expect(isWithholdingInputValid("fixed", 1001, 1000)).toBe(false);
  });

  it("accepts a fixed amount equal to the due amount", () => {
    expect(isWithholdingInputValid("fixed", 1000, 1000)).toBe(true);
  });

  it("accepts a valid percentage and a valid fixed amount", () => {
    expect(isWithholdingInputValid("percentage", 20, 1000)).toBe(true);
    expect(isWithholdingInputValid("fixed", 300, 1000)).toBe(true);
  });
});
