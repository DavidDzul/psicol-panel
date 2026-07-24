<template>
  <v-btn
    v-if="text"
    size="x-small"
    variant="tonal"
    color="orange-darken-2"
    prepend-icon="mdi-alert-circle-outline"
    :title="title"
    @click="open = true"
  >
    Ver
  </v-btn>
  <span v-else class="text-disabled text-caption">—</span>

  <v-dialog v-model="open" max-width="420">
    <v-card>
      <v-card-title class="text-subtitle-1">{{ title }}</v-card-title>
      <v-card-text class="text-body-2">{{ text }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
// ── Shared "view detail" icon+modal trigger ─────────────────────────────────
//
// Compact reveal for a chunk of raw text that would otherwise crowd a table
// cell (incident description, pedagogía observations, etc). Was a hover
// tooltip; user asked for a button that opens a modal instead (works on
// touch, doesn't hide content behind hover-only interaction). Used by
// PedagogiaRefrendTable.vue (Incidencia column) and AtencionRefrendTable.vue
// (R. Pedagogía column).

import { ref } from "vue";

withDefaults(
  defineProps<{
    text: string | null | undefined;
    title?: string;
  }>(),
  { title: "Detalle" },
);

const open = ref(false);
</script>
