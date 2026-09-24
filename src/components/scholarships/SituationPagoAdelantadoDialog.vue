<template>
  <v-dialog v-model="model" max-width="480" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="cyan-darken-2" size="small">mdi-cash-clock</v-icon>
        Pago adelantado
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="text-caption text-medium-emphasis mb-2">
          Seleccioná entre 1 y {{ MAX_ADVANCED_MONTHS_CLIENT }} meses futuros a pagar por
          adelantado.
        </div>

        <v-list density="compact" class="mb-1">
          <v-list-item
            v-for="option in monthOptions"
            :key="`${option.year}-${option.month}`"
            class="px-2"
          >
            <template #prepend>
              <v-checkbox
                v-model="option.selected"
                density="compact"
                hide-details
                color="cyan-darken-2"
                :disabled="!option.selected && selectedCount >= MAX_ADVANCED_MONTHS_CLIENT"
              />
            </template>
            <v-list-item-title class="text-body-2">{{ monthLabel(option) }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-alert
          v-if="selectedCount === 0"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          Seleccioná al menos un mes.
        </v-alert>
        <v-alert
          v-else-if="selectedCount >= MAX_ADVANCED_MONTHS_CLIENT"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          Máximo {{ MAX_ADVANCED_MONTHS_CLIENT }} meses por adelanto.
        </v-alert>

        <v-text-field
          v-model="cause"
          name="advance-payment-cause"
          label="Causa (opcional)"
          variant="outlined"
          density="compact"
          class="mb-2"
          maxlength="200"
          hide-details
        />
        <v-textarea
          v-model="notes"
          name="advance-payment-notes"
          label="Notas (opcional)"
          variant="outlined"
          density="compact"
          rows="2"
          maxlength="1000"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="cyan-darken-2"
          variant="elevated"
          :loading="loading"
          :disabled="!isValid"
          @click="submit"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AdvancePaymentForm } from "@/interfaces/scholarship";

// Client-side convenience cap mirroring the server's
// RecordAdvancePaymentAction::MAX_ADVANCED_MONTHS constant (design D5). This
// is a UX affordance only — the server re-validates the real cap on every
// request; do not treat this constant as the enforcement boundary.
const MAX_ADVANCED_MONTHS_CLIENT = 3;

// How many future periods to offer as checklist candidates.
const CANDIDATE_MONTHS_AHEAD = 12;

const props = defineProps<{
  loading?: boolean;
  // The origin refrendo's own period — the advance path requires a strictly
  // future period relative to this (design D3's assertPeriodIsFuture), so
  // candidates start at periodYear/periodMonth + 1, never at the period
  // itself.
  periodYear?: number | null;
  periodMonth?: number | null;
}>();

const emit = defineEmits<{ submit: [form: AdvancePaymentForm] }>();
const model = defineModel<boolean>();

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

interface MonthOption {
  year: number;
  month: number;
  selected: boolean;
}

const monthOptions = ref<MonthOption[]>([]);
const cause = ref<string | null>(null);
const notes = ref<string | null>(null);

// Builds the candidate list starting the month right after the origin
// refrendo's own period. The first candidate (origin + 1) is pre-selected —
// the becario's most common case is advancing the very next month (e.g. an
// August refrendo pre-selects September).
const buildMonthOptions = (): MonthOption[] => {
  if (!props.periodYear || !props.periodMonth) return [];
  const options: MonthOption[] = [];
  let year = props.periodYear;
  let month = props.periodMonth;
  for (let i = 0; i < CANDIDATE_MONTHS_AHEAD; i++) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    options.push({ year, month, selected: i === 0 });
  }
  return options;
};

const monthLabel = (option: MonthOption): string =>
  `${MONTH_NAMES[option.month - 1] ?? option.month} ${option.year}`;

const selectedCount = computed(() => monthOptions.value.filter((o) => o.selected).length);

const isValid = computed(
  () => selectedCount.value >= 1 && selectedCount.value <= MAX_ADVANCED_MONTHS_CLIENT,
);

watch(model, (open) => {
  if (open) {
    monthOptions.value = buildMonthOptions();
  } else {
    monthOptions.value = [];
  }
  cause.value = null;
  notes.value = null;
});

const submit = () => {
  if (!isValid.value) return;
  const trimmedCause = cause.value?.trim();
  const trimmedNotes = notes.value?.trim();
  emit("submit", {
    months: monthOptions.value
      .filter((o) => o.selected)
      .map((o) => ({ year: o.year, month: o.month })),
    cause: trimmedCause ? trimmedCause : undefined,
    notes: trimmedNotes ? trimmedNotes : undefined,
  });
};
</script>
