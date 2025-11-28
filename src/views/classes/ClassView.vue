<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12" class="d-flex justify-end align-center gap-2">
      <v-btn class="mx-3" color="grey" @click="openReportModal">
        REPORTE POR PERIODO
      </v-btn>
    </v-col>
    <v-col cols="12">
      <ClassesTable
        :classes="classTable"
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
    @submit="createReport"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
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
  classes,
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
} = useClassPageStore();

const confirmationDialog = ref();

const removeDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, esta información se removerá al igual que las asignaciones de usuarios a las clases de manera permanente. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveClass(id);
};
</script>
