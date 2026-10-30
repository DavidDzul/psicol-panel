import type { BulkRefrendRow } from "@/interfaces/scholarship";

// Pure helpers for the "revertir pago adelantado" action
// (sdd/revertir-pago-adelantado). The API computes `advance_revert_block`
// (first failing eligibility code) in batch; the panel only derives the
// button state and the Spanish copy from it. Copy addresses IU admin staff
// with "tú".

type RevertRow = Partial<Pick<BulkRefrendRow, "active_advance" | "advance_revert_block">>;

const REVERT_MESSAGES: Record<string, string> = {
  ADVANCE_NOT_FOUND: "Este refrendo no tiene un pago adelantado activo.",
  ADVANCE_CYCLE_CLOSED: "No puedes revertir: el ciclo de la beca ya se cerró.",
  ADVANCE_ORIGIN_PAID: "No puedes revertir: el refrendo de origen ya se pagó.",
  ADVANCE_ORIGIN_LOCKED:
    "No puedes revertir: el refrendo de origen está bloqueado o ya está en un lote de pago.",
  ADVANCE_MONTH_SETTLED:
    "No puedes revertir: alguno de los meses adelantados ya se resolvió.",
  ADVANCE_FUTURE_TELMEX_COVERED:
    "No puedes revertir: alguno de los meses adelantados está cubierto por Telmex.",
  ADVANCE_FUTURE_NOT_PRISTINE:
    "No puedes revertir: alguno de los meses adelantados ya tiene incidencias, descuentos o ajustes.",
  ADVANCE_CHAINED_FORBIDDEN:
    "No puedes registrar un pago adelantado desde un mes que ya forma parte de otro pago adelantado.",
  ADVANCE_STATE_CHANGED:
    "El pago adelantado cambió mientras lo revisabas. Actualiza la tabla e inténtalo de nuevo.",
};

const GENERIC_MESSAGE = "No se pudo revertir el pago adelantado.";
const REVERT_TOOLTIP = "Revertir el pago adelantado";

export const canRevert = (row: RevertRow): boolean =>
  row.active_advance != null && row.advance_revert_block == null;

export const advanceRevertMessage = (code?: string | null): string =>
  (code ? REVERT_MESSAGES[code] : undefined) ?? GENERIC_MESSAGE;

/** Tooltip for the revert button; null when the row has no advance to revert. */
export const advanceRevertTooltip = (row: RevertRow): string | null => {
  if (row.active_advance == null) return null;
  if (canRevert(row)) return REVERT_TOOLTIP;
  return advanceRevertMessage(row.advance_revert_block);
};

export const useAdvanceRevert = () => ({
  canRevert,
  advanceRevertMessage,
  advanceRevertTooltip,
});
