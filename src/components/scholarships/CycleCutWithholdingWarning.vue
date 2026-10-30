<template>
  <v-alert v-if="warning" type="warning" variant="tonal" density="compact" class="mb-3">
    <div>{{ warning.text }}</div>
    <ul class="pl-4 my-1">
      <li v-for="row in warning.rows" :key="row.id">
        {{ row.label }} — {{ row.amount }}
        <v-chip v-if="row.isCurrent" size="x-small" color="warning" variant="tonal" class="ml-1">
          Este mes
        </v-chip>
      </li>
    </ul>
    <div class="font-weight-medium">Total que se cancelará: {{ warning.total }}</div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CycleCutPreview } from "@/interfaces/scholarship";
import { buildCycleCutWithholdingWarning } from "@/utils/cycleCutWarning";

// sdd/retenciones-pendientes S6 (R7.1): renders nothing unless the preview
// lists pending withholdings the cut will cancel. Purely informational — never
// gates confirm. The `loading` skeleton is owned by CycleCutAdvanceWarning,
// rendered right above, so this component stays silent while loading.
const props = defineProps<{
  preview: CycleCutPreview | null;
  loading?: boolean;
}>();

const warning = computed(() => (props.loading ? null : buildCycleCutWithholdingWarning(props.preview)));
</script>
