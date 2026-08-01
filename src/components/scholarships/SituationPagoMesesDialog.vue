<template>
  <v-dialog v-model="model" max-width="560" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="teal" size="small">mdi-cash-refund</v-icon>
        Pago meses retenidos
      </v-card-title>

      <v-card-text class="pt-0">
        <div v-if="loadingRows" class="d-flex justify-center pa-6">
          <v-progress-circular indeterminate color="teal" size="28" />
        </div>

        <v-alert
          v-else-if="rows.length === 0"
          type="info"
          variant="tonal"
          density="compact"
        >
          Este becario no tiene retenciones pendientes.
        </v-alert>

        <template v-else>
          <v-list density="compact" class="mb-3">
            <v-list-item v-for="row in rows" :key="row.id" class="px-2">
              <template #prepend>
                <v-checkbox
                  v-model="row.selected"
                  density="compact"
                  hide-details
                  color="teal"
                  @update:model-value="onToggleSelected(row)"
                />
              </template>

              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ monthLabel(row) }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                Retenido {{ fmt(row.withheldAmount) }} · Saldo {{ fmt(row.remainingAmount) }}
              </v-list-item-subtitle>

              <template #append>
                <v-text-field
                  v-model.number="row.amount"
                  type="number"
                  variant="outlined"
                  density="compact"
                  prefix="$"
                  style="max-width: 130px"
                  :disabled="!row.selected"
                  :max="row.remainingAmount"
                  hide-details
                />
              </template>
            </v-list-item>
          </v-list>

          <v-text-field
            :model-value="fmt(totalToPay)"
            label="Monto a pagar"
            variant="outlined"
            density="compact"
            readonly
            class="font-weight-bold"
            hide-details
          />
        </template>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="teal"
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
import type { RecordSituationForm, ScholarshipWithholding } from "@/interfaces/scholarship";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import {
  calculateTotalToPay,
  isSelectionValid,
  type WithholdingSelectionRow,
} from "@/utils/withholdingSelection";

const props = defineProps<{
  loading?: boolean;
  userId?: number | null;
}>();

const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const store = useScholarshipStore();

interface Row extends WithholdingSelectionRow {
  withheldAmount: number;
  periodYear: number;
  periodMonth: number;
}

const rows = ref<Row[]>([]);
const loadingRows = ref(false);

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const monthLabel = (row: Row): string =>
  `${MONTH_NAMES[row.periodMonth - 1] ?? row.periodMonth} ${row.periodYear}`;

const fmt = (value: number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const totalToPay = computed(() => calculateTotalToPay(rows.value));
const isValid = computed(() => isSelectionValid(rows.value));

const onToggleSelected = (row: Row): void => {
  if (row.selected && (row.amount === null || row.amount <= 0)) {
    row.amount = row.remainingAmount;
  }
};

const toRow = (w: ScholarshipWithholding): Row => ({
  id: w.id,
  selected: false,
  amount: null,
  remainingAmount: Number(w.remaining_amount),
  withheldAmount: Number(w.withheld_amount),
  periodYear: w.period_year,
  periodMonth: w.period_month,
});

const load = async (): Promise<void> => {
  if (!props.userId) {
    rows.value = [];
    return;
  }
  loadingRows.value = true;
  try {
    const pending = await store.fetchPendingWithholdings(props.userId);
    rows.value = pending.map(toRow);
  } finally {
    loadingRows.value = false;
  }
};

watch(model, (open) => {
  if (open) {
    load();
  } else {
    rows.value = [];
  }
});

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "BECA_MES",
    withholding_payments: rows.value
      .filter((row) => row.selected)
      .map((row) => ({ withholding_id: row.id, amount: row.amount as number })),
  });
};
</script>
