<template>
  <BreadCrumbs :items="links" />

  <v-row>
    <v-col cols="12">
      <v-card v-if="props.mode === 'atencion'" color="white" variant="flat">
        <v-tabs
          v-model="viewVariant"
          align-tabs="center"
          color="primary"
          bg-color="grey-lighten-3"
        >
          <v-tab value="completa">
            <v-icon size="small" class="mr-1">mdi-table</v-icon>
            <b>CONSULTA POR GENERACIONES</b>
          </v-tab>
          <v-tab value="incidencias">
            <v-icon size="small" class="mr-1">mdi-flag-outline</v-icon>
            <b>CONSULTA POR INCIDENCIAS</b>
          </v-tab>
        </v-tabs>

        <v-card-text>
          <ScholarshipFilters
            :year="selectedYear"
            :month="selectedMonth"
            :campuses="filteredCampus"
            :campus="selectedCampus"
            :generation-id="selectedGenerationId"
            :require-generation="requireGeneration"
            :advance-payment-only="advancePaymentOnly"
            @update:year="selectedYear = $event"
            @update:month="selectedMonth = $event"
            @update:campus="selectedCampus = $event"
            @update:generation-id="selectedGenerationId = $event"
            @update:advance-payment-only="advancePaymentOnly = $event"
            @search="onPeriodChange"
          >
            <v-btn
              v-if="viewVariant === 'completa'"
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="generating"
              :disabled="!selectedCampus || !selectedGenerationId"
              @click="generateDialog = true"
            >
              Generar ref.
            </v-btn>
          </ScholarshipFilters>
        </v-card-text>
      </v-card>

      <v-card v-else color="white" variant="flat">
        <v-card-text>
          <ScholarshipFilters
            :year="selectedYear"
            :month="selectedMonth"
            :campuses="filteredCampus"
            :campus="selectedCampus"
            :generation-id="selectedGenerationId"
            :require-generation="requireGeneration"
            :advance-payment-only="advancePaymentOnly"
            @update:year="selectedYear = $event"
            @update:month="selectedMonth = $event"
            @update:campus="selectedCampus = $event"
            @update:generation-id="selectedGenerationId = $event"
            @update:advance-payment-only="advancePaymentOnly = $event"
            @search="onPeriodChange"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <v-alert
        v-if="activeError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        {{ activeError }}
      </v-alert>
      <AtencionRefrendTable
        v-if="props.mode === 'atencion'"
        :rows="activeRows"
        :loading="activeLoading"
        :year="selectedYear"
        :month="selectedMonth"
        :view-variant="viewVariant"
      />
      <PedagogiaRefrendTable
        v-else
        :rows="activeRows"
        :loading="activeLoading"
        :year="selectedYear"
        :month="selectedMonth"
      />
    </v-col>
  </v-row>

  <!-- Generate period confirmation -->
  <v-dialog v-model="generateDialog" max-width="440">
    <v-card>
      <v-card-title class="pa-4">Generar refrendos</v-card-title>
      <v-card-text>
        <p>
          Esto generará refrendos en estado <strong>Borrador</strong> para todos
          los becarios activos
          <template v-if="selectedCampus">
            de la sede <strong>{{ campusLabel }}</strong>
          </template>
          del periodo seleccionado. Los que ya existan serán omitidos.
        </p>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="generateDialog = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="generating"
          :disabled="!selectedCampus || !selectedGenerationId"
          @click="onGeneratePeriod"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onUnmounted, ref, watch } from "vue";
import { useScholarshipPage } from "@/composables/useScholarshipPage";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";
import { buildBulkTableParams } from "@/utils/scholarshipBulkTableParams";
import type { LinkInterface } from "@/interfaces";

const props = defineProps<{
  mode: "atencion" | "pedagogia";
}>();

// ── View variant (Completa | Incidencias) ───────────────────────────────────
// Solo Atención puede alternar (ver v-tabs arriba, oculto para Pedagogía).
// Pedagogía queda fija en "incidencias", sin UI para cambiarla.
const viewVariant = ref<"completa" | "incidencias">(
  props.mode === "pedagogia" ? "incidencias" : "completa",
);

// When the router reuses this component across atencion/pedagogia routes,
// the ref above keeps its previous value. Reset it whenever mode changes.
watch(
  () => props.mode,
  (mode) => {
    viewVariant.value = mode === "pedagogia" ? "incidencias" : "completa";
  },
);

const requireGeneration = computed(() => viewVariant.value === "completa");

const AtencionRefrendTable = defineAsyncComponent(
  () => import("@/components/scholarships/AtencionRefrendTable.vue"),
);
const PedagogiaRefrendTable = defineAsyncComponent(
  () => import("@/components/scholarships/PedagogiaRefrendTable.vue"),
);

// ── Breadcrumbs ────────────────────────────────────────────────────────────

const sectionTitle = computed(() =>
  props.mode === "pedagogia" ? "Pedagogía" : "Atención a Becarios",
);

const links = computed<LinkInterface[]>(() => [
  { title: "Inicio", disabled: false, href: "/" },
  { title: sectionTitle.value, disabled: true, href: "#" },
]);

// ── Shared composable ──────────────────────────────────────────────────────

const {
  selectedYear,
  selectedMonth,
  selectedCampus,
  selectedGenerationId,
  advancePaymentOnly,
  filteredCampus,
  generating,
  generateDialog,
  onGeneratePeriod,
} = useScholarshipPage();

// ── Store ──────────────────────────────────────────────────────────────────
// Completa e Incidencias son queries independientes (ver scholarshipStore) —
// se lee/resetea el par de estado que corresponde a la variante activa.

const scholarshipStore = useScholarshipStore();

const activeRows = computed(() =>
  viewVariant.value === "incidencias"
    ? scholarshipStore.incidenciasRows
    : scholarshipStore.bulkRows,
);
const activeLoading = computed(() =>
  viewVariant.value === "incidencias"
    ? scholarshipStore.incidenciasLoading
    : scholarshipStore.bulkLoading,
);
const activeError = computed(() =>
  viewVariant.value === "incidencias"
    ? scholarshipStore.incidenciasError
    : scholarshipStore.bulkError,
);

onUnmounted(() => {
  scholarshipStore.resetBulkTable();
  scholarshipStore.resetIncidenciasTable();
});

// ── campusLabel for generate dialog ───────────────────────────────────────

const campusLabel = computed<string>(() => {
  const found = filteredCampus.value.find(
    (c) => c.value === selectedCampus.value,
  );
  return found?.text ?? selectedCampus.value ?? "";
});

// ── Period change ──────────────────────────────────────────────────────────

const onPeriodChange = async (): Promise<void> => {
  if (
    !selectedCampus.value ||
    (requireGeneration.value && !selectedGenerationId.value)
  )
    return;
  const params = buildBulkTableParams({
    year: selectedYear.value,
    month: selectedMonth.value,
    campus: selectedCampus.value!,
    generationId: selectedGenerationId.value,
    requireGeneration: requireGeneration.value,
    advancePaymentOnly: advancePaymentOnly.value,
    perPage: 500,
  });
  if (viewVariant.value === "incidencias") {
    await scholarshipStore.fetchIncidenciasTable(params);
  } else {
    await scholarshipStore.fetchBulkTable(params);
  }
};
</script>
