import type { RefrendStatus, ScholarshipRefrend } from "@/interfaces/scholarship";

// ── Shared refrend actionability (single source of truth) ───────────────────
//
// Every surface that renders a refrend row (Atención table, Pedagogía card,
// the shared detail drawer) MUST derive lock/action state from these
// predicates instead of re-implementing its own workflow_status check.
// See design ADR D5 (sdd/scholarship-payment-flow-ux).

export const LOCKED_STATUSES = new Set<RefrendStatus>([
  "PAID",
  "AUTHORIZED",
  "CANCELLED",
]);

/**
 * A refrend is locked if either the legacy `status` field is one of the
 * terminal legacy statuses, OR the new `workflow_status` has reached
 * `CLOSED`. Both fields must be considered — neither alone is authoritative
 * during the dual state-machine migration.
 */
export const isLocked = (refrend: ScholarshipRefrend): boolean =>
  LOCKED_STATUSES.has(refrend.status) || refrend.workflow_status === "CLOSED";

/** Atención may act on a row while it is still DRAFT or CON_INCIDENCIA. */
export const canAtencion = (refrend: ScholarshipRefrend): boolean =>
  !isLocked(refrend) &&
  (refrend.workflow_status === "DRAFT" ||
    refrend.workflow_status === "CON_INCIDENCIA");

/**
 * The amount actually due this month, mirroring
 * RecordPaymentSituationAction's $dueAmount formula exactly: gross snapshot
 * with the active profile discount applied, falling back to base_amount when
 * snapshot_gross_amount isn't set (legacy rows). NOT refrend.final_amount —
 * that field carries whatever the last-applied resolution set it to (e.g. a
 * prior RETENIDA), and re-resolving from a stale display value would show an
 * amount the backend is about to overwrite with a different one.
 */
export const computeDueAmount = (refrend: ScholarshipRefrend): number => {
  const gross = Number(refrend.snapshot_gross_amount ?? refrend.base_amount);
  const academicPct = Number(refrend.snapshot_discount_percentage ?? 0);
  return Math.round(gross * (1 - academicPct / 100) * 100) / 100;
};

/** Pedagogía may act on a row only while it carries an open incidencia. */
export const canPedagogia = (refrend: ScholarshipRefrend): boolean =>
  !isLocked(refrend) && refrend.workflow_status === "CON_INCIDENCIA";

/** Recording a payment situation is allowed for any unlocked row. */
export const canRecordSituation = (refrend: ScholarshipRefrend): boolean =>
  !isLocked(refrend);

/**
 * The "Retener refrendo" secondary action must hide only when the refrend
 * carries a TOTAL withholding (`final_amount === 0`). A PARTIAL withholding
 * (`final_amount > 0`) behaves like a normal refrend and still shows the
 * action — see design v3 §7 / Architecture Decisions.
 */
export const isFullyWithheld = (refrend: ScholarshipRefrend): boolean =>
  refrend.status === "WITHHELD" && Number(refrend.final_amount) === 0;
