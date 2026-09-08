<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-list v-if="items.length > 0" lines="two" density="compact">
      <v-list-item
        v-for="refrend in items"
        :key="refrend.id"
        :subtitle="`Base: ${fmt(refrend.base_amount)} · Descuento: ${refrend.discount_percentage}% · Final: ${fmt(refrend.final_amount)}`"
        @click="$router.push(`/scholarships/${refrend.id}`)"
        class="cursor-pointer"
      >
        <template #title>
          <span class="text-body-2 font-weight-medium">{{ monthLabel(refrend) }}</span>
        </template>
        <template #append>
          <v-chip :color="statusColor(refrend.status)" size="x-small" label>
            {{ statusLabel(refrend.status) }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <div v-else-if="!loading" class="text-body-2 text-medium-emphasis pa-2">
      Sin refrendos registrados.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { ScholarshipRefrend } from "@/interfaces/scholarship";
import {
  refrendStatusColor as statusColor,
  refrendStatusLabel as statusLabel,
} from "@/utils/refrendStatusDisplay";

const props = defineProps<{
  userId: number;
}>();

const store = useScholarshipStore();
const items   = ref<ScholarshipRefrend[]>([]);
const loading = ref<boolean>(false);

onMounted(async () => {
  loading.value = true;
  items.value = await store.fetchRefrendsForUser(props.userId);
  loading.value = false;
});

const months = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const monthLabel = (r: ScholarshipRefrend): string =>
  `${months[r.period_month - 1]} ${r.period_year}`;

const fmt = (v: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(v));

</script>
