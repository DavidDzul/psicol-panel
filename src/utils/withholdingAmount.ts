// ── Withholding amount math (shared by RETENIDA and DESCUENTO_DEFINITIVO) ──
//
// Extracted out of `SituationRetenidaDialog.vue` so both dialogs compute the
// discounted amount identically — mirrors the backend's
// `applyWithholdingDiscount()` extraction (sdd/retencion-no-recuperable).
// Percentage/fixed clamping rules are unchanged from the original inline
// implementation.

export type WithholdingMode = "percentage" | "fixed";

/** Amount withheld/discounted against `dueAmount`, clamped to a sane range. */
export const computeWithheld = (
  mode: WithholdingMode,
  value: number | null,
  dueAmount: number,
): number => {
  const raw = value ?? 0;
  if (mode === "fixed") {
    return Math.min(dueAmount, Math.max(0, raw));
  }
  const pct = Math.min(100, Math.max(0, raw));
  return Math.round(dueAmount * (pct / 100) * 100) / 100;
};

/** `dueAmount` minus the computed withheld/discounted amount. */
export const computeResultingFinal = (
  mode: WithholdingMode,
  value: number | null,
  dueAmount: number,
): number =>
  Math.round((dueAmount - computeWithheld(mode, value, dueAmount)) * 100) / 100;

/** Percentage ≤ 100 / fixed amount ≤ dueAmount, mirrors backend validation. */
export const isWithholdingInputValid = (
  mode: WithholdingMode,
  value: number | null,
  dueAmount: number,
): boolean => {
  if (value == null || value <= 0) return false;
  if (mode === "percentage" && value > 100) return false;
  if (mode === "fixed" && value > dueAmount) return false;
  return true;
};
