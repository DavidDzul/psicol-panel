<template>
  <div class="d-flex flex-column">
    <span class="text-caption text-medium-emphasis">{{
      cell.net === null ? "—" : fmt(cell.net)
    }}</span>
    <span v-if="cell.nominal !== null" class="text-caption text-disabled">
      Nominal {{ fmt(cell.nominal) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { fmt } from "@/composables/useRefrendTableDisplay";
import type { NetAmountCell } from "@/utils/netAmountCell";

defineProps<{
  cell: NetAmountCell;
}>();
</script>
