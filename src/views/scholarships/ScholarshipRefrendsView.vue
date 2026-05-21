<template>
  <BreadCrumbs :items="links" />

  <v-row>
    <v-col cols="12">
      <ScholarshipFilters
        :year="selectedYear"
        :month="selectedMonth"
        :campuses="filteredCampus"
        :campus="selectedCampus"
        @update:year="selectedYear = $event"
        @update:month="selectedMonth = $event"
        @update:campus="selectedCampus = $event"
        @search="onPeriodChange"
      >
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="generating"
          @click="generateDialog = true"
        >
          Generar refrendos
        </v-btn>
      </ScholarshipFilters>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <ScholarshipTable :refrends="refrendList" @show="goToDetail" />
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
          @click="onGeneratePeriod"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useScholarshipPage } from "@/composables/useScholarshipPage";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ScholarshipTable from "@/components/scholarships/ScholarshipTable.vue";
import ScholarshipFilters from "@/components/scholarships/ScholarshipFilters.vue";
import type { ScholarshipRefrend } from "@/interfaces/scholarship";
import type { LinkInterface } from "@/interfaces";

const router = useRouter();

const links: LinkInterface[] = [
  { title: "Inicio", disabled: false, href: "/" },
  { title: "Refrendos", disabled: true, href: "/scholarships" },
];

const {
  selectedYear,
  selectedMonth,
  selectedCampus,
  filteredCampus,
  generating,
  generateDialog,
  refrendList,
  onPeriodChange,
  onGeneratePeriod,
} = useScholarshipPage();

const campusLabel = computed<string>(() => {
  const found = filteredCampus.value.find((c) => c.value === selectedCampus.value);
  return found?.text ?? selectedCampus.value ?? "";
});

const goToDetail = (refrend: ScholarshipRefrend): void => {
  router.push(`/scholarships/${refrend.id}`);
};
</script>
