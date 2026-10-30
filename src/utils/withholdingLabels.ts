import { MONTHS_ES } from "@/composables/useRefrendTableDisplay";
import type { ScholarshipWithholding, WithholdingCancellationReason } from "@/interfaces/scholarship";

// sdd/retenciones-pendientes S7 (R7.2): Spanish labels for the person-level
// withholdings card. Legacy CANCELLED rows have a NULL reason (decision #2142).

export const NO_REASON_LABEL = "Sin motivo registrado";

const REASON_LABELS: Record<WithholdingCancellationReason, string> = {
  CYCLE_CUT: "Cierre de ciclo",
  EGRESO_RETICULA: "Egreso por retícula",
  USER_DEACTIVATED: "Usuario desactivado",
  RECLASSIFIED: "Reclasificación",
};

export const cancellationReasonLabel = (reason: string | null | undefined): string =>
  (reason && REASON_LABELS[reason as WithholdingCancellationReason]) || NO_REASON_LABEL;

const STATUS_CHIPS: Record<ScholarshipWithholding["status"], { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "warning" },
  PAID: { label: "Pagada", color: "success" },
  CANCELLED: { label: "Cancelada", color: "error" },
};

export const withholdingStatusChip = (
  status: ScholarshipWithholding["status"],
): { label: string; color: string } => STATUS_CHIPS[status];

export const formatCancelledAt = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

export const withholdingPeriodLabel = (w: Pick<ScholarshipWithholding, "period_year" | "period_month">): string =>
  `${MONTHS_ES[w.period_month - 1] ?? w.period_month} ${w.period_year}`;
