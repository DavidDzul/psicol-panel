<template>
  <v-tooltip location="bottom" :text="label">
    <template #activator="{ props: tp }">
      <v-icon v-bind="tp" :color="color" size="22">{{ icon }}</v-icon>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
// ── Workflow status icon+tooltip ────────────────────────────────────────────
//
// Same space-saving pattern as IncidentDetailIcon.vue: the "Estado" column
// repeats on every row, so it renders as a compact icon with the full label
// only on hover, instead of a text chip. Used by AtencionRefrendTable.vue and
// PedagogiaRefrendTable.vue.

defineProps<{
  icon: string;
  color: string;
  label: string;
}>();
</script>
