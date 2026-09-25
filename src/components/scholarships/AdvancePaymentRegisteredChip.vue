<template>
  <v-tooltip v-if="chip" location="bottom" max-width="260" :text="chip.tooltip">
    <template #activator="{ props: tp }">
      <v-chip v-bind="tp" size="x-small" color="deep-purple" variant="flat" label>
        <v-icon start size="12">mdi-cash-plus</v-icon>
        {{ chip.label }}
      </v-chip>
    </template>
  </v-tooltip>
  <span v-else class="text-disabled">—</span>
</template>

<script setup lang="ts">
// ── Advance-payment-REGISTERED cell (shared by Verificación/Aprobación tables) ──
//
// Purely informational: no @click, no emitted event, no navigation — same
// non-interactive precedent as AdvancePaymentChip.vue/PendingWithholdingChip.vue.
//
// OPPOSITE direction from AdvancePaymentChip.vue: that one marks a row that
// IS one of the future months pre-created and settled by someone else's
// advance-payment batch (advance_paid family, PR7a). This one marks a row
// that itself HAS a batch registered against it — this row is the origin
// refrend, and staff already recorded 1-3 future months as advance-paid
// against it (RecordAdvancePaymentAction, design D6). Both chips can render
// on different rows of the same table at the same time; never conflate them.
//
// Icon (mdi-cash-plus) and color (deep-purple) are deliberately distinct
// from AdvancePaymentChip.vue's mdi-cash-clock/cyan-darken-2 and
// PendingWithholdingChip.vue's mdi-lock-outline/amber-darken-2, so none of
// the three advance/withholding-related chips are ever visually confused.

import { computed } from "vue";
import { advancePaymentRegisteredChip } from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

const props = defineProps<{ row: BulkRefrendRow }>();
const chip = computed(() => advancePaymentRegisteredChip(props.row));
</script>
