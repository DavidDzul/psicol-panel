import { describe, expect, it } from "vitest";
import { netAmountCell } from "@/utils/netAmountCell";
import type { NetBreakdown } from "@/interfaces/scholarship";

const breakdown = (overrides: Partial<NetBreakdown> = {}): NetBreakdown => ({
  beca: "1545.45",
  apoyo: "154.55",
  pago_iu: "0.00",
  temporary_increase: "0.00",
  telmex_coverage: "0.00",
  pending_and_advance: "0.00",
  total: "1700.00",
  nominal: {
    beca: "1800.00",
    apoyo: "200.00",
    pago_iu: "0.00",
    temporary_increase: "0.00",
  },
  ...overrides,
});

describe("netAmountCell", () => {
  it("returns the net as primary and the nominal as caption when they differ", () => {
    expect(netAmountCell(breakdown(), "beca")).toEqual({
      net: "1545.45",
      nominal: "1800.00",
    });
    expect(netAmountCell(breakdown(), "apoyo")).toEqual({
      net: "154.55",
      nominal: "200.00",
    });
  });

  it("omits the caption when net equals nominal", () => {
    const nb = breakdown({
      beca: "1800.00",
      nominal: { beca: "1800.00", apoyo: "0.00", pago_iu: "0.00", temporary_increase: "0.00" },
    });
    expect(netAmountCell(nb, "beca")).toEqual({ net: "1800.00", nominal: null });
  });

  it("returns a null net for a component that is zero on both sides", () => {
    expect(netAmountCell(breakdown(), "pago_iu")).toEqual({ net: null, nominal: null });
  });

  it("keeps a zero net with its nominal caption when the discount wipes it out", () => {
    const nb = breakdown({
      beca: "0.00",
      nominal: { beca: "1800.00", apoyo: "0.00", pago_iu: "0.00", temporary_increase: "0.00" },
    });
    expect(netAmountCell(nb, "beca")).toEqual({ net: "0.00", nominal: "1800.00" });
  });

  it("returns nulls when the breakdown is absent", () => {
    expect(netAmountCell(undefined, "beca")).toEqual({ net: null, nominal: null });
    expect(netAmountCell(null, "apoyo")).toEqual({ net: null, nominal: null });
  });
});
