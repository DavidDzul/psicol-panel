import type { BulkRefrendRow } from "@/interfaces/scholarship";
import { canPedagogia } from "@/utils/refrendActionability";

// ── Generación grouping (Pedagogía case board) ───────────────────────────────
//
// Frontend-only grouping of the flat bulk-refrend response. Backend already
// returns `snapshot_generation` per row and the full set is client-loaded,
// so a grouped API shape adds no value (design ADR D3).

export interface RefrendGenerationGroup {
  generation: string;
  rows: BulkRefrendRow[];
}

const UNKNOWN_GENERATION_LABEL = "Sin generación";

/**
 * Groups rows by `snapshot_generation`, sorted ascending by generación label.
 * Within each group, rows are sorted actionable-first (per `canPedagogia`)
 * to surface cases that need attention at the top of each section.
 * A generación with no rows in the input simply produces no group entry
 * (spec: "Empty generación group is omitted").
 */
export const groupRowsByGeneration = (
  rows: BulkRefrendRow[],
): RefrendGenerationGroup[] => {
  const byGeneration = new Map<string, BulkRefrendRow[]>();

  for (const row of rows) {
    const key = row.refrend.snapshot_generation ?? UNKNOWN_GENERATION_LABEL;
    const bucket = byGeneration.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      byGeneration.set(key, [row]);
    }
  }

  return Array.from(byGeneration.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es-MX"))
    .map(([generation, groupRows]) => ({
      generation,
      rows: [...groupRows].sort(
        (a, b) =>
          Number(canPedagogia(b.refrend)) - Number(canPedagogia(a.refrend)),
      ),
    }));
};
