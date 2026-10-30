import { describe, expect, it } from "vitest";
import {
  cancellationReasonLabel,
  withholdingPeriodLabel,
  withholdingStatusChip,
} from "@/utils/withholdingLabels";

describe("cancellationReasonLabel", () => {
  it.each([
    ["CYCLE_CUT", "Cierre de ciclo"],
    ["EGRESO_RETICULA", "Egreso por retícula"],
    ["USER_DEACTIVATED", "Usuario desactivado"],
    ["RECLASSIFIED", "Reclasificación"],
  ] as const)("maps %s to %s", (reason, label) => {
    expect(cancellationReasonLabel(reason)).toBe(label);
  });

  it("falls back to a neutral label for legacy NULL reasons", () => {
    expect(cancellationReasonLabel(null)).toBe("Sin motivo registrado");
    expect(cancellationReasonLabel(undefined)).toBe("Sin motivo registrado");
  });

  it("falls back to the neutral label for an unknown reason code", () => {
    expect(cancellationReasonLabel("SOMETHING_NEW")).toBe("Sin motivo registrado");
  });
});

describe("withholdingStatusChip", () => {
  it("returns Spanish labels per status", () => {
    expect(withholdingStatusChip("PENDING").label).toBe("Pendiente");
    expect(withholdingStatusChip("PAID").label).toBe("Pagada");
    expect(withholdingStatusChip("CANCELLED").label).toBe("Cancelada");
  });
});

describe("withholdingPeriodLabel", () => {
  it("renders month name and year", () => {
    expect(withholdingPeriodLabel({ period_year: 2026, period_month: 3 })).toBe("Marzo 2026");
  });
});
