<template>
  <v-tooltip v-if="text" location="bottom" max-width="320" :text="text">
    <template #activator="{ props: tp }">
      <v-icon v-bind="tp" size="18" color="orange-darken-2">
        mdi-alert-circle-outline
      </v-icon>
    </template>
  </v-tooltip>
  <span v-else class="text-disabled text-caption">—</span>
</template>

<script setup lang="ts">
// ── Shared icon+tooltip trigger ─────────────────────────────────────────────
//
// Compact reveal for a chunk of raw text that would otherwise crowd a table
// cell (incident description, pedagogía observations, etc). Used by
// `PedagogiaGenerationSection.vue` (Incidencia column) and
// `AtencionRefrendTable.vue` (R. Pedagogía column) — user explicitly asked
// for the same icon+tooltip pattern in both places instead of raw inline
// text or a drawer-trigger button.

defineProps<{
  text: string | null | undefined;
}>();
</script>
