<template>
  <v-skeleton-loader v-if="loading" type="paragraph" class="mb-3" />
  <v-alert v-else-if="text" type="warning" variant="tonal" density="compact" class="mb-3">
    {{ text }}
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CycleCutPreview } from "@/interfaces/scholarship";
import { buildCycleCutAdvanceWarning } from "@/utils/cycleCutWarning";

// sdd/revertir-pago-adelantado S10 (R21): renders nothing unless the preview
// lists advance months to cancel. Purely informational — never gates confirm.
const props = defineProps<{
  preview: CycleCutPreview | null;
  loading?: boolean;
}>();

const text = computed(() => buildCycleCutAdvanceWarning(props.preview));
</script>
