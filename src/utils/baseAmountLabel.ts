import type { ScholarshipType } from "@/interfaces/scholarship";

/**
 * UI label for a refrend's `base_amount`, by scholarship type: the monthly
 * Beca for IU and TELMEX, the IU payment for TELMEX_IU (see
 * ScholarshipCalculationService::buildSnapshot()). Falls back to "Beca".
 */
export function baseAmountLabel(
  scholarshipType: ScholarshipType | null | undefined,
): string {
  return scholarshipType === "TELMEX_IU" ? "Pago IU" : "Beca";
}
