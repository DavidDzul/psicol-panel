<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="purple-darken-2" size="small">mdi-cash-minus</v-icon>
        Descuento definitivo
      </v-card-title>

      <v-card-text class="pt-0">
        <WithholdingAmountFields
          v-model:mode="form.withholding_mode"
          v-model:value="form.withholding_value"
          :final-amount="finalAmount"
          color="purple-darken-2"
        />

        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
        <v-radio-group v-model="form.resolution_cause" class="mt-0 mb-3" hide-details>
          <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="purple-darken-2" />
          <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="purple-darken-2" />
          <v-radio label="Por llevarse a extraordinario" value="LLEVARSE_EXTRAORDINARIO" color="purple-darken-2" />
          <v-radio label="Otro" value="OTRO" color="purple-darken-2" />
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
        <v-btn color="purple-darken-2" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
// Sibling of SituationRetenidaDialog.vue for resolution_type
// DESCUENTO_DEFINITIVO (sdd/retencion-no-recuperable): same reason list and
// discount math (via WithholdingAmountFields + withholdingAmount.ts), but no
// withholding ledger row / status=WITHHELD side effect on the backend — this
// dialog only differs in title/icon/color and the emitted resolution_type.
import { computed, reactive, watch } from "vue";
import WithholdingAmountFields from "@/components/scholarships/WithholdingAmountFields.vue";
import type { RecordSituationForm } from "@/interfaces/scholarship";
import { isWithholdingInputValid } from "@/utils/withholdingAmount";

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

const isValid = computed(() => {
  if (!isWithholdingInputValid(form.withholding_mode, form.withholding_value, finalAmountNumber.value)) {
    return false;
  }
  return (
    !!form.resolution_cause &&
    (form.resolution_cause !== "OTRO" || !!form.resolution_notes?.trim())
  );
});

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "DESCUENTO_DEFINITIVO",
    withholding_mode: form.withholding_mode,
    withholding_value: form.withholding_value,
    resolution_cause: form.resolution_cause,
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
