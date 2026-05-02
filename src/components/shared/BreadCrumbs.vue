<template>
  <v-breadcrumbs :items="items">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
    <template #item="{ item }">
      <v-breadcrumbs-item :to="item.href" :disabled="item.disabled" :exact="true" active-color="primary" :title="item.title.toUpperCase()"> </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import type { LinkInterface } from "@/interfaces"

interface Props {
  items?: LinkInterface[]
}

withDefaults(defineProps<Props>(), {
  items: () => [],
})
</script>
