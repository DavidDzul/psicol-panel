import type { BulkRefrendRow } from "@/interfaces/scholarship";

// ── Pedagogía bulk-close ("Cerrar refrendo") ──────────────────────────────────
//
// Ported VERBATIM from `PedagogiaRefrendTable.vue`'s original `cleanDraftIds`
// computed (design ADR — flagged as the single highest-risk correctness
// point in this change). Extracted to a pure function so behavior can be
// unit-tested directly, independent of the Vue component that calls it.
//
// `rows` MUST be the store's unfiltered `incidenciasRows` (not the
// incidents_count > 0 filtered display rows) — a "clean" row by definition
// has `incidents_count === 0`, so it would never appear in the filtered set.
// "Limpio" = DRAFT, no formal incidencia, AND no silent attendance discount
// already applied (retardos/falta discounts apply directly without creating
// an incidencia — see AttendancePenaltyService on the backend), so this
// never auto-approves a row that actually carries an unreviewed discount.

export const getCleanDraftIds = (rows: BulkRefrendRow[]): number[] =>
  rows
    .filter(
      (r) =>
        r.refrend.workflow_status === "DRAFT" &&
        r.incidents_count === 0 &&
        !r.has_falta_discount &&
        !r.has_retardos_discount &&
        r.month_absent === 0 &&
        r.semester_lates_unconsumed < 2,
    )
    .map((r) => r.refrend.id);
