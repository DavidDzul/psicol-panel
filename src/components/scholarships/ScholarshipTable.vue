<template>
  <v-data-table
    :headers="headers"
    :items="refrends"
    :loading="loading"
    item-value="id"
    class="elevation-1"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Refrendos del periodo</v-toolbar-title>
        <v-spacer />
        <slot name="actions" />
      </v-toolbar>
    </template>

    <template #item.snapshot_name="{ item }">
      <span class="font-weight-medium">{{ item.snapshot_name }}</span>
    </template>

    <template #item.base_amount="{ item }">
      {{ formatCurrency(item.base_amount) }}
    </template>

    <template #item.discount_amount="{ item }">
      <span :class="Number(item.discount_amount) > 0 ? 'text-error' : ''">
        {{ formatCurrency(item.discount_amount) }}
      </span>
    </template>

    <template #item.final_amount="{ item }">
      <span class="font-weight-bold">{{
        formatCurrency(item.final_amount)
      }}</span>
    </template>

    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" size="small" label>
        {{ statusLabel(item.status) }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        icon="mdi-eye"
        size="small"
        variant="text"
        @click="$emit('show', item)"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { ScholarshipRefrend } from "@/interfaces/scholarship";
import {
  refrendStatusColor as statusColor,
  refrendStatusLabel as statusLabel,
} from "@/utils/refrendStatusDisplay";

defineProps<{
  refrends: ScholarshipRefrend[];
  loading?: boolean;
}>();

defineEmits<{
  show: [refrend: ScholarshipRefrend];
}>();

const headers = [
  { title: "Becario", key: "snapshot_name" },
  { title: "Sede", key: "snapshot_campus" },
  { title: "Tipo", key: "snapshot_scholarship_type" },
  { title: "Monto base", key: "base_amount", align: "end" as const },
  { title: "Descuento", key: "discount_amount", align: "end" as const },
  { title: "Pago final", key: "final_amount", align: "end" as const },
  { title: "Estado", key: "status" },
  { title: "Acciones", key: "actions", sortable: false },
];

const formatCurrency = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

</script>
