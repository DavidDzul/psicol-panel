import { describe, expect, it } from "vitest";
import {
  advanceRevertMessage,
  advanceRevertTooltip,
  canRevert,
  useAdvanceRevert,
} from "@/composables/useAdvanceRevert";
import type {
  ActiveAdvance,
  AdvanceRevertBlock,
} from "@/interfaces/scholarship";

const advance: ActiveAdvance = {
  id: 1,
  status: "ACTIVE",
  months_count: 2,
  total_amount: "2000.00",
  months: [
    { id: 10, period_year: 2026, period_month: 11, amount: "1000.00", status: "PENDING" },
    { id: 11, period_year: 2026, period_month: 12, amount: "1000.00", status: "PENDING" },
  ],
};

const row = (
  active_advance: ActiveAdvance | null,
  advance_revert_block: AdvanceRevertBlock | null,
) => ({ active_advance, advance_revert_block });

describe("canRevert", () => {
  it("is true with an active advance and no block", () => {
    expect(canRevert(row(advance, null))).toBe(true);
  });

  it("is false with an active advance that carries a block code", () => {
    expect(canRevert(row(advance, "ADVANCE_ORIGIN_PAID"))).toBe(false);
  });

  it("is false when the row has no active advance", () => {
    expect(canRevert(row(null, null))).toBe(false);
  });

  it("is false for rows from an older payload without the new fields", () => {
    expect(canRevert({})).toBe(false);
  });
});

describe("advanceRevertMessage", () => {
  const cases: Array<[string, string]> = [
    ["ADVANCE_NOT_FOUND", "Este refrendo no tiene un pago adelantado activo."],
    ["ADVANCE_CYCLE_CLOSED", "No puedes revertir: el ciclo de la beca ya se cerró."],
    ["ADVANCE_ORIGIN_PAID", "No puedes revertir: el refrendo de origen ya se pagó."],
    [
      "ADVANCE_ORIGIN_LOCKED",
      "No puedes revertir: el refrendo de origen está bloqueado o ya está en un lote de pago.",
    ],
    ["ADVANCE_MONTH_SETTLED", "No puedes revertir: alguno de los meses adelantados ya se resolvió."],
    [
      "ADVANCE_FUTURE_TELMEX_COVERED",
      "No puedes revertir: alguno de los meses adelantados está cubierto por Telmex.",
    ],
    [
      "ADVANCE_FUTURE_NOT_PRISTINE",
      "No puedes revertir: alguno de los meses adelantados ya tiene incidencias, descuentos o ajustes.",
    ],
    [
      "ADVANCE_CHAINED_FORBIDDEN",
      "No puedes registrar un pago adelantado desde un mes que ya forma parte de otro pago adelantado.",
    ],
    [
      "ADVANCE_STATE_CHANGED",
      "El pago adelantado cambió mientras lo revisabas. Actualiza la tabla e inténtalo de nuevo.",
    ],
  ];

  it.each(cases)("maps %s to its Spanish message (tú)", (code, expected) => {
    expect(advanceRevertMessage(code)).toBe(expected);
  });

  it("falls back to a generic message for unknown, null or undefined codes", () => {
    const generic = "No se pudo revertir el pago adelantado.";
    expect(advanceRevertMessage("SOMETHING_NEW")).toBe(generic);
    expect(advanceRevertMessage(null)).toBe(generic);
    expect(advanceRevertMessage(undefined)).toBe(generic);
  });
});

describe("advanceRevertTooltip", () => {
  it("is null when the row has no active advance (no button to explain)", () => {
    expect(advanceRevertTooltip(row(null, null))).toBeNull();
  });

  it("invites the action when revert is possible", () => {
    expect(advanceRevertTooltip(row(advance, null))).toBe("Revertir el pago adelantado");
  });

  it("explains the block when revert is not possible", () => {
    expect(advanceRevertTooltip(row(advance, "ADVANCE_ORIGIN_PAID"))).toBe(
      "No puedes revertir: el refrendo de origen ya se pagó.",
    );
  });
});

describe("useAdvanceRevert", () => {
  it("exposes the same helpers", () => {
    const api = useAdvanceRevert();
    expect(api.canRevert(row(advance, null))).toBe(true);
    expect(api.advanceRevertTooltip).toBe(advanceRevertTooltip);
    expect(api.advanceRevertMessage).toBe(advanceRevertMessage);
  });
});
