import type { BulkTableParams } from "@/interfaces/scholarship";

// Shared by both the Pedagogía and Atención listings in
// ScholarshipRefrendsView.vue — they call the exact same `bulk-table`
// endpoint (see design D-note on RefrendBulkQueryService), so a single
// param builder keeps the two call sites from drifting.
//
// D4 (boolean-serialization trap): Laravel's `boolean` validation rule
// rejects the literal string "false". Axios drops `undefined` params from
// the query string entirely, so the filter must be sent as `1` when active
// or omitted (never the JS boolean `false`) when inactive.
export interface BuildBulkTableParamsInput {
  year: number;
  month: number;
  campus: string;
  generationId: number | null;
  requireGeneration: boolean;
  advancePaymentOnly: boolean;
  perPage?: number;
}

export function buildBulkTableParams(
  input: BuildBulkTableParamsInput,
): BulkTableParams {
  return {
    year: input.year,
    month: input.month,
    campus: input.campus,
    generation_id: input.requireGeneration ? input.generationId : null,
    advance_payment_eligible: input.advancePaymentOnly ? 1 : undefined,
    per_page: input.perPage ?? 500,
  };
}
