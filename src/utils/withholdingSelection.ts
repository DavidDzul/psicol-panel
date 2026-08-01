// ── Pago meses retenidos — selección de retenciones pendientes ─────────────
//
// Extracted out of `SituationPagoMesesDialog.vue` so the total/validity
// calculation is a pure, unit-testable function instead of logic buried
// inside a `<script setup>` computed that only a full component mount could
// exercise (same rationale as `useSituationMenuItems.ts` — `@vue/test-utils`
// isn't installed in this project).

export interface WithholdingSelectionRow {
  id: number
  selected: boolean
  amount: number | null
  remainingAmount: number
}

/** Sums `amount` across selected rows — recalculates on any selection or edit. */
export function calculateTotalToPay(rows: WithholdingSelectionRow[]): number {
  return rows
    .filter((row) => row.selected)
    .reduce((total, row) => total + (row.amount ?? 0), 0)
}

/**
 * At least one row selected, and every selected row's amount is a positive
 * number that does not exceed its remaining balance.
 */
export function isSelectionValid(rows: WithholdingSelectionRow[]): boolean {
  const selected = rows.filter((row) => row.selected)
  if (selected.length === 0) return false

  return selected.every(
    (row) => row.amount != null && row.amount > 0 && row.amount <= row.remainingAmount
  )
}
