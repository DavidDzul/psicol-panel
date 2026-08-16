import { describe, expect, it } from "vitest";
import {
  calculateTotalToPay,
  isSelectionValid,
  MAX_PAYABLE_WITHHOLDINGS,
  type WithholdingSelectionRow,
} from "@/utils/withholdingSelection";

const row = (overrides: Partial<WithholdingSelectionRow> = {}): WithholdingSelectionRow => ({
  id: 1,
  selected: false,
  amount: null,
  remainingAmount: 300,
  ...overrides,
});

describe("calculateTotalToPay", () => {
  it("sums only the selected rows' amounts", () => {
    const rows = [
      row({ id: 1, selected: true, amount: 300 }),
      row({ id: 2, selected: false, amount: 150 }),
      row({ id: 3, selected: true, amount: 200 }),
    ];

    expect(calculateTotalToPay(rows)).toBe(500);
  });

  it("recalculates to 0 when nothing is selected", () => {
    const rows = [row({ selected: false, amount: 300 })];

    expect(calculateTotalToPay(rows)).toBe(0);
  });

  it("recalculates after deselecting a previously selected row", () => {
    const rows = [
      row({ id: 1, selected: true, amount: 300 }),
      row({ id: 2, selected: true, amount: 200 }),
    ];
    expect(calculateTotalToPay(rows)).toBe(500);

    rows[0].selected = false;
    expect(calculateTotalToPay(rows)).toBe(200);
  });

  it("recalculates after editing a selected row's amount", () => {
    const rows = [row({ id: 1, selected: true, amount: 300 })];
    expect(calculateTotalToPay(rows)).toBe(300);

    rows[0].amount = 120;
    expect(calculateTotalToPay(rows)).toBe(120);
  });

  it("treats a null amount on a selected row as 0", () => {
    const rows = [row({ selected: true, amount: null })];

    expect(calculateTotalToPay(rows)).toBe(0);
  });
});

describe("isSelectionValid", () => {
  it("rejects an empty selection", () => {
    const rows = [row({ selected: false, amount: 300 })];

    expect(isSelectionValid(rows)).toBe(false);
  });

  it("accepts a single fully selected row with a valid amount", () => {
    const rows = [row({ selected: true, amount: 300, remainingAmount: 300 })];

    expect(isSelectionValid(rows)).toBe(true);
  });

  it("rejects a selected row whose amount exceeds its remaining balance", () => {
    const rows = [row({ selected: true, amount: 400, remainingAmount: 300 })];

    expect(isSelectionValid(rows)).toBe(false);
  });

  it("rejects a selected row with a zero or negative amount", () => {
    expect(isSelectionValid([row({ selected: true, amount: 0 })])).toBe(false);
    expect(isSelectionValid([row({ selected: true, amount: -10 })])).toBe(false);
  });

  it("rejects a selected row with a null amount", () => {
    expect(isSelectionValid([row({ selected: true, amount: null })])).toBe(false);
  });

  it("accepts a valid partial selection among multiple rows", () => {
    const rows = [
      row({ id: 1, selected: true, amount: 150, remainingAmount: 300 }),
      row({ id: 2, selected: false, amount: null, remainingAmount: 150 }),
    ];

    expect(isSelectionValid(rows)).toBe(true);
  });

  it("rejects if any selected row (not just the first) is invalid", () => {
    const rows = [
      row({ id: 1, selected: true, amount: 100, remainingAmount: 300 }),
      row({ id: 2, selected: true, amount: 999, remainingAmount: 150 }),
    ];

    expect(isSelectionValid(rows)).toBe(false);
  });

  it(`accepts exactly ${MAX_PAYABLE_WITHHOLDINGS} valid selected rows`, () => {
    const rows = [
      row({ id: 1, selected: true, amount: 100, remainingAmount: 300 }),
      row({ id: 2, selected: true, amount: 150, remainingAmount: 150 }),
    ];

    expect(isSelectionValid(rows)).toBe(true);
  });

  it(`rejects a selection with more than ${MAX_PAYABLE_WITHHOLDINGS} valid rows`, () => {
    const rows = [
      row({ id: 1, selected: true, amount: 100, remainingAmount: 300 }),
      row({ id: 2, selected: true, amount: 150, remainingAmount: 150 }),
      row({ id: 3, selected: true, amount: 50, remainingAmount: 200 }),
    ];

    expect(isSelectionValid(rows)).toBe(false);
  });
});
