<template>
  <v-alert
    v-if="hasPending"
    type="warning"
    variant="tonal"
    class="mb-4"
    icon="mdi-cash-clock"
  >
    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
      <div>
        <div class="font-weight-medium">Pago retenido acumulado</div>
        <div class="text-body-2">
          Este refrendo incluye <strong>{{ fmt(amountPending) }}</strong> de meses anteriores retenidos.
          El total a pagar es <strong>{{ fmt(totalToPay) }}</strong>.
        </div>
      </div>
      <v-chip color="warning" label size="small">
        + {{ fmt(amountPending) }} pendiente
      </v-chip>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  amountPending: string | number;
  totalToPay: string | number;
}>();

const hasPending = computed(() => Number(props.amountPending) > 0);

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value));
</script>
