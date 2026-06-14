<template>
  <v-dialog v-model="model" max-width="420" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="teal" size="small">mdi-cash-refund</v-icon>
        Pago meses retenidos
      </v-card-title>

      <v-card-text class="pt-0">
        <v-alert
          v-if="amountPending && Number(amountPending) > 0"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3"
          icon="mdi-cash-clock"
        >
          Monto retenido acumulado: <strong>{{ fmt(Number(amountPending)) }}</strong>
        </v-alert>

        <v-text-field
          v-model.number="pago.months_count"
          label="Número de meses *"
          type="number"
          variant="outlined"
          density="compact"
          min="1"
          max="12"
          class="mb-3"
          hide-details
        />
        <v-textarea
          v-model="pago.months_detail"
          label="Meses a pagar — especificar *"
          rows="2"
          variant="outlined"
          density="compact"
          placeholder="Ej: enero, febrero 2026"
          class="mb-3"
          hide-details
        />
        <v-text-field
          v-model.number="pago.percentage"
          label="Porcentaje a pagar *"
          type="number"
          variant="outlined"
          density="compact"
          min="1"
          max="100"
          suffix="%"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="teal" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { RecordSituationForm } from "@/interfaces/scholarship";

const props = defineProps<{
  loading?: boolean;
  amountPending?: string | number;
  baseAmount?: string | number;
}>();

const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

const pago = reactive({
  months_count: null as number | null,
  months_detail: null as string | null,
  percentage: 100 as number,
});

const isValid = computed(() => {
  const count = pago.months_count ?? 0;
  const pct   = pago.percentage ?? 0;
  return count >= 1 && !!pago.months_detail?.trim() && pct >= 1 && pct <= 100;
});

watch(model, (open) => {
  if (!open) {
    pago.months_count  = null;
    pago.months_detail = null;
    pago.percentage    = 100;
  }
});

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type:         "BECA_MES",
    carryover_months_count:  pago.months_count,
    carryover_months_detail: pago.months_detail,
    carryover_percentage:    pago.percentage,
  });
};
</script>
