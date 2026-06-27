<template>
  <BreadCrumbs :items="links" />

  <v-row>
    <v-col cols="12">
      <v-card v-if="props.mode === 'atencion'" variant="flat">
        <v-tabs v-model="viewVariant" color="primary" density="compact">
          <v-tab value="completa">
            <v-icon size="small" class="mr-1">mdi-table</v-icon>
            Consultar por generación
          </v-tab>
          <v-tab value="incidencias">
            <v-icon size="small" class="mr-1">mdi-flag-outline</v-icon>
            Consultar por incidencias del mes
          </v-tab>
        </v-tabs>
      </v-card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <ScholarshipFilters
        :year="selectedYear"
        :month="selectedMonth"
        :campuses="filteredCampus"
        :campus="selectedCampus"
        :generation-id="selectedGenerationId"
        :require-generation="requireGeneration"
        @update:year="selectedYear = $event"
        @update:month="selectedMonth = $event"
        @update:campus="selectedCampus = $event"
        @update:generation-id="selectedGenerationId = $event"
        @search="onPeriodChange"
      >
        <v-btn
          v-if="props.mode === 'atencion' && viewVariant === 'completa'"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="generating"
          :disabled="!selectedCampus || !selectedGenerationId"
          @click="generateDialog = true"
        >
          Generar ref.
        </v-btn>

        <v-btn
          v-if="props.mode === 'pedagogia'"
          color="primary"
          prepend-icon="mdi-check-all"
          :loading="closingDrafts"
          :disabled="cleanDraftIds.length === 0"
          @click="closeDraftsDialog = true"
        >
          Cerrar borradores ({{ cleanDraftIds.length }})
        </v-btn>
      </ScholarshipFilters>
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
      <RefrendMasterTable
        :rows="activeRows"
        :loading="activeLoading"
        :year="selectedYear"
        :month="selectedMonth"
        :mode="props.mode"
        :view-variant="viewVariant"
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

  <!-- Close clean drafts confirmation (Pedagogía) -->
  <v-dialog v-model="closeDraftsDialog" max-width="440">
    <v-card>
      <v-card-title class="pa-4">Cerrar borradores</v-card-title>
      <v-card-text>
        <p>
          Esto pasará <strong>{{ cleanDraftIds.length }}</strong> refrendo(s) en
          Borrador sin incidencia a estado <strong>Listo para pago</strong>. Son
          becarios que nunca tuvieron una incidencia, por lo que no aparecen en
          esta tabla.
        </p>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="closeDraftsDialog = false"
          >Cancelar</v-btn
        >
        <v-btn
          color="primary"
          variant="elevated"
          :loading="closingDrafts"
          @click="onCloseCleanDrafts"
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
  (mode) => { viewVariant.value = mode === "pedagogia" ? "incidencias" : "completa"; },
);

const requireGeneration = computed(() => viewVariant.value === "completa");

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

// ── Cerrar borradores sin incidencia (Pedagogía) ────────────────────────────
// Becarios en DRAFT que nunca tuvieron incidencia (incidents_count === 0) no
// aparecen en ninguna fila de la tabla de Incidencias — sin este botón nunca
// avanzan a Listo para pago. `incidenciasRows` trae el fetch SIN filtrar, así
// que acá sí podemos verlos aunque `RefrendMasterTable` no los renderice.
const cleanDraftIds = computed<number[]>(() =>
  scholarshipStore.incidenciasRows
    .filter(
      (r) => r.refrend.workflow_status === "DRAFT" && r.incidents_count === 0,
    )
    .map((r) => r.refrend.id),
);

const closeDraftsDialog = ref(false);
const closingDrafts = ref(false);

const onCloseCleanDrafts = async (): Promise<void> => {
  closingDrafts.value = true;
  try {
    await scholarshipStore.bulkApprove(cleanDraftIds.value);
    closeDraftsDialog.value = false;
  } finally {
    closingDrafts.value = false;
  }
};

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
  const params = {
    year: selectedYear.value,
    month: selectedMonth.value,
    campus: selectedCampus.value!,
    generation_id: requireGeneration.value ? selectedGenerationId.value! : null,
    per_page: 500,
  };
  if (viewVariant.value === "incidencias") {
    await scholarshipStore.fetchIncidenciasTable(params);
  } else {
    await scholarshipStore.fetchBulkTable(params);
  }
};
</script>
