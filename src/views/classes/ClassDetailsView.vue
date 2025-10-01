<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <ClassUsersTable
        :class-data="classDetail"
        :attendances="attendances"
        @edit="openUpdateDialog"
        @assign="openAssignDialog"
        @delete="removeDataDialog"
      />
      <ClassAssignUserModa
        v-model="assignDialog"
        :user-campus="filteredCampus"
        :generations="generations"
        :users="users"
        :assigned-user-ids="attendances"
        @findUsers="searchUsers"
        @submit="onAssignUsersToClass"
      />
    </v-col>
  </v-row>

  <ClassUpdateDialog
    v-model="updateDialog"
    :edit-item="editItem"
    @submit="onAttendanceUpdate"
  />

  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ClassUsersTable from "@/components/classes/ClassUsersTable.vue";
import ClassAssignUserModa from "@/components/classes/ClassAssignUserModa.vue";
import ClassUpdateDialog from "@/components/classes/ClassUpdateDialog.vue";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";

import { useClassDetailsPageStore } from "@/stores/views/classDetailsPage";
const {
  links,
  classDetail,
  attendances,
  assignDialog,
  filteredCampus,
  generations,
  users,
  updateDialog,
  editItem,
} = storeToRefs(useClassDetailsPageStore());
const {
  openAssignDialog,
  searchUsers,
  onAssignUsersToClass,
  openUpdateDialog,
  onAttendanceUpdate,
  onRemoveAttendance,
} = useClassDetailsPageStore();

const confirmationDialog = ref();

const removeDataDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, esta información se removerá del listado al igual que de los datos representados para el usuario de manera permanente. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveAttendance(id);
};
</script>
