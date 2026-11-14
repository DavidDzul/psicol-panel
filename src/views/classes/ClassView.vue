<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12" md="3">
      <v-select
        clearable
        :items="filteredCampus"
        v-model="campus"
        item-title="text"
        item-value="value"
        label="Sede"
        density="compact"
        prepend-icon="mdi-map-marker"
      />
    </v-col>

    <v-col cols="12" md="3">
      <v-select
        clearable
        :items="filteredGenerations"
        v-model="generation_id"
        item-title="generation_name"
        item-value="id"
        label="Generación"
        density="compact"
        prepend-icon="mdi-account-group"
      />
    </v-col>
    <v-col cols="6" md="3">
      <v-select
        :items="yearOptions"
        v-model="year"
        label="Año"
        density="compact"
        prepend-icon="mdi-calendar"
      />
    </v-col>

    <v-col cols="6" md="3">
      <v-select
        :items="monthOptions"
        v-model="month"
        item-title="title"
        item-value="value"
        label="Mes"
        density="compact"
      />
    </v-col>
  </v-row>
  <v-row class="mt-0">
    <v-col cols="12" class="d-flex flex-wrap justify-end ga-2 pt-0">
      <v-btn color="grey" @click="search">
        <v-icon start>mdi-file-search</v-icon>
        BUSCAR
      </v-btn>
      <v-btn color="warning" @click="openReportModal">
        <v-icon start>mdi-file-download</v-icon>
        REPORTE
      </v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <ClassesTable
        :classes="classTable"
        :loading="loading"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @delete="removeDialog"
        @show="openClassDetail"
      />
    </v-col>
  </v-row>

  <ClassCreateDialog
    v-model="createDialog"
    @submit="onCreateClass"
    :admin-campus="filteredCampus"
    :generations="generations"
    :loading="loading"
  />
  <ClassUpdateDialog
    v-model="updateDialog"
    :edit-item="editClass"
    :loading="loading"
    @submit="onUpdateClass"
  />
  <!-- <GenerationCreateDialog
    v-model="createDialog"
    @submit="onSaveGeneration"
    :user-campus="filteredCampus"
    :loading="loadingCreate"
  /> -->
  <ReportSemesterModal
    v-model="reportModal"
    :admin-campus="filteredCampus"
    :generations="generations"
    :loading="loading"
    @submit="createReport"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useClassPageStore } from "@/stores/views/classPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ClassesTable from "@/components/classes/ClassesTable.vue";
import ClassCreateDialog from "@/components/classes/ClassCreateDialog.vue";
import ClassUpdateDialog from "@/components/classes/ClassUpdateDialog.vue";
import ReportSemesterModal from "@/components/classes/ReportSemesterModal.vue";
import { monthBirth } from "@/constants";
import { ALL_MONTHS } from "@/utils/classPeriodFilter";

const {
  links,
  loading,
  createDialog,
  updateDialog,
  editClass,
  generations,
  filteredCampus,
  reportModal,
  classTable,
  year,
  month,
  yearOptions,
} = storeToRefs(useClassPageStore());
const {
  openCreateDialog,
  onCreateClass,
  openUpdateDialog,
  onUpdateClass,
  onRemoveClass,
  openClassDetail,
  createReport,
  openReportModal,
  searchData,
} = useClassPageStore();

const confirmationDialog = ref();
const campus = ref(null);
const generation_id = ref(null);

const monthOptions = [
  { title: "Todos los meses", value: ALL_MONTHS },
  ...monthBirth.map((m) => ({ title: m.text, value: m.value })),
];

const filteredGenerations = computed(() =>
  generations.value.filter((g) => g.campus === campus.value),
);

watch(
  filteredCampus,
  (newCampusList) => {
    if (newCampusList && newCampusList.length > 0) {
      campus.value = newCampusList[0].value;
    }
  },
  { immediate: true },
);

// Re-run the search when the period changes (no-op until campus + generation are set).
watch([year, month], () => search());

watch(campus, (newCampusValue, oldCampusValue) => {
  if (newCampusValue !== oldCampusValue) {
    generation_id.value = null;
  }
});

const removeDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, esta información se removerá al igual que las asignaciones de usuarios a las clases de manera permanente. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveClass(id);
};

const search = () => {
  if (campus.value && generation_id.value) {
    const form = { campus: campus.value, generation_id: generation_id.value };
    searchData(form);
  }
};
</script>
