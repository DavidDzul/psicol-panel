<template>
  <div>
    <v-text-field
      :model-value="fmt(finalAmountNumber)"
      label="Monto Final"
      variant="outlined"
      density="compact"
      readonly
      prefix="$"
      class="mb-3"
      hide-details
    />

    <div class="text-caption font-weight-medium text-medium-emphasis mb-2">MODO DE RETENCIÓN</div>
    <v-radio-group v-model="mode" class="mt-0 mb-3" hide-details inline>
      <v-radio label="Porcentaje" value="percentage" :color="color" />
      <v-radio label="Monto fijo" value="fixed" :color="color" />
    </v-radio-group>

    <v-text-field
      v-model.number="value"
      :label="mode === 'fixed' ? 'Monto a retener' : 'Porcentaje a retener'"
      :suffix="mode === 'fixed' ? undefined : '%'"
      :prefix="mode === 'fixed' ? '$' : undefined"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      hide-details
    />

    <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
      Monto retenido: <strong>{{ fmt(withheldAmount) }}</strong> · Monto a pagar:
      <strong>{{ fmt(resultingFinalAmount) }}</strong>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
// Shared input block for RETENIDA / DESCUENTO_DEFINITIVO (sdd/retencion-no-recuperable):
// mode radio + value field + live withheld/resulting-amount alert. Extracted
// out of `SituationRetenidaDialog.vue` — math delegates to
// `@/utils/withholdingAmount.ts` so both dialogs stay in parity. `color`
// lets each caller keep its own accent (RETENIDA: orange, DESCUENTO_DEFINITIVO: purple).
import { computed } from "vue";
import {
  computeResultingFinal,
  computeWithheld,
  type WithholdingMode,
} from "@/utils/withholdingAmount";

const props = withDefaults(
  defineProps<{
    finalAmount?: string | number | null;
    color?: string;
  }>(),
  { color: "orange-darken-2" },
);

const mode = defineModel<WithholdingMode>("mode", { required: true });
const value = defineModel<number | null>("value", { required: true });

const finalAmountNumber = computed(() => Number(props.finalAmount ?? 0));

const fmt = (val: number | string | null | undefined): string => {
  const num = Number(val ?? 0);
  return `$${num.toFixed(2)}`;
};

const withheldAmount = computed(() =>
  computeWithheld(mode.value, value.value, finalAmountNumber.value),
);

const resultingFinalAmount = computed(() =>
  computeResultingFinal(mode.value, value.value, finalAmountNumber.value),
);
</script>
