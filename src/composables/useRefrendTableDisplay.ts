import { campusMap } from "@/constants";
import type {
  BulkRefrendRow,
  ScholarshipRefrend,
} from "@/interfaces/scholarship";

// ── Currency formatting ──────────────────────────────────────────────────────

export const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

// ── Locked status ─────────────────────────────────────────────────────────────
//
// Single source of truth lives in `@/utils/refrendActionability` (design ADR
// D5). Re-exported here for backward compatibility with existing imports
// (e.g. `AprobacionRefrendTable.vue`) — do not re-implement this locally.

export { LOCKED_STATUSES, isLocked } from "@/utils/refrendActionability";

// ── Workflow status chip ──────────────────────────────────────────────────────
//
// Icon added per user request: status is dense/repeated in every row, so it
// renders as an icon (see StatusIcon.vue) with the label surfaced only via
// tooltip, instead of a text chip — same space-saving pattern already
// approved for the raw incident text (IncidentDetailIcon.vue).

// Shared by statusChip (LISTO_PARA_PAGO only, unchanged behavior) and
// finalResolutionChip (any workflow_status — the "Estado final" chip needs
// this same icon/color/label regardless of whether the refrend is still
// LISTO_PARA_PAGO or already CLOSED/Pagado).
const _resolutionTypeMeta = (
  refrend: BulkRefrendRow["refrend"],
): { label: string; color: string; icon: string } | null => {
  const r = refrend.resolution_type;
  if (r === "BECA_MES")
    return { label: "Pago sin penalización", color: "green", icon: "mdi-cash-check" };
  if (r === "SIN_PAGO")
    return { label: "Sin pago", color: "red", icon: "mdi-cash-remove" };
  if (r === "RETENIDA")
    return { label: "Retenida", color: "amber-darken-2", icon: "mdi-lock-outline" };
  if (r === "DESCUENTO_DEFINITIVO")
    return { label: "Descuento definitivo", color: "purple-darken-2", icon: "mdi-cash-minus" };
  if (r === "EGRESADO")
    return { label: "Egresado", color: "blue-grey", icon: "mdi-account-check-outline" };
  if (r === "BAJA_DEFINITIVA")
    return { label: "Baja definitiva", color: "red-darken-3", icon: "mdi-account-remove-outline" };
  if (r === "REEMBOLSO_PARCIAL")
    return { label: "Reembolso parcial", color: "teal", icon: "mdi-cash-refund" };
  if (r === "SUSPENDIDA") {
    const pct = refrend.suspension_percentage ?? null;
    return {
      label: pct ? `Suspendido ${pct}%` : "Suspendido",
      color: "deep-orange",
      icon: "mdi-pause-circle-outline",
    };
  }
  return null;
};

export const statusChip = (
  refrend: BulkRefrendRow["refrend"],
): { label: string; color: string; icon: string } => {
  const s = refrend.workflow_status;

  if (s === "DRAFT")
    return { label: "Borrador", color: "grey", icon: "mdi-file-document-edit-outline" };
  if (s === "CON_INCIDENCIA")
    return { label: "Con incidencia", color: "orange", icon: "mdi-alert-decagram-outline" };
  if (s === "PENDIENTE_NOTIFICACION")
    return { label: "Pend. notif.", color: "blue", icon: "mdi-bell-outline" };
  if (s === "CLOSED")
    return { label: "Pagado", color: "teal", icon: "mdi-cash-check" };
  if (refrend.status === "CANCELLED")
    return { label: "Baja", color: "red-darken-3", icon: "mdi-account-cancel-outline" };

  if (s === "LISTO_PARA_PAGO") {
    return (
      _resolutionTypeMeta(refrend) ?? {
        label: "Listo para pago",
        color: "green",
        icon: "mdi-check-circle-outline",
      }
    );
  }

  return { label: s ?? "—", color: "grey", icon: "mdi-help-circle-outline" };
};

// ── Final resolution chip (Estado final column, Pagado rows only) ───────────
//
// statusChip() collapses to a plain "Pagado" once workflow_status=CLOSED —
// by design, so the dense per-row Estado icon doesn't repeat resolution
// detail forever. But once paid, a reviewer scanning the batch still wants
// to see WHICH resolution the becario ended up with (Retenida, Sin pago,
// etc.) without reopening the row — this is that chip, visible (not
// hover-only, user override of the icon-only precedent) and shown only for
// Pagado rows via v-if at the call site (`workflow_status === 'CLOSED'`).
// Mirrors administration-panel's resolutionMeta.ts chip (icon+color+visible
// label) for the same 8 resolution_type values.

export const finalResolutionChip = (
  refrend: BulkRefrendRow["refrend"],
): { label: string; color: string; icon: string } | null => _resolutionTypeMeta(refrend);

// ── Resolution cause label ────────────────────────────────────────────────────

export const CAUSE_LABELS: Record<string, string> = {
  FALTAS_FI: "Faltas a F.I.",
  SIN_ENTREVISTA_CALIFICACIONES: "Sin entrevista de calificaciones",
  NO_ENTREGO_CALIFICACIONES_PROVISIONALES: "No entregó cal. provisionales",
  NO_ENTREGO_CALIFICACIONES_ORIGINALES: "No entregó cal. originales",
  BAJO_PROMEDIO: "Bajo promedio",
  FALTAS_FORMACION_INTEGRAL: "Faltas a F.I.",
  LLEVARSE_EXTRAORDINARIO: "Por llevarse a extraordinario",
  DEJO_ESCUELA_PERSONALES: "Dejó la escuela (personal)",
  DEJO_ESCUELA_VOCACIONAL: "Dejó la escuela (vocacional)",
  DESAPARECIO: "Desapareció sin avisar",
  FALTAS_REGLAMENTO: "Faltas al reglamento",
  PAGO_MESES_RETENIDOS_SIN_MES_ACTUAL: "Solo meses retenidos",
};

export const resolutionCauseLabel = (
  refrend: ScholarshipRefrend,
): string | null => {
  if (!refrend.resolution_cause) return null;
  if (refrend.resolution_cause === "OTRO")
    return refrend.resolution_notes ?? null;
  return CAUSE_LABELS[refrend.resolution_cause] ?? refrend.resolution_cause;
};

// ── Scholarship type chip ────────────────────────────────────────────────────
//
// `snapshot_scholarship_type` comes from the becario's ScholarshipProfile,
// snapshotted onto the refrend at creation time (same pattern as
// snapshot_campus / snapshot_generation) — not re-fetched from the profile
// live, so it stays accurate even if the profile's type changes later.

export const scholarshipTypeColor = (
  type: BulkRefrendRow["refrend"]["snapshot_scholarship_type"],
): string => (type === "TELMEX" ? "indigo" : "blue-grey");

// ── Pending withholding chip (shared cell, design ADR D5) ──────────────────
//
// Purely informational: label with the formatted amount, tooltip with count
// + total. Returns null when there is nothing pending (design ADR D4 — the
// backend emits `null`, never "0.00", so a single truthiness check suffices).

export const pendingWithholdingChip = (
  row: BulkRefrendRow,
): { label: string; tooltip: string } | null => {
  const count = row.pending_withholding_count ?? 0;
  if (count < 1 || !row.pending_withholding_amount) return null;
  const amount = fmt(row.pending_withholding_amount);
  return {
    label: amount,
    tooltip:
      count === 1
        ? `1 retención pendiente · ${amount}`
        : `${count} retenciones pendientes · ${amount} en total`,
  };
};

// ── Row CSS class ───────────────────────────────────────────────────────────

export const rowClass = (item: BulkRefrendRow): string => {
  const s = item.refrend.workflow_status;
  if (s === "CON_INCIDENCIA") return "row-incident";
  if (s === "DRAFT") return "row-pending";
  return "";
};

// ── Base headers (columns every mode always shows) ───────────────────────────

export const BASE_HEADERS = [
  {
    title: "Becario",
    key: "snapshot_name",
    fixed: true,
    minWidth: "200px",
    sortable: true,
  },
  { title: "Estado", key: "workflow_status", width: 70, sortable: false },
  {
    title: "T.Beca",
    key: "snapshot_scholarship_type",
    width: 90,
    align: "center" as const,
    sortable: true,
  },
  {
    title: "Retención P.",
    key: "pending_withholding_amount",
    width: 110,
    align: "center" as const,
    sortable: false,
  },
  {
    title: "Pago adelantado",
    key: "advance_paid_amount",
    width: 130,
    align: "center" as const,
    sortable: false,
  },
];

// ── Table title (campus / generation / period) ────────────────────────────────

export const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ── Advance payment chip (shared cell, sdd/pago-adelantado row indicator) ──
//
// Purely informational: label with the formatted amount, tooltip with the
// origin batch's month/year (design's AdvancePaidRowFields). Returns null
// when the row isn't advance-paid, or when the backend's `advance_paid_amount`
// is missing (mirrors pendingWithholdingChip's null-on-nothing-to-show
// convention — the backend emits `null`, never "0.00").

export const advancePaymentChip = (
  row: BulkRefrendRow,
): { label: string; tooltip: string } | null => {
  if (!row.advance_paid || !row.advance_paid_amount) return null;
  const amount = fmt(row.advance_paid_amount);
  const month = row.advance_paid_origin_month;
  const year = row.advance_paid_origin_year;
  const monthName = month ? MONTHS_ES[month - 1] ?? String(month) : null;
  const origin = monthName && year ? `${monthName} ${year}` : null;
  return {
    label: amount,
    tooltip: origin
      ? `Pago adelantado · lote de ${origin} · ${amount}`
      : `Pago adelantado · ${amount}`,
  };
};

// ── Advance payment REGISTERED chip (origin-refrend indicator, PR8) ────────
//
// OPPOSITE direction from advancePaymentChip() above: that one marks a row
// that IS one of the future months pre-created and settled by SOMEONE ELSE'S
// earlier advance-payment batch (the advance_paid family, PR7a). This one
// marks a row that itself HAS an advance-payment batch registered FROM it —
// i.e. this row is the origin refrend, and staff already recorded 1-3 future
// months as advance-paid against it (RecordAdvancePaymentAction, design D6).
// Both fields can be non-null on different rows in the same table at the
// same time; never conflate them. Backend emits advance_payment_amount as a
// decimal string, "0.00" when nothing is registered — never null (unlike
// pending_withholding_amount/advance_paid_amount's null-on-nothing
// convention), so the guard here is a numeric zero check, not truthiness.
//
// PR9 (live user review feedback): this chip no longer backs its own
// dedicated BASE_HEADERS column — it is rendered inline inside the actions
// cell by AprobacionRefrendTable.vue/VerificacionRefrendTable.vue, next to
// the row's action button, for a more compact table. The helper itself is
// unchanged; only where its output gets rendered moved.
//
// Reads row.refrend.advance_payment_amount, NOT a top-level row field —
// unlike advance_paid/advance_paid_amount (which come from a separate JOIN
// in RefrendBulkQueryService::buildTable() and are genuinely top-level),
// advance_payment_amount is a real column on scholarship_refrends, so the
// backend nests it inside that method's `$refrend` sub-array. A prior
// version of this helper read it as a top-level field, which always
// silently evaluated to undefined/NaN — a live bug (chip rendered nothing
// or "+NaN" regardless of the real, non-zero value in the database).

export const advancePaymentRegisteredChip = (
  row: BulkRefrendRow,
): { label: string; tooltip: string } | null => {
  // Number(undefined) is NaN, and `NaN <= 0` is FALSE — a plain "<= 0"
  // check alone would let a missing/malformed field slip through and
  // render "+NaN" instead of hiding the chip. The type says this field is
  // always a string, but that's not a runtime guarantee.
  const raw = Number(row.refrend.advance_payment_amount);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  const amount = fmt(row.refrend.advance_payment_amount);
  return {
    label: "Pago adelantado registrado",
    tooltip: `+${amount} · Se sumará al monto de esta decisión`,
  };
};

export const buildTableInfo = (
  rows: BulkRefrendRow[],
  year: number,
  month: number,
): { campus: string; generation: string; period: string } => {
  const first = rows[0]?.refrend;
  return {
    campus:
      campusMap.get(first?.snapshot_campus ?? "")?.text ??
      first?.snapshot_campus ??
      "—",
    generation: first?.snapshot_generation ?? "—",
    period: `${MONTHS_ES[month - 1] ?? month} ${year}`,
  };
};

// ── Search filter (by becario name) ───────────────────────────────────────────

export const filterRowsByName = (
  rows: BulkRefrendRow[],
  query: string,
): BulkRefrendRow[] => {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => r.refrend.snapshot_name.toLowerCase().includes(q));
};
