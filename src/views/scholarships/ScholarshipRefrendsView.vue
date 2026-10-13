<template>
  <BreadCrumbs :items="links" />

  <v-row>
    <v-col cols="12">
      <v-card v-if="props.mode === 'verificacion'" color="white" variant="flat">
        <v-card-text>
          <ScholarshipFilters
            :year="selectedYear"
            :month="selectedMonth"
            :campuses="filteredCampus"
            :campus="selectedCampus"
            :generation-id="selectedGenerationId"
            :require-generation="false"
            @update:year="selectedYear = $event"
            @update:month="selectedMonth = $event"
            @update:campus="selectedCampus = $event"
            @update:generation-id="selectedGenerationId = $event"
            @search="onPeriodChange"
          >
            <v-btn
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
            :require-generation="false"
            @update:year="selectedYear = $event"
            @update:month="selectedMonth = $event"
            @update:campus="selectedCampus = $event"
            @update:generation-id="selectedGenerationId = $event"
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
      <VerificacionRefrendTable
        v-if="props.mode === 'verificacion'"
        :rows="activeRows"
        :loading="activeLoading"
        :year="selectedYear"
        :month="selectedMonth"
      />
      <AprobacionRefrendTable
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
import { computed, defineAsyncComponent, onUnmounted } from "vue";
import { useScholarshipPage } from "@/composables/useScholarshipPage";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";
import type { LinkInterface } from "@/interfaces";

const props = defineProps<{
  mode: "verificacion" | "aprobacion";
}>();

const VerificacionRefrendTable = defineAsyncComponent(
  () => import("@/components/scholarships/VerificacionRefrendTable.vue"),
);
const AprobacionRefrendTable = defineAsyncComponent(
  () => import("@/components/scholarships/AprobacionRefrendTable.vue"),
);

// ── Breadcrumbs ────────────────────────────────────────────────────────────

const sectionTitle = computed(() =>
  props.mode === "aprobacion" ? "Aprobación" : "Verificación",
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
// sdd/verificacion-incidencias-ux PR2: both modes now read the SAME
// incidencias* pair (design: "Verificación reads the incidencias* pair, the
// same as Aprobación already does"). The bulk* pair is left in the store,
// unused by this view — removing it is a follow-up (design note).

const scholarshipStore = useScholarshipStore();

const activeRows = computed(() => scholarshipStore.incidenciasRows);
const activeLoading = computed(() => scholarshipStore.incidenciasLoading);
const activeError = computed(() => scholarshipStore.incidenciasError);

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
// sdd/verificacion-incidencias-ux PR2: generación is no longer required to
// query in either mode — sede (campus) + period are enough, and the table
// groups the results by `refrend.snapshot_generation` client-side.

const onPeriodChange = async (): Promise<void> => {
  if (!selectedCampus.value) return;
  await scholarshipStore.fetchIncidenciasTable({
    year: selectedYear.value,
    month: selectedMonth.value,
    campus: selectedCampus.value!,
    generation_id: null,
    per_page: 500,
  });
};
</script>
