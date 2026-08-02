// ── Reversión de abonos — historial y validación del motivo ────────────────
//
// Extracted as pure functions (same rationale as withholdingSelection.ts and
// useSituationMenuItems.ts — @vue/test-utils isn't installed in this
// project) so the two PR4 UI rules are unit-testable without mounting
// SituationPagoMesesDialog.vue / VoidWithholdingPaymentDialog.vue.

export const MIN_VOID_REASON_LENGTH = 10

/**
 * The payment history toggle/list is shown only for a retention that has at
 * least one active (non-voided) payment applied — i.e. paid_amount > 0.
 */
export function hasPaymentHistory(paidAmount: number): boolean {
  return paidAmount > 0
}

/** Mirrors the backend's `void_reason` rule: required, trimmed, >= 10 chars. */
export function isVoidReasonValid(reason: string): boolean {
  return reason.trim().length >= MIN_VOID_REASON_LENGTH
}
