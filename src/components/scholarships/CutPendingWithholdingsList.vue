<template>
  <div>
    <ul class="pl-4 mb-0">
      <li v-for="w in withholdings" :key="w.id">
        {{ monthLabel(w.period_month, w.period_year) }} — {{ fmt(w.remaining_amount) }}
        <v-chip v-if="w.is_current_refrend" size="x-small" color="error" variant="tonal" class="ml-1">
          Este mes
        </v-chip>
      </li>
    </ul>
    <div v-if="hasCurrent" class="text-caption mt-1">
      Deshaz la resolución de este mes (quita la retención) antes de continuar.
    </div>
    <div v-if="hasOther" class="text-caption mt-1">
      Resuélvelas desde "Pago de meses retenidos" antes de continuar.
    </div>
  </div>
</template>

<script setup lang="ts">
// Shared by SituationEgresadoDialog / SituationBajaDialog (CYCLE_CUT_PENDING_
// WITHHOLDINGS, amendment 6): a row flagged is_current_refrend is the cut
// month's own retention and must be undone; any other row is resolved from
// "Pago de meses retenidos".
import { computed } from "vue";
import type { CutPendingWithholding } from "@/interfaces/scholarship";
import { fmt, MONTHS_ES } from "@/composables/useRefrendTableDisplay";

const props = defineProps<{ withholdings: CutPendingWithholding[] }>();

const hasCurrent = computed(() => props.withholdings.some((w) => w.is_current_refrend));
const hasOther = computed(() => props.withholdings.some((w) => !w.is_current_refrend));

const monthLabel = (month: number, year: number): string =>
  `${MONTHS_ES[month - 1] ?? month} ${year}`;
</script>
