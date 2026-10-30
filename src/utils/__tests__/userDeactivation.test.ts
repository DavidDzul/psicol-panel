import { describe, expect, it } from "vitest";
import {
  buildDeactivationSummary,
  getCycleCutBlockedMessage,
  requiresDeactivationConfirmation,
} from "@/utils/userDeactivation";

describe("requiresDeactivationConfirmation", () => {
  const becario = { active: true, user_type: "BEC_ACTIVE" as const, has_scholarship_profile: true };

  it("is true for an active becario switched to inactive", () => {
    expect(requiresDeactivationConfirmation(becario, { active: false })).toBe(true);
  });

  it("is true for an active user holding a scholarship profile even if not BEC_ACTIVE", () => {
    expect(
      requiresDeactivationConfirmation(
        { active: true, user_type: "BEC_INACTIVE", has_scholarship_profile: true },
        { active: false },
      ),
    ).toBe(true);
  });

  it("is false when the user stays active", () => {
    expect(requiresDeactivationConfirmation(becario, { active: true })).toBe(false);
  });

  it("is false when the user was already inactive", () => {
    expect(requiresDeactivationConfirmation({ ...becario, active: false }, { active: false })).toBe(false);
  });

  it("is false for non-becarios", () => {
    expect(
      requiresDeactivationConfirmation(
        { active: true, user_type: "ADMIN" as never, has_scholarship_profile: false },
        { active: false },
      ),
    ).toBe(false);
  });
});

describe("buildDeactivationSummary", () => {
  it("returns null when there are no effects", () => {
    expect(buildDeactivationSummary(null)).toBeNull();
    expect(buildDeactivationSummary(undefined)).toBeNull();
    expect(
      buildDeactivationSummary({ withholdings_cancelled: 0, advance_months_cancelled: 0, overpaid_amount: "0.00" }),
    ).toBeNull();
  });

  it("summarizes withholdings and advance months with singular/plural", () => {
    expect(
      buildDeactivationSummary({ withholdings_cancelled: 1, advance_months_cancelled: 3, overpaid_amount: "0.00" }),
    ).toBe("Se canceló 1 retención pendiente y 3 meses de pago adelantado.");
    expect(
      buildDeactivationSummary({ withholdings_cancelled: 2, advance_months_cancelled: 1, overpaid_amount: "0.00" }),
    ).toBe("Se cancelaron 2 retenciones pendientes y 1 mes de pago adelantado.");
  });

  it("mentions only the non-zero part", () => {
    expect(
      buildDeactivationSummary({ withholdings_cancelled: 2, advance_months_cancelled: 0, overpaid_amount: "0.00" }),
    ).toBe("Se cancelaron 2 retenciones pendientes.");
    expect(
      buildDeactivationSummary({ withholdings_cancelled: 0, advance_months_cancelled: 2, overpaid_amount: "0.00" }),
    ).toBe("Se cancelaron 2 meses de pago adelantado.");
  });

  it("appends the overpaid amount to recover when positive", () => {
    expect(
      buildDeactivationSummary({ withholdings_cancelled: 0, advance_months_cancelled: 2, overpaid_amount: "5000.00" }),
    ).toBe("Se cancelaron 2 meses de pago adelantado. Sobrepago a recuperar: $5,000.00.");
  });
});

describe("getCycleCutBlockedMessage", () => {
  const conflict = (data: unknown) => ({ isAxiosError: true, response: { status: 409, data } });

  it("returns the API msg for a 409 CYCLE_CUT_BLOCKED", () => {
    expect(
      getCycleCutBlockedMessage(conflict({ res: false, msg: "No se puede: 11/2026 pagado.", code: "CYCLE_CUT_BLOCKED" })),
    ).toBe("No se puede: 11/2026 pagado.");
  });

  it("returns null for other statuses or codes", () => {
    expect(getCycleCutBlockedMessage({ isAxiosError: true, response: { status: 422, data: { code: "CYCLE_CUT_BLOCKED", msg: "x" } } })).toBeNull();
    expect(getCycleCutBlockedMessage(conflict({ code: "OTHER", msg: "x" }))).toBeNull();
    expect(getCycleCutBlockedMessage(new Error("boom"))).toBeNull();
  });

  it("returns a generic message when msg is missing", () => {
    expect(getCycleCutBlockedMessage(conflict({ code: "CYCLE_CUT_BLOCKED" }))).toBe(
      "No se pudo desactivar al usuario porque tiene pagos posteriores pagados o bloqueados.",
    );
  });
});
