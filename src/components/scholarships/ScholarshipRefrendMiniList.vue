<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-list v-if="items.length > 0" lines="two" density="compact">
      <v-list-item
        v-for="refrend in items"
        :key="refrend.id"
        :subtitle="subtitle(refrend)"
      >
        <template #title>
          <span class="text-body-2 font-weight-medium">{{ monthLabel(refrend) }}</span>
        </template>
        <template #append>
          <v-chip
            :color="statusChip(refrend).color"
            :prepend-icon="statusChip(refrend).icon"
            size="x-small"
            label
          >
            {{ statusChip(refrend).label }}
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
import { baseAmountLabel } from "@/utils/baseAmountLabel";
import { ref, onMounted } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { ScholarshipRefrend } from "@/interfaces/scholarship";
import { statusChip } from "@/composables/useRefrendTableDisplay";

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

// sdd/descuento-beca-apoyo: show the NET Beca (Pago IU for TELMEX_IU) and
// Apoyo computed by the API. Refrends without net_breakdown fall back to the
// nominal base_amount so the list never renders blank amounts.
const subtitle = (r: ScholarshipRefrend): string => {
  const label = baseAmountLabel(r.snapshot_scholarship_type);
  const nb = r.net_breakdown;
  const component = r.snapshot_scholarship_type === "TELMEX_IU" ? "pago_iu" : "beca";
  const parts = [`${label}: ${fmt(nb ? nb[component] : r.base_amount)}`];
  if (nb && Number(nb.nominal.apoyo) > 0) parts.push(`Apoyo: ${fmt(nb.apoyo)}`);
  parts.push(
    `Descuento: ${r.discount_percentage}%`,
    `Final: ${fmt(r.final_amount)}`,
  );
  return parts.join(" · ");
};

const fmt = (v: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(v));

</script>
