import type { ResolutionType } from "@/interfaces/scholarship";

// ── Situation menu catalog (single source of truth) ─────────────────────────
//
// Extracted out of `RefrendSituationBar.vue` so `hidden` filtering is a pure,
// unit-testable function instead of logic buried inside a `<script setup>`
// computed that only a full component mount could exercise. See design
// sdd/pedagogia-acciones-visibilidad-y-beca-retenida-montos §7 (P1, reused
// verbatim from v1): a `hidden` flag decouples *existing in the catalog*
// (dialogs, `situationDialogs` keys, historical rendering) from *being
// offered* in the "Acciones" menu.

export type SituationKey = ResolutionType | "PAGO_MESES";

export interface SituationMenuItem {
  key: SituationKey;
  icon: string;
  label: string;
  color: string;
  /**
   * When true, the entry stays in the catalog — its dialog, its
   * `situationDialogs` key, and any past refrendo resolved with this
   * `resolution_type` keep rendering normally — but it is no longer offered
   * in the "Acciones" dropdown. Prefer this over removing the entry.
   */
  hidden?: boolean;
}

export const SITUATION_MENU_ITEMS: SituationMenuItem[] = [
  {
    key: "SIN_PAGO",
    icon: "mdi-cash-off",
    label: "Sin pago (0%)",
    color: "grey-darken-2",
    // Promoted to a quick action in RefrendSituationBar.vue's top section
    // (sdd/condonar-descuento-mes-refrendo follow-up) — the catalog entry,
    // its dialog, and any historical SIN_PAGO refrendo stay intact, it's
    // just no longer offered a second time in "Situaciones especiales".
    hidden: true,
  },
  {
    key: "RETENIDA",
    icon: "mdi-lock-outline",
    label: "Beca retenida",
    color: "orange-darken-2",
  },
  {
    key: "PAGO_MESES",
    icon: "mdi-cash-refund",
    label: "Pago meses retenidos",
    color: "teal",
  },
  {
    key: "SUSPENDIDA",
    icon: "mdi-percent-outline",
    label: "Suspensión temporal",
    color: "deep-orange",
    // Ocultada del menú de Acciones (decisión de producto, PR1 de
    // sdd/pedagogia-acciones-visibilidad-y-beca-retenida-montos). El
    // catálogo, `SituationSuspendidaDialog.vue` y cualquier refrendo
    // histórico con resolution_cause=SUSPENDIDA siguen intactos.
    hidden: true,
  },
  {
    key: "BAJA_DEFINITIVA",
    icon: "mdi-account-off-outline",
    label: "Baja definitiva",
    color: "red-darken-2",
  },
  {
    key: "EGRESADO",
    icon: "mdi-school-outline",
    label: "Egresado",
    color: "indigo",
  },
];

/** Entries to render in the "Acciones" menu — excludes `hidden` ones. */
export const visibleSituationMenuItems = (
  items: SituationMenuItem[] = SITUATION_MENU_ITEMS,
): SituationMenuItem[] => items.filter((item) => !item.hidden);
