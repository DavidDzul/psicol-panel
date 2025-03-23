<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <JobApplicationsTable
        :applications="applications"
        @submit="openUserCV"
        @rejected="openBusinessRejectedDialog"
        @accepted="onApplicationAccepted"
        :loading="loadingCV"
      />
      <!-- <UsersTable
        :users="users"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @show="openUserDetail"
      /> -->
    </v-col>
  </v-row>
  <!-- <UserCreateDialog
      v-model="createDialog"
      :user-campus="filteredCampus"
      :loading="loadingCreate"
      :generations="generations"
      @submit="onSaveUser"
    />
    <UserUpdateDialog
      v-model="updateDialog"
      :edit-item="editUser"
      :loading="loadingUpdate"
      @submit="onUpdateUser"
    /> -->
  <RejectedDialog
    v-model="businessRejectedDialog"
    :loading="loadingRejected"
    @submit="onRejectedApplication"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useJobAppliactionPageStore } from "@/stores/views/jobApplicationsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import JobApplicationsTable from "@/components/jobApplications/JobApplicationsTable.vue";
import RejectedDialog from "@/components/jobApplications/RejectedDialog.vue";

const {
  links,
  applications,
  businessRejectedDialog,
  loadingCV,
  loadingRejected,
} = storeToRefs(useJobAppliactionPageStore());
const {
  openBusinessRejectedDialog,
  openUserCV,
  onRejectedApplication,
  onAcceptedApplication,
} = useJobAppliactionPageStore();

const confirmationDialog = ref();

const onApplicationAccepted = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Aceptar postulación",
    body: "Aceptar marcará al candidato como posible seleccionado para esta vacante. ¿Estás seguro de que desea continuar?",
  });
  if (!response) return;
  await onAcceptedApplication(id);
};
</script>
