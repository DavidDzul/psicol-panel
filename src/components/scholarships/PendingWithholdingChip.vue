<template>
  <v-tooltip v-if="chip" location="bottom" max-width="260" :text="chip.tooltip">
    <template #activator="{ props: tp }">
      <v-chip v-bind="tp" size="x-small" color="amber-darken-2" variant="flat" label>
        <v-icon start size="12">mdi-lock-outline</v-icon>
        {{ chip.label }}
      </v-chip>
    </template>
  </v-tooltip>
  <span v-else class="text-disabled">—</span>
</template>

<script setup lang="ts">
// ── Pending withholding cell (shared by Atención/Pedagogía tables) ─────────
//
// Purely informational: no @click, no emitted event, no navigation (design
// ADR D5 + spec "Chip de retención no interactivo"). The payment action
// stays reachable only from the "Acciones" menu (RefrendSituationBar).

import { computed } from "vue";
import { pendingWithholdingChip } from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

const props = defineProps<{ row: BulkRefrendRow }>();
const chip = computed(() => pendingWithholdingChip(props.row));
</script>
