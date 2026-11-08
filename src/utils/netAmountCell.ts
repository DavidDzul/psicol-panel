import type { NetBreakdown } from "@/interfaces/scholarship";

export type NetComponent = "beca" | "apoyo" | "pago_iu";

export interface NetAmountCell {
  /** Net amount to show as the primary value; null renders as "—". */
  net: string | null;
  /** Pre-discount amount for the secondary caption; null when not worth showing. */
  nominal: string | null;
}

const EMPTY: NetAmountCell = { net: null, nominal: null };

/**
 * Display model for one Beca / Apoyo / Pago IU cell: the NET amount computed
 * by the API (net_breakdown) with the nominal as a secondary caption. The
 * client never derives these from snapshot columns. A missing breakdown
 * (endpoints that do not carry it) yields nulls so the cell renders "—".
 */
export function netAmountCell(
  breakdown: NetBreakdown | null | undefined,
  component: NetComponent,
): NetAmountCell {
  if (!breakdown) return EMPTY;
  const net = breakdown[component];
  const nominal = breakdown.nominal[component];
  if (Number(net) === 0 && Number(nominal) === 0) return EMPTY;
  return {
    net,
    nominal: Number(nominal) !== Number(net) ? nominal : null,
  };
}
