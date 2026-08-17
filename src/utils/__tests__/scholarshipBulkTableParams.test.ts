import { describe, expect, it } from "vitest";
import { buildBulkTableParams } from "@/utils/scholarshipBulkTableParams";

// Design D4 (boolean-serialization trap): Laravel's `boolean` rule rejects
// the literal string "false"; axios drops `undefined` params entirely. This
// single builder is shared by both the Pedagogía ("completa") and Atención
// ("incidencias") call sites in ScholarshipRefrendsView.vue — see 2.5's
// resolution that both listings hit the same `bulk-table` endpoint.

const base = {
  year: 2026,
  month: 8,
  campus: "MERIDA",
  generationId: 3,
  requireGeneration: true,
  advancePaymentOnly: false,
};

describe("buildBulkTableParams — advance_payment_eligible serialization", () => {
  it("omits advance_payment_eligible entirely when the filter is off", () => {
    const params = buildBulkTableParams(base);

    expect(params.advance_payment_eligible).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(params, "advance_payment_eligible")).toBe(true);
    // Explicit guard: never the JS boolean `false` and never the string "false".
    expect(params.advance_payment_eligible).not.toBe(false);
    expect(params.advance_payment_eligible as unknown).not.toBe("false");
  });

  it("sends 1 (never the boolean true) when the filter is on", () => {
    const params = buildBulkTableParams({ ...base, advancePaymentOnly: true });

    expect(params.advance_payment_eligible).toBe(1);
    expect(params.advance_payment_eligible as unknown).not.toBe(true);
  });

  it("wires the same param for Pedagogía (requireGeneration: true, generación set)", () => {
    const params = buildBulkTableParams({
      ...base,
      requireGeneration: true,
      generationId: 7,
      advancePaymentOnly: true,
    });

    expect(params.generation_id).toBe(7);
    expect(params.advance_payment_eligible).toBe(1);
  });

  it("wires the same param for Atención (requireGeneration: false, no generación)", () => {
    const params = buildBulkTableParams({
      ...base,
      requireGeneration: false,
      generationId: null,
      advancePaymentOnly: true,
    });

    expect(params.generation_id).toBeNull();
    expect(params.advance_payment_eligible).toBe(1);
  });

  it("defaults per_page to 500 and forwards year/month/campus unchanged", () => {
    const params = buildBulkTableParams(base);

    expect(params.per_page).toBe(500);
    expect(params.year).toBe(2026);
    expect(params.month).toBe(8);
    expect(params.campus).toBe("MERIDA");
  });
});
