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
          v-else-if="rows.length === 0 && hasOnlyStaleDebt"
          type="info"
          variant="tonal"
          density="compact"
        >
          No hay meses pagables actualmente.
        </v-alert>

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
            <template v-for="row in rows" :key="row.id">
              <v-list-item class="px-2">
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
                    :readonly="row.selected"
                    :max="row.remainingAmount"
                    hide-details
                  />
                  <v-btn
                    v-if="hasPaymentHistory(row.withheldAmount - row.remainingAmount)"
                    icon="mdi-history"
                    variant="text"
                    size="x-small"
                    class="ml-1"
                    @click="row.historyOpen = !row.historyOpen"
                  />
                </template>
              </v-list-item>

              <v-expand-transition>
                <div
                  v-if="row.historyOpen && hasPaymentHistory(row.withheldAmount - row.remainingAmount)"
                  class="pl-8 pr-2 pb-2"
                >
                  <v-list density="compact" class="bg-grey-lighten-4 rounded">
                    <v-list-item
                      v-for="payment in row.payments"
                      :key="payment.id"
                      density="compact"
                      class="px-2"
                    >
                      <v-list-item-title class="text-caption">
                        {{ formatDate(payment.created_at) }} · {{ fmt(Number(payment.amount)) }}
                        <span v-if="payment.created_by">
                          · por {{ payment.created_by.first_name }} {{ payment.created_by.last_name }}
                        </span>
                      </v-list-item-title>

                      <template #append>
                        <v-btn
                          icon="mdi-undo-variant"
                          variant="text"
                          size="x-small"
                          color="error"
                          @click="openVoidDialog(row, payment)"
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-expand-transition>
            </template>
          </v-list>

          <v-checkbox
            v-model="payCurrentMonth"
            density="compact"
            hide-details
            color="teal"
            label="¿Pagar mes en curso?"
            class="mb-1"
          />
          <v-alert
            v-if="!payCurrentMonth"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            El mes en curso quedará como <strong>Sin pago</strong>. Esta es
            una resolución definitiva — no se puede revertir desde este
            diálogo, no es lo mismo que posponer el pago.
          </v-alert>

          <div class="text-caption text-medium-emphasis mb-1">
            Mes actual {{ fmt(currentMonthDisplayAmount) }} + retenciones seleccionadas
            {{ fmt(totalToPay) }}
          </div>
          <v-text-field
            :model-value="fmt(grandTotal)"
            label="Monto final a pagar"
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

  <VoidWithholdingPaymentDialog
    v-model="voidDialogOpen"
    :loading="voiding"
    :payment="voidTarget"
    @confirm="confirmVoid"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  RecordSituationForm,
  ScholarshipWithholding,
  ScholarshipWithholdingPayment,
} from "@/interfaces/scholarship";
import type { PendingWithholdingsMeta } from "@/interfaces/api";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import {
  calculateTotalToPay,
  isSelectionValid,
  type WithholdingSelectionRow,
} from "@/utils/withholdingSelection";
import { hasPaymentHistory } from "@/utils/withholdingVoid";
import VoidWithholdingPaymentDialog, {
  type VoidWithholdingPaymentTarget,
} from "@/components/scholarships/VoidWithholdingPaymentDialog.vue";

const props = defineProps<{
  loading?: boolean;
  userId?: number | null;
  currentMonthAmount?: string | number | null;
  // Current refrendo's own period — forwarded to the backend as
  // relative_year/relative_month so it can narrow `data` down to the
  // payable (3-month window, top-2 most recent) subset server-side.
  periodYear?: number | null;
  periodMonth?: number | null;
}>();

const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const store = useScholarshipStore();

interface Row extends WithholdingSelectionRow {
  withheldAmount: number;
  periodYear: number;
  periodMonth: number;
  payments: ScholarshipWithholdingPayment[];
  historyOpen: boolean;
}

const rows = ref<Row[]>([]);
const loadingRows = ref(false);
const meta = ref<PendingWithholdingsMeta | undefined>(undefined);

// Distinguishes "no debt at all" (generic empty message) from "debt exists
// but nothing is payable right now" (explicit messaging per spec — old debt
// outside the 3-month window must not look like a silent empty list).
const hasOnlyStaleDebt = computed(
  () => (meta.value?.eligible_count ?? 0) === 0 && (meta.value?.total_pending_count ?? 0) > 0,
);

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const monthLabel = (row: Row): string =>
  `${MONTH_NAMES[row.periodMonth - 1] ?? row.periodMonth} ${row.periodYear}`;

const fmt = (value: number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const formatDate = (value: string): string => new Date(value).toLocaleDateString("es-MX");

const totalToPay = computed(() => calculateTotalToPay(rows.value));
const isValid = computed(() => isSelectionValid(rows.value));

// Whether the admin wants to pay the current refrendo's own due amount in
// this same action. Default true (preexisting behavior — this dialog always
// used to pay it). Unchecking it resolves the current month as SIN_PAGO
// (definitive, see submit()) instead of deferring it.
const payCurrentMonth = ref(true);

// currentMonthAmount keeps arriving unchanged from the parent (the real due
// amount via computeDueAmount) — only the display/total gating is internal
// to this dialog when the checkbox is off.
const currentMonthAmountNumber = computed(() => Number(props.currentMonthAmount ?? 0));
const currentMonthDisplayAmount = computed(() =>
  payCurrentMonth.value ? currentMonthAmountNumber.value : 0,
);
const grandTotal = computed(() => currentMonthDisplayAmount.value + totalToPay.value);

// The amount input is readonly once its row is selected (see template) — the
// admin can no longer type a custom partial amount, so selecting a row always
// pins `amount` to the full remaining balance. Deselecting clears it back to
// `null`, matching `toRow`'s initial state.
const onToggleSelected = (row: Row): void => {
  row.amount = row.selected ? row.remainingAmount : null;
};

const toRow = (w: ScholarshipWithholding): Row => ({
  id: w.id,
  selected: false,
  amount: null,
  remainingAmount: Number(w.remaining_amount),
  withheldAmount: Number(w.withheld_amount),
  periodYear: w.period_year,
  periodMonth: w.period_month,
  payments: w.payments ?? [],
  historyOpen: false,
});

const load = async (): Promise<void> => {
  if (!props.userId) {
    rows.value = [];
    meta.value = undefined;
    return;
  }
  loadingRows.value = true;
  try {
    const { rows: pending, meta: pendingMeta } = await store.fetchPendingWithholdings(
      props.userId,
      props.periodYear,
      props.periodMonth,
    );
    rows.value = pending.map(toRow);
    meta.value = pendingMeta;
  } finally {
    loadingRows.value = false;
  }
};

watch(model, (open) => {
  if (open) {
    load();
  } else {
    rows.value = [];
    meta.value = undefined;
    payCurrentMonth.value = true;
  }
});

const submit = () => {
  if (!isValid.value) return;
  const withholdingPayments = rows.value
    .filter((row) => row.selected)
    .map((row) => ({ withholding_id: row.id, amount: row.amount as number }));

  if (payCurrentMonth.value) {
    emit("submit", {
      resolution_type: "BECA_MES",
      withholding_payments: withholdingPayments,
    });
    return;
  }

  emit("submit", {
    resolution_type: "SIN_PAGO",
    resolution_cause: "PAGO_MESES_RETENIDOS_SIN_MES_ACTUAL",
    withholding_payments: withholdingPayments,
  });
};

// ── Void a single payment ───────────────────────────────────────────────────

const voidDialogOpen = ref(false);
const voiding = ref(false);
const voidTarget = ref<VoidWithholdingPaymentTarget | null>(null);
const voidContext = ref<{ withholdingId: number; paymentId: number } | null>(null);

const openVoidDialog = (row: Row, payment: ScholarshipWithholdingPayment): void => {
  voidContext.value = { withholdingId: row.id, paymentId: payment.id };
  voidTarget.value = {
    amount: Number(payment.amount),
    createdAt: formatDate(payment.created_at),
    periodLabel: monthLabel(row),
  };
  voidDialogOpen.value = true;
};

const confirmVoid = async (reason: string): Promise<void> => {
  if (!voidContext.value) return;
  voiding.value = true;
  try {
    const success = await store.voidWithholdingPayment(
      voidContext.value.withholdingId,
      voidContext.value.paymentId,
      reason,
    );
    if (success) {
      voidDialogOpen.value = false;
      await load();
    }
  } finally {
    voiding.value = false;
  }
};
</script>
