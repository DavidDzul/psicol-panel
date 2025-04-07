<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <VacantPositionTable
        :positions="positions"
        :loading="loadingTable"
        @laboral="openVacantDialog"
        @junior="openVacantJuniorDialog"
        @practice="openVacantPracticeDialog"
        @show="openVacantDetail"
        @disabled="openDisabledDialog"
        @enable="openEnableDialog"
        :read="readVacant"
        :create="createVacant"
        :edit="editVacant"
      />
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

  <VacantCreateDialog
    v-model="vacantDialog"
    :loading="loadingCreate"
    @submit="saveVacantPosition"
  />
  <VacantJrCreateDialog
    v-model="vacantJuniorDialog"
    :loading="loadingCreate"
    @submit="saveVacantJunior"
  />
  <VacantPracticeCreateDialog
    v-model="practiceDialog"
    :loading="loadingCreate"
    @submit="saveVacantPractice"
  />
  <VacantDisabledDialog
    v-model="disabledDialog"
    :loading="loadingDisabled"
    @submit="onDisabledVacant"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useVacantPositionPageStore } from "@/stores/views/vacantPositionPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import VacantPositionTable from "@/components/vacantPosition/VacantPositionTable.vue";
import VacantCreateDialog from "@/components/vacantPosition/VacantCreateDialog.vue";
import VacantJrCreateDialog from "@/components/vacantPosition/VacantJrCreateDialog.vue";
import VacantPracticeCreateDialog from "@/components/vacantPosition/VacantPracticeCreateDialog.vue";
import VacantDisabledDialog from "@/components/vacantPosition/VacantDisabledDialog.vue";

const {
  links,
  positions,
  vacantDialog,
  disabledDialog,
  loadingDisabled,
  readVacant,
  createVacant,
  editVacant,
  loadingCreate,
  vacantJuniorDialog,
  practiceDialog,
  loadingTable,
} = storeToRefs(useVacantPositionPageStore());
const {
  openVacantDialog,
  openVacantDetail,
  openDisabledDialog,
  onDisabledVacant,
  onEnableVacant,
  saveVacantPosition,
  openVacantJuniorDialog,
  saveVacantJunior,
  openVacantPracticeDialog,
  saveVacantPractice,
} = useVacantPositionPageStore();

const confirmationDialog = ref();

const openEnableDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Activar vacante",
    body: "Al aceptar, la vacante se hará pública y los usuarios podrán postularse. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onEnableVacant(id);
};
</script>
