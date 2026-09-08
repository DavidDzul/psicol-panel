import type { RefrendStatus } from "@/interfaces/scholarship";

// ── Refrend status label/color (single source of truth) ─────────────────────
//
// `ScholarshipTable.vue`, `ScholarshipRefrendMiniList.vue`, and
// `ScholarshipRefrendDetailsView.vue` each rendered an identical status chip
// from their own copy of this map. Consolidated here per design D1 so all
// three surfaces stay in sync by construction instead of by convention.
//
// Keys mirror the persisted `RefrendStatus` enum (external contract — do NOT
// rename). Only the display strings are free to evolve.

const STATUS_COLOR: Record<RefrendStatus, string> = {
  DRAFT: "grey",
  ATENCION_REVIEW: "blue",
  PEDAGOGIA_REVIEW: "purple",
  AUTHORIZED: "green",
  PAID: "teal",
  WITHHELD: "orange",
  CANCELLED: "red",
};

const STATUS_LABEL: Record<RefrendStatus, string> = {
  DRAFT: "Borrador",
  ATENCION_REVIEW: "Rev. Verificación",
  PEDAGOGIA_REVIEW: "Rev. Aprobación",
  AUTHORIZED: "Autorizado",
  PAID: "Pagado",
  WITHHELD: "Retenido",
  CANCELLED: "Cancelado",
};

export const refrendStatusColor = (status: RefrendStatus): string =>
  STATUS_COLOR[status] ?? "grey";

export const refrendStatusLabel = (status: RefrendStatus): string =>
  STATUS_LABEL[status] ?? status;
