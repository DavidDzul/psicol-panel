<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <NoticesTable
        :notices="notices"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @delete="removeDialog"
      />
    </v-col>
  </v-row>

  <CreateNoticeDialog
    v-model="createDialog"
    :admin-campus="filteredCampus"
    :loading="loading"
    :root="isRoot"
    @submit="onCreateNotice"
  />
  <UpdateNoticeDialog
    v-model="updateDialog"
    :admin-campus="filteredCampus"
    :edit-item="editItem"
    :loading="loading"
    :root="isRoot"
    @submit="onUpdateNotice"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import CreateNoticeDialog from "@/components/notices/CreateNoticeDialog.vue";
import UpdateNoticeDialog from "@/components/notices/UpdateNoticeDialog.vue";
import NoticesTable from "@/components/notices/NoticesTable.vue";
import { useNoticePageStore } from "@/stores/views/noticePage";

const {
  links,
  notices,
  loading,
  createDialog,
  filteredCampus,
  editItem,
  updateDialog,
  isRoot,
} = storeToRefs(useNoticePageStore());
const {
  openCreateDialog,
  onCreateNotice,
  openUpdateDialog,
  onUpdateNotice,
  onRemoveNotice,
} = useNoticePageStore();

const confirmationDialog = ref();

const removeDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, esta información se removerá de manera permanente. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveNotice(id);
};
</script>
