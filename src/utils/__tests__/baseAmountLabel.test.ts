import { describe, expect, it } from "vitest";

import { baseAmountLabel } from "@/utils/baseAmountLabel";

describe("baseAmountLabel", () => {
  it.each([
    ["IU", "Beca"],
    ["TELMEX_IU", "Pago IU"],
    ["TELMEX", "Beca"],
  ] as const)("labels the %s base amount as %s", (type, label) => {
    expect(baseAmountLabel(type)).toBe(label);
  });

  it("falls back to Beca when the type is missing", () => {
    expect(baseAmountLabel(null)).toBe("Beca");
    expect(baseAmountLabel(undefined)).toBe("Beca");
  });
});
