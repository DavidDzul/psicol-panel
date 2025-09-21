<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <ClassesTable
        :classes="classes"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @delete="removeDialog"
      />
    </v-col>
  </v-row>

  <ClassCreateDialog
    v-model="createDialog"
    @submit="onCreateClass"
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
const { links, loading, classes, createDialog, updateDialog, editClass } =
  storeToRefs(useClassPageStore());
const {
  openCreateDialog,
  onCreateClass,
  openUpdateDialog,
  onUpdateClass,
  onRemoveClass,
} = useClassPageStore();

const confirmationDialog = ref();

const removeDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, esta información se removerá del listado al igual que de los datos representados en el informe. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveClass(id);
};
</script>
