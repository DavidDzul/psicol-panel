<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12" class="pb-0">
      <span style="color: gray">Buscar por:</span>
    </v-col>
    <v-col cols="12" md="4">
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

    <v-col cols="12" md="4">
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
    <v-col cols="12" md="2" class="d-flex align-center pt-md-0 pb-3">
      <v-btn color="grey" block @click="search">
        <v-icon>mdi-file-search</v-icon> BUSCAR
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>

    <v-col cols="12" md="2" class="d-flex align-center pt-md-0 pb-3">
      <v-btn color="warning" block @click="openReportModal">
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
  <ReportByGenerationModal
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
import ReportByGenerationModal from "@/components/classes/ReportByGenerationModal.vue";

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

const filteredGenerations = computed(() =>
  generations.value.filter((g) => g.campus === campus.value)
);

watch(
  filteredCampus,
  (newCampusList) => {
    if (newCampusList && newCampusList.length > 0) {
      campus.value = newCampusList[0].value;
    }
  },
  { immediate: true }
);

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
