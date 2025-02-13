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
import { PropType } from "vue"

import { LinkInterface } from "@/interfaces"

defineProps({ items: { type: Array as PropType<LinkInterface[]>, default: () => [] } })
</script>
