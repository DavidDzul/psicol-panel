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
// (e.g. `PedagogiaRefrendTable.vue`) — do not re-implement this locally.

export { LOCKED_STATUSES, isLocked } from "@/utils/refrendActionability";

// ── Workflow status chip ──────────────────────────────────────────────────────
//
// Icon added per user request: status is dense/repeated in every row, so it
// renders as an icon (see StatusIcon.vue) with the label surfaced only via
// tooltip, instead of a text chip — same space-saving pattern already
// approved for the raw incident text (IncidentDetailIcon.vue).

export const statusChip = (
  refrend: BulkRefrendRow["refrend"],
): { label: string; color: string; icon: string } => {
  const s = refrend.workflow_status;
  const r = refrend.resolution_type;

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
    if (r === "SIN_PAGO")
      return { label: "Sin pago", color: "red", icon: "mdi-cash-remove" };
    if (r === "RETENIDA")
      return { label: "Retenida", color: "amber-darken-2", icon: "mdi-lock-outline" };
    if (r === "EGRESADO")
      return { label: "Egresado", color: "blue-grey", icon: "mdi-account-check-outline" };
    if (r === "BAJA_DEFINITIVA")
      return {
        label: "Baja definitiva",
        color: "red-darken-3",
        icon: "mdi-account-remove-outline",
      };
    if (r === "SUSPENDIDA") {
      const pct = refrend.suspension_percentage ?? null;
      return {
        label: pct ? `Suspendido ${pct}%` : "Suspendido",
        color: "deep-orange",
        icon: "mdi-pause-circle-outline",
      };
    }
    return { label: "Listo para pago", color: "green", icon: "mdi-check-circle-outline" };
  }

  return { label: s ?? "—", color: "grey", icon: "mdi-help-circle-outline" };
};

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
    title: "Retención",
    key: "pending_withholding_amount",
    width: 110,
    align: "center" as const,
    sortable: false,
  },
];

// ── Table title (campus / generation / period) ────────────────────────────────

const MONTHS_ES = [
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
