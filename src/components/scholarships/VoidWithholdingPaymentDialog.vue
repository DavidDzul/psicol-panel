<template>
  <v-dialog v-model="model" max-width="420" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="error" size="small">mdi-undo-variant</v-icon>
        Revertir abono
      </v-card-title>

      <v-card-text class="pt-0">
        <v-alert v-if="payment" type="warning" variant="tonal" density="compact" class="mb-3">
          {{ payment.periodLabel }} · {{ fmt(payment.amount) }} · {{ payment.createdAt }}
        </v-alert>

        <v-textarea
          v-model="reason"
          label="Motivo de la reversión *"
          variant="outlined"
          density="compact"
          rows="3"
          counter
          hide-details="auto"
          :error-messages="reasonError"
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="error" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Revertir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { isVoidReasonValid, MIN_VOID_REASON_LENGTH } from "@/utils/withholdingVoid";

export interface VoidWithholdingPaymentTarget {
  amount: number;
  createdAt: string;
  periodLabel: string;
}

const props = defineProps<{
  loading?: boolean;
  payment: VoidWithholdingPaymentTarget | null;
}>();

const emit = defineEmits<{ confirm: [reason: string] }>();
const model = defineModel<boolean>();

const reason = ref("");

watch(model, (open) => {
  if (!open) reason.value = "";
});

const fmt = (value: number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const isValid = computed(() => isVoidReasonValid(reason.value));

const reasonError = computed(() => {
  if (reason.value.length === 0) return undefined;
  return isValid.value ? undefined : `Mínimo ${MIN_VOID_REASON_LENGTH} caracteres.`;
});

const submit = () => {
  if (!isValid.value || !props.payment) return;
  emit("confirm", reason.value.trim());
};
</script>
