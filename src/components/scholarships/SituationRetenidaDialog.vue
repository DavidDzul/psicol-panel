<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="orange-darken-2" size="small">mdi-lock-outline</v-icon>
        Beca retenida
      </v-card-title>

      <v-card-text class="pt-0">
        <v-text-field
          :model-value="fmt(finalAmount)"
          label="Monto Final"
          variant="outlined"
          density="compact"
          readonly
          prefix="$"
          class="mb-3"
          hide-details
        />

        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">MODO DE RETENCIÓN</div>
        <v-radio-group v-model="form.withholding_mode" class="mt-0 mb-3" hide-details inline>
          <v-radio label="Porcentaje" value="percentage" color="orange-darken-2" />
          <v-radio label="Monto fijo" value="fixed" color="orange-darken-2" />
        </v-radio-group>

        <v-text-field
          v-model.number="form.withholding_value"
          :label="form.withholding_mode === 'fixed' ? 'Monto a retener' : 'Porcentaje a retener'"
          :suffix="form.withholding_mode === 'fixed' ? undefined : '%'"
          :prefix="form.withholding_mode === 'fixed' ? '$' : undefined"
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

        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
        <v-radio-group v-model="form.resolution_cause" class="mt-0 mb-3" hide-details>
          <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="orange-darken-2" />
          <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="orange-darken-2" />
          <v-radio label="Por llevarse a extraordinario" value="LLEVARSE_EXTRAORDINARIO" color="orange-darken-2" />
          <v-radio label="Otro" value="OTRO" color="orange-darken-2" />
        </v-radio-group>
        <v-text-field
          v-if="form.resolution_cause === 'OTRO'"
          v-model="form.resolution_notes"
          label="Especificar causa *"
          variant="outlined"
          density="compact"
          class="mb-2"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="orange-darken-2" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { RecordSituationForm } from "@/interfaces/scholarship";

const props = defineProps<{ loading?: boolean; finalAmount?: string | number | null }>();
const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const form = reactive({
  withholding_mode: "percentage" as "percentage" | "fixed",
  withholding_value: null as number | null,
  resolution_cause: null as string | null,
  resolution_notes: null as string | null,
});

watch(model, (v) => {
  if (!v) {
    form.withholding_mode = "percentage";
    form.withholding_value = null;
    form.resolution_cause = null;
    form.resolution_notes = null;
  }
});

const finalAmountNumber = computed(() => Number(props.finalAmount ?? 0));

const fmt = (value: number | string | null | undefined): string => {
  const num = Number(value ?? 0);
  return `$${num.toFixed(2)}`;
};

const withheldAmount = computed(() => {
  const value = form.withholding_value ?? 0;
  if (form.withholding_mode === "fixed") {
    return Math.min(finalAmountNumber.value, Math.max(0, value));
  }
  const pct = Math.min(100, Math.max(0, value));
  return Math.round(finalAmountNumber.value * (pct / 100) * 100) / 100;
});

const resultingFinalAmount = computed(() =>
  Math.round((finalAmountNumber.value - withheldAmount.value) * 100) / 100,
);

const isValid = computed(() => {
  if (form.withholding_value == null || form.withholding_value <= 0) return false;
  if (form.withholding_mode === "percentage" && form.withholding_value > 100) return false;
  if (form.withholding_mode === "fixed" && form.withholding_value > finalAmountNumber.value) return false;
  return (
    !!form.resolution_cause &&
    (form.resolution_cause !== "OTRO" || !!form.resolution_notes?.trim())
  );
});

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "RETENIDA",
    withholding_mode: form.withholding_mode,
    withholding_value: form.withholding_value,
    resolution_cause: form.resolution_cause,
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
