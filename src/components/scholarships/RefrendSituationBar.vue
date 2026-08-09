<template>
  <div class="d-flex align-center ga-1">
    <template v-if="!locked">
      <!-- Resolved (workflow_status = LISTO_PARA_PAGO) → chip with the
           current resolution + a single reversible exit. -->
      <template v-if="isResolved">
        <v-chip
          size="x-small"
          variant="tonal"
          :color="resolutionChip.color"
          :prepend-icon="resolutionChip.icon"
          :title="`Resolución actual: ${resolutionChip.label}`"
          :data-resolution="currentResolution ?? 'NONE'"
        >
          {{ resolutionChip.label }}
        </v-chip>
        <v-btn
          size="x-small"
          variant="text"
          color="warning"
          prepend-icon="mdi-undo-variant"
          :loading="loading"
          @click="emit('clear-resolution')"
        >
          Deshacer resolución
        </v-btn>
      </template>

      <!-- Unresolved (DRAFT / CON_INCIDENCIA) → today's full menu. -->
      <v-menu v-else :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            size="x-small"
            variant="tonal"
            color="primary"
            :loading="loading"
            :disabled="locked"
            append-icon="mdi-chevron-down"
          >
            Acciones
          </v-btn>
        </template>

        <v-list density="compact" nav min-width="210">
          <!-- Acciones rápidas -->
          <v-list-item @click="emit('approve-full')">
            <template #prepend>
              <v-icon color="green-darken-1" size="18">mdi-cash-check</v-icon>
            </template>
            <v-list-item-title class="text-body-2"
              >Pago al 100% (sin descuento)</v-list-item-title
            >
          </v-list-item>

          <v-divider class="my-1" />

          <!-- Situaciones especiales -->
          <v-list-item
            v-for="item in visibleMenuItems"
            :key="item.key"
            @click="emit('open', item.key)"
          >
            <template #prepend>
              <v-icon :color="item.color" size="18">{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{
              item.label
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResolutionType, WorkflowStatus } from "@/interfaces/scholarship";
import {
  visibleSituationMenuItems,
  type SituationKey,
} from "@/composables/useSituationMenuItems";

const props = defineProps<{
  currentResolution: ResolutionType | null;
  // Precomputed by the parent via statusChip(refrend) — the label needs
  // suspension_percentage, which currentResolution alone cannot supply, and
  // the mapping already lives in useRefrendTableDisplay.ts. Do not duplicate
  // it here.
  resolutionChip: { label: string; color: string; icon: string };
  locked: boolean;
  loading?: boolean;
  workflowStatus?: WorkflowStatus | null;
}>();

const emit = defineEmits<{
  open: [type: SituationKey];
  "approve-full": [];
  "clear-resolution": [];
}>();

// Two-state discriminator: keyed on workflow_status, NOT on
// `currentResolution === null` — rows resolved by the legacy
// ApproveRefrendAction reached LISTO_PARA_PAGO without ever writing
// resolution_type, so null does not mean "unresolved".
const isResolved = computed(() => props.workflowStatus === "LISTO_PARA_PAGO");

// "Pago meses retenidos" (PAGO_MESES) used to be gated behind a quick-action
// button driven by `amountPending` — but under the retention ledger
// (sdd/pedagogia-acciones-visibilidad-y-beca-retenida-montos, PR3),
// amount_pending_from_previous means "liquidated by THIS refrend", not
// "this becario has pending retentions", so it can no longer decide
// relevance here. PAGO_MESES stays a regular, always-offered entry in the
// "Acciones" menu below; the dialog itself shows an empty state when the
// becario has nothing pending.

// Catalog + `hidden` filtering live in `useSituationMenuItems.ts` (unit
// tested there) — SUSPENDIDA is flagged `hidden: true` so it stays in the
// catalog (its dialog and `situationDialogs` key are untouched) but is no
// longer offered here.
const visibleMenuItems = computed(() => visibleSituationMenuItems());
</script>
