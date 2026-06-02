<template>
  <BreadCrumbs :items="links" />

  <v-row>
    <v-col cols="12">
      <ScholarshipFilters
        :year="selectedYear"
        :month="selectedMonth"
        :campuses="filteredCampus"
        :campus="selectedCampus"
        :generation-id="selectedGenerationId"
        @update:year="selectedYear = $event"
        @update:month="selectedMonth = $event"
        @update:campus="selectedCampus = $event"
        @update:generation-id="selectedGenerationId = $event"
        @search="onPeriodChange"
      >
        <v-btn
          v-if="props.mode === 'atencion'"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="generating"
          :disabled="!selectedCampus || !selectedGenerationId"
          @click="generateDialog = true"
        >
          Generar ref.
        </v-btn>
      </ScholarshipFilters>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <v-alert
        v-if="scholarshipStore.bulkError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        {{ scholarshipStore.bulkError }}
      </v-alert>
      <RefrendMasterTable
        :rows="scholarshipStore.bulkRows"
        :loading="scholarshipStore.bulkLoading"
        :year="selectedYear"
        :month="selectedMonth"
        :mode="props.mode"
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
import { computed, defineAsyncComponent } from "vue";
import { useScholarshipPage } from "@/composables/useScholarshipPage";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";
import type { LinkInterface } from "@/interfaces";

const props = defineProps<{
  mode: "atencion" | "pedagogia";
}>();

const RefrendMasterTable = defineAsyncComponent(
  () => import("@/components/scholarships/RefrendMasterTable.vue"),
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
  filteredCampus,
  generating,
  generateDialog,
  onGeneratePeriod,
} = useScholarshipPage();

// ── Store ──────────────────────────────────────────────────────────────────

const scholarshipStore = useScholarshipStore();

// ── campusLabel for generate dialog ───────────────────────────────────────

const campusLabel = computed<string>(() => {
  const found = filteredCampus.value.find(
    (c) => c.value === selectedCampus.value,
  );
  return found?.text ?? selectedCampus.value ?? "";
});

// ── Period change ──────────────────────────────────────────────────────────

const onPeriodChange = async (): Promise<void> => {
  if (!selectedCampus.value || !selectedGenerationId.value) return;
  await scholarshipStore.fetchBulkTable({
    year: selectedYear.value,
    month: selectedMonth.value,
    campus: selectedCampus.value!,
    generation_id: selectedGenerationId.value!,
  });
};
</script>
