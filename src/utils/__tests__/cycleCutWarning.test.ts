import { describe, expect, it } from "vitest";
import { buildCycleCutAdvanceWarning, buildCycleCutWithholdingWarning } from "@/utils/cycleCutWarning";
import type {
  CycleCutPreview,
  CycleCutPreviewMonth,
  CycleCutPreviewOrigin,
  CycleCutWithholdingRow,
} from "@/interfaces/scholarship";

const month = (y: number, m: number, originM = 3, originY = 2026): CycleCutPreviewMonth => ({
  period_year: y,
  period_month: m,
  amount: "2500.00",
  is_cut_month: false,
  origin_period_year: originY,
  origin_period_month: originM,
});

const origin = (over: Partial<CycleCutPreviewOrigin> = {}): CycleCutPreviewOrigin => ({
  origin_period_year: 2026,
  origin_period_month: 3,
  origin_paid: true,
  cancelled_amount: "5000.00",
  overpaid_amount: "5000.00",
  advance_payment_reduction: "0.00",
  ...over,
});

const preview = (months: CycleCutPreviewMonth[], origins: CycleCutPreviewOrigin[] = [origin()]): CycleCutPreview => ({
  reason: "BAJA_DEFINITIVA",
  can_cut: true,
  blockers: [],
  advance: {
    months,
    origins,
    cancelled_amount: "5000.00",
    overpaid_amount: "5000.00",
    advance_payment_reduction: "0.00",
  },
});

describe("buildCycleCutAdvanceWarning", () => {
  it("returns null for a null preview or empty months (S50)", () => {
    expect(buildCycleCutAdvanceWarning(null)).toBeNull();
    expect(buildCycleCutAdvanceWarning(preview([]))).toBeNull();
  });

  it("builds the exact paid text (S48)", () => {
    expect(buildCycleCutAdvanceWarning(preview([month(2026, 4), month(2026, 5)]))).toBe(
      "Al confirmar se cancelarán los meses adelantados abril y mayo. Como el pago de marzo ya se realizó, quedará registrado un sobrepago de $5,000.00 que administración deberá recuperar.",
    );
  });

  it("builds the exact unpaid text (S49)", () => {
    const p = preview(
      [month(2026, 4), month(2026, 5)],
      [origin({ origin_paid: false, overpaid_amount: "0.00", advance_payment_reduction: "5000.00" })],
    );
    expect(buildCycleCutAdvanceWarning(p)).toBe(
      "Al confirmar se cancelarán los meses adelantados abril y mayo. Como el pago de marzo aún no se realiza, se descontarán $5,000.00 del pago adelantado de ese mes.",
    );
  });

  it("uses singular wording for a single month", () => {
    const p = preview([month(2026, 4)], [origin({ overpaid_amount: "2500.00" })]);
    expect(buildCycleCutAdvanceWarning(p)).toBe(
      "Al confirmar se cancelará el mes adelantado abril. Como el pago de marzo ya se realizó, quedará registrado un sobrepago de $2,500.00 que administración deberá recuperar.",
    );
  });

  it("joins three or more months as 'a, b y c'", () => {
    const text = buildCycleCutAdvanceWarning(preview([month(2026, 4), month(2026, 5), month(2026, 6)]));
    expect(text).toContain("los meses adelantados abril, mayo y junio.");
  });

  it("sorts months and appends the year only when they span several years", () => {
    const p = preview([month(2027, 1), month(2026, 12)], [origin({ origin_period_month: 11 })]);
    const text = buildCycleCutAdvanceWarning(p) as string;
    expect(text).toContain("los meses adelantados diciembre de 2026 y enero de 2027.");
    expect(text).toContain("el pago de noviembre de 2026 ya se realizó");
  });

  it("emits one sentence per origin when several are affected", () => {
    const p = preview(
      [month(2026, 4, 3), month(2026, 6, 5)],
      [
        origin(),
        origin({ origin_period_month: 5, origin_paid: false, overpaid_amount: "0.00", advance_payment_reduction: "2500.00" }),
      ],
    );
    const text = buildCycleCutAdvanceWarning(p) as string;
    expect(text).toContain("Como el pago de marzo ya se realizó");
    expect(text).toContain("Como el pago de mayo aún no se realiza, se descontarán $2,500.00 del pago adelantado de ese mes.");
  });
});

describe("buildCycleCutWithholdingWarning", () => {
  const w = (over: Partial<CycleCutWithholdingRow> = {}): CycleCutWithholdingRow => ({
    id: 1,
    period_year: 2026,
    period_month: 8,
    withheld_amount: "1000.00",
    paid_amount: "250.00",
    remaining_amount: "750.00",
    is_current_refrend: false,
    ...over,
  });

  const withW = (rows: CycleCutWithholdingRow[], total = "750.00"): CycleCutPreview => ({
    ...preview([]),
    withholdings_to_cancel: { rows, total_remaining: total },
  });

  it("returns null for a null preview, a missing key, or no rows (S14)", () => {
    expect(buildCycleCutWithholdingWarning(null)).toBeNull();
    expect(buildCycleCutWithholdingWarning(preview([]))).toBeNull();
    expect(buildCycleCutWithholdingWarning(withW([], "0.00"))).toBeNull();
  });

  it("builds the exact copy, rows (oldest first) and total", () => {
    const result = buildCycleCutWithholdingWarning(
      withW(
        [
          w({ id: 2, period_month: 9, remaining_amount: "500.00", is_current_refrend: true }),
          w({ id: 1, period_month: 8, remaining_amount: "750.00" }),
        ],
        "1250.00",
      ),
    );
    expect(result).toEqual({
      text: "Al confirmar se cancelarán las retenciones pendientes de este becario. Esta acción no se puede deshacer.",
      rows: [
        { id: 1, label: "Agosto 2026", amount: "$750.00", isCurrent: false },
        { id: 2, label: "Septiembre 2026", amount: "$500.00", isCurrent: true },
      ],
      total: "$1,250.00",
    });
  });
});
