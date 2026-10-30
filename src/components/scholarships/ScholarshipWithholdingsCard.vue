<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-alert v-if="error" type="error" variant="tonal" density="compact">
      {{ error }}
    </v-alert>

    <v-list v-else-if="rows.length > 0" lines="three" density="compact">
      <v-list-item v-for="row in rows" :key="row.id">
        <template #title>
          <span class="text-body-2 font-weight-medium">{{ withholdingPeriodLabel(row) }}</span>
        </template>
        <template #subtitle>
          <div>
            Retenido: {{ fmt(row.withheld_amount) }} · Pagado: {{ fmt(row.paid_amount) }}
          </div>
          <div v-if="row.cause">Causa: {{ row.cause }}</div>
          <div v-if="row.status === 'CANCELLED'" class="withholding-cancellation">
            Motivo: {{ cancellationReasonLabel(row.cancellation_reason) }}
            <template v-if="row.cancelled_at"> · {{ formatCancelledAt(row.cancelled_at) }}</template>
            <template v-if="row.cancelled_by"> · Cancelada por {{ cancellerName(row.cancelled_by) }}</template>
          </div>
        </template>
        <template #append>
          <v-chip :color="withholdingStatusChip(row.status).color" size="x-small" label>
            {{ withholdingStatusChip(row.status).label }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <div v-else-if="!loading" class="text-body-2 text-medium-emphasis pa-2">
      Este becario no tiene retenciones.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { fmt } from "@/composables/useRefrendTableDisplay";
import { useScholarshipWithholdings } from "@/composables/useScholarshipWithholdings";
import {
  cancellationReasonLabel,
  formatCancelledAt,
  withholdingPeriodLabel,
  withholdingStatusChip,
} from "@/utils/withholdingLabels";

// sdd/retenciones-pendientes S7 (R7.2): read-only ledger of the becario's
// withholdings, including who/why/when for cancelled ones.
const props = defineProps<{
  userId: number;
}>();

const { rows, loading, error, load } = useScholarshipWithholdings();

const cancellerName = (user: { first_name: string; last_name: string }): string =>
  `${user.first_name} ${user.last_name}`.trim();

onMounted(() => load(props.userId));
</script>
