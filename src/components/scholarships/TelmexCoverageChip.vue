<template>
  <v-tooltip v-if="chip" location="bottom" max-width="260" :text="chip.tooltip">
    <template #activator="{ props: tp }">
      <v-chip v-bind="tp" size="x-small" color="teal-darken-2" variant="flat" label>
        <v-icon start size="12">mdi-hand-coin-outline</v-icon>
        {{ chip.label }}
      </v-chip>
    </template>
  </v-tooltip>
  <span v-else class="text-disabled">—</span>
</template>

<script setup lang="ts">
// ── Telmex coverage cell (AprobacionRefrendTable only, sdd/telmex-cobertura-
// iu PR6) ───────────────────────────────────────────────────────────────
//
// Verbatim structural clone of AdvancePaymentChip.vue/TemporaryIncreaseChip.vue
// — only icon/color and the backing helper differ. Purely informational: no
// @click, no emitted event, no navigation, same read-only precedent as every
// other chip in this table (spec "psicol-panel approval visibility" —
// read-only, no edit controls). Icon/color intentionally distinct from
// AdvancePaymentChip (cyan) and TemporaryIncreaseChip (light-green) so the
// three can never be visually confused.

import { computed } from "vue";
import { telmexCoverageChip } from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

const props = defineProps<{ row: BulkRefrendRow }>();
const chip = computed(() => telmexCoverageChip(props.row));
</script>
