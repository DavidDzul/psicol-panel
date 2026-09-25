<template>
  <v-tooltip v-if="chip" location="bottom" max-width="260" :text="chip.tooltip">
    <template #activator="{ props: tp }">
      <v-chip v-bind="tp" size="x-small" color="cyan-darken-2" variant="flat" label>
        <v-icon start size="12">mdi-cash-clock</v-icon>
        {{ chip.label }}
      </v-chip>
    </template>
  </v-tooltip>
  <span v-else class="text-disabled">—</span>
</template>

<script setup lang="ts">
// ── Advance-paid cell (shared by Verificación/Aprobación tables) ───────────
//
// Purely informational: no @click, no emitted event, no navigation — same
// non-interactive precedent as PendingWithholdingChip.vue (sdd/pago-adelantado
// design's row-indicator plan). The capture action stays reachable only from
// the "Acciones" menu (SituationPagoAdelantadoDialog via RefrendSituationBar
// in AprobacionRefrendTable.vue). Icon/color match the "Pago adelantado"
// catalog entry already established in useSituationMenuItems.ts (PR6).

import { computed } from "vue";
import { advancePaymentChip } from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

const props = defineProps<{ row: BulkRefrendRow }>();
const chip = computed(() => advancePaymentChip(props.row));
</script>
