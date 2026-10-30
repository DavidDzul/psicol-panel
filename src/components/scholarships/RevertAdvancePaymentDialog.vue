<template>
  <v-dialog v-model="model" max-width="480" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="error" size="small">mdi-undo-variant</v-icon>
        Revertir pago adelantado
      </v-card-title>

      <v-card-text class="pt-0">
        <p class="text-body-2 mb-2">
          Se eliminarán los siguientes meses adelantados registrados desde {{ originLabel }}:
        </p>

        <v-list density="compact" class="py-0 mb-2">
          <v-list-item v-for="month in months" :key="month.id" class="px-0" min-height="28">
            <div class="d-flex justify-space-between">
              <span>{{ month.label }}</span>
              <span class="font-weight-medium">{{ fmt(month.amount) }}</span>
            </div>
          </v-list-item>
          <v-divider class="my-1" />
          <v-list-item class="px-0" min-height="28">
            <div class="d-flex justify-space-between font-weight-bold">
              <span>Total</span>
              <span>{{ fmt(activeAdvance.total_amount) }}</span>
            </div>
          </v-list-item>
        </v-list>

        <v-alert type="info" variant="tonal" density="compact" class="mb-3">
          Las incidencias, los descuentos y la resolución del refrendo de {{ originLabel }} no se
          modifican. Solo se eliminan los meses adelantados y su monto.
        </v-alert>

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-3">
          {{ errorMessage }}
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
        <v-btn variant="text" :disabled="loading" @click="onCancel">Cancelar</v-btn>
        <v-btn
          color="error"
          variant="elevated"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="submit"
        >
          Revertir adelanto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { fmt, MONTHS_ES } from "@/composables/useRefrendTableDisplay";
import type { ActiveAdvance } from "@/interfaces/scholarship";

// sdd/revertir-pago-adelantado S11a (R9). Presentational: the container owns
// the store call and passes `loading` / `errorMessage` back.

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

const props = defineProps<{
  activeAdvance: ActiveAdvance;
  originPeriod: { year: number; month: number };
  loading?: boolean;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{ confirm: [reason: string]; close: [] }>();
const model = defineModel<boolean>();

const reason = ref("");

watch(model, (open) => {
  if (!open) reason.value = "";
});

const periodLabel = (year: number, month: number): string =>
  `${MONTHS_ES[month - 1] ?? month} ${year}`;

const originLabel = computed(() => periodLabel(props.originPeriod.year, props.originPeriod.month));

const months = computed(() =>
  props.activeAdvance.months.map((m) => ({
    id: m.id,
    amount: m.amount,
    label: periodLabel(m.period_year, m.period_month),
  })),
);

const trimmedLength = computed(() => reason.value.trim().length);
const isValid = computed(
  () => trimmedLength.value >= MIN_REASON_LENGTH && trimmedLength.value <= MAX_REASON_LENGTH,
);

const reasonError = computed(() => {
  if (reason.value.length === 0) return undefined;
  if (trimmedLength.value < MIN_REASON_LENGTH) return "Escribe al menos 10 caracteres";
  if (trimmedLength.value > MAX_REASON_LENGTH) return "No puede superar 500 caracteres";
  return undefined;
});

const submit = () => {
  if (!isValid.value || props.loading) return;
  emit("confirm", reason.value.trim());
};

const onCancel = () => {
  emit("close");
  model.value = false;
};
</script>
