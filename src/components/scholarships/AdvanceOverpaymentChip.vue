<template>
  <v-tooltip v-if="chip" location="bottom" max-width="280" :text="chip.tooltip">
    <template #activator="{ props: tp }">
      <v-chip v-bind="tp" size="x-small" color="warning" variant="flat" label>
        <v-icon start size="12">mdi-cash-remove</v-icon>
        {{ chip.label }}
      </v-chip>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
// sdd/revertir-pago-adelantado S11b (R18): shown on the CUT row when a cycle
// cut cancelled advance months of an already-paid origin. Purely
// informational, same non-interactive precedent as the other row chips.

import { computed } from "vue";
import { advanceOverpaymentChip } from "@/composables/useRefrendTableDisplay";
import type { AdvanceOverpayment } from "@/interfaces/scholarship";

const props = defineProps<{ overpayment?: AdvanceOverpayment | null }>();
const chip = computed(() => advanceOverpaymentChip(props.overpayment));
</script>
