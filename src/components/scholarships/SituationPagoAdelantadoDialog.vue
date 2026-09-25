<template>
  <v-dialog v-model="model" max-width="560" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="cyan-darken-2" size="small">mdi-cash-clock</v-icon>
        Pago adelantado
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="text-caption text-medium-emphasis mb-3">
          Elegí entre 1 y {{ MAX_ADVANCED_MONTHS_CLIENT }} meses futuros a pagar por
          adelantado. No tienen que ser meses cercanos: un becario puede pedir su
          adelanto al inicio de su retícula y que el personal lo tome como los
          últimos meses, años después.
        </div>

        <div class="mb-5">
          <div v-for="(row, idx) in rows" :key="row.key" class="mb-1">
            <div class="text-caption text-medium-emphasis mb-1">Mes {{ idx + 1 }}</div>
            <v-row dense class="align-center">
              <v-col cols="5">
                <v-select
                  v-model="row.year"
                  :items="yearOptions"
                  label="Año"
                  density="compact"
                  hide-details
                  @update:model-value="(v) => onYearChange(idx, v)"
                />
              </v-col>
              <v-col cols="5">
                <v-select
                  v-model="row.month"
                  :items="monthOptionsFor(row)"
                  label="Mes"
                  density="compact"
                  hide-details
                  @update:model-value="(v) => onMonthChange(idx, v)"
                />
              </v-col>
              <v-col cols="2" class="d-flex justify-center">
                <v-btn
                  v-if="rows.length > 1"
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  density="compact"
                  :aria-label="`Quitar mes ${idx + 1}`"
                  @click="removeRow(idx)"
                />
              </v-col>
            </v-row>
          </div>

          <v-btn
            v-if="rows.length < MAX_ADVANCED_MONTHS_CLIENT"
            variant="text"
            density="compact"
            size="small"
            prepend-icon="mdi-plus"
            color="cyan-darken-2"
            class="mb-2"
            @click="addRow"
          >
            Agregar mes
          </v-btn>

          <v-alert v-if="hasDuplicates" type="warning" variant="tonal" density="compact" class="mb-0">
            No podés repetir el mismo mes en dos filas.
          </v-alert>
          <v-alert
            v-else-if="hasInvalidPeriod"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-0"
          >
            Cada mes debe ser posterior al periodo de este refrendo.
          </v-alert>
        </div>

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
const MAX_ADVANCED_MONTHS_CLIENT = 6;

// How many years ahead to offer in the Año select. A becario can request an
// advance payment at the very start of their retícula and have staff apply
// it to the LAST months of that retícula, years later (live user feedback) —
// so this is deliberately generous, not tied to the next-N-months window the
// previous checkbox-list version used.
const YEARS_AHEAD = 15;

const MONTH_DEFS = [
  { title: "Enero", value: 1 },
  { title: "Febrero", value: 2 },
  { title: "Marzo", value: 3 },
  { title: "Abril", value: 4 },
  { title: "Mayo", value: 5 },
  { title: "Junio", value: 6 },
  { title: "Julio", value: 7 },
  { title: "Agosto", value: 8 },
  { title: "Septiembre", value: 9 },
  { title: "Octubre", value: 10 },
  { title: "Noviembre", value: 11 },
  { title: "Diciembre", value: 12 },
];

const props = defineProps<{
  loading?: boolean;
  // The origin refrendo's own period — the advance path requires a strictly
  // future period relative to this (design D3's assertPeriodIsFuture), so
  // every row must resolve to a period strictly after periodYear/periodMonth.
  periodYear?: number | null;
  periodMonth?: number | null;
}>();

const emit = defineEmits<{ submit: [form: AdvancePaymentForm] }>();
const model = defineModel<boolean>();

interface MonthRow {
  key: number;
  year: number;
  month: number;
}

let rowKeySeq = 0;
const rows = ref<MonthRow[]>([]);
const cause = ref<string | null>(null);
const notes = ref<string | null>(null);

const nextPeriod = (year: number, month: number): { year: number; month: number } => {
  let y = year;
  let m = month + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return { year: y, month: m };
};

const buildDefaultRows = (): MonthRow[] => {
  if (!props.periodYear || !props.periodMonth) return [];
  const { year, month } = nextPeriod(props.periodYear, props.periodMonth);
  return [{ key: rowKeySeq++, year, month }];
};

watch(model, (open) => {
  if (open) {
    rows.value = buildDefaultRows();
  } else {
    rows.value = [];
  }
  cause.value = null;
  notes.value = null;
});

const yearOptions = computed(() => {
  if (!props.periodYear) return [];
  return Array.from({ length: YEARS_AHEAD + 1 }, (_, i) => props.periodYear! + i);
});

// A period is invalid for the advance path when it is not strictly after the
// origin refrendo's own period (design D3's assertPeriodIsFuture, re-checked
// server-side regardless of what this disables client-side).
const isNotAfterOrigin = (year: number, month: number): boolean => {
  if (!props.periodYear || !props.periodMonth) return false;
  const absolute = year * 12 + month;
  const originAbsolute = props.periodYear * 12 + props.periodMonth;
  return absolute <= originAbsolute;
};

const monthOptionsFor = (row: MonthRow) =>
  MONTH_DEFS.map((m) => ({
    ...m,
    props: { disabled: isNotAfterOrigin(row.year, m.value) },
  }));

// If a row's year changes such that its currently-selected month is no
// longer valid (e.g. moving the year back down to the origin year while a
// later month was selected), bump the month forward to the first valid one
// instead of leaving a disabled value silently selected.
const onYearChange = (idx: number, year: number): void => {
  const row = rows.value[idx];
  if (!row) return;
  row.year = year;
  if (isNotAfterOrigin(row.year, row.month)) {
    const firstValid = MONTH_DEFS.find((m) => !isNotAfterOrigin(row.year, m.value));
    row.month = firstValid?.value ?? row.month;
  }
};

const onMonthChange = (idx: number, month: number): void => {
  const row = rows.value[idx];
  if (!row) return;
  row.month = month;
};

const addRow = (): void => {
  if (rows.value.length >= MAX_ADVANCED_MONTHS_CLIENT) return;
  const last = rows.value[rows.value.length - 1];
  const base = last ?? { year: props.periodYear ?? 0, month: props.periodMonth ?? 0 };
  const { year, month } = nextPeriod(base.year, base.month);
  rows.value = [...rows.value, { key: rowKeySeq++, year, month }];
};

const removeRow = (idx: number): void => {
  if (rows.value.length <= 1) return;
  rows.value = rows.value.filter((_, i) => i !== idx);
};

const hasDuplicates = computed(() => {
  const seen = new Set<string>();
  for (const row of rows.value) {
    const key = `${row.year}-${row.month}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
});

const hasInvalidPeriod = computed(() =>
  rows.value.some((row) => isNotAfterOrigin(row.year, row.month)),
);

const isValid = computed(
  () =>
    rows.value.length >= 1 &&
    rows.value.length <= MAX_ADVANCED_MONTHS_CLIENT &&
    !hasDuplicates.value &&
    !hasInvalidPeriod.value,
);

const submit = (): void => {
  if (!isValid.value) return;
  const trimmedCause = cause.value?.trim();
  const trimmedNotes = notes.value?.trim();
  const sorted = [...rows.value].sort(
    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
  );
  emit("submit", {
    months: sorted.map((row) => ({ year: row.year, month: row.month })),
    cause: trimmedCause ? trimmedCause : undefined,
    notes: trimmedNotes ? trimmedNotes : undefined,
  });
};
</script>
