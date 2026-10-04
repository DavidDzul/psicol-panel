<template>
  <v-tooltip v-if="chip" location="bottom" max-width="260" :text="chip.tooltip">
    <template #activator="{ props: tp }">
      <v-chip v-bind="tp" size="x-small" color="light-green-darken-2" variant="flat" label>
        <v-icon start size="12">mdi-trending-up</v-icon>
        {{ chip.label }}
      </v-chip>
    </template>
  </v-tooltip>
  <span v-else class="text-disabled">—</span>
</template>

<script setup lang="ts">
// ── Temporary-increase cell (shared by Verificación/Aprobación tables,
// sdd/temporary-increase-visibility P2c) ────────────────────────────────────
//
// Verbatim clone of AdvancePaymentChip.vue's structure — only icon/color and
// the backing helper differ. Purely informational: no @click, no emitted
// event, no navigation, same non-interactive precedent as
// PendingWithholdingChip.vue/AdvancePaymentChip.vue. Color/icon are
// deliberately distinct from every other chip in this table (design D6).

import { computed } from "vue";
import { temporaryIncreaseChip } from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

const props = defineProps<{ row: BulkRefrendRow }>();
const chip = computed(() => temporaryIncreaseChip(props.row));
</script>
