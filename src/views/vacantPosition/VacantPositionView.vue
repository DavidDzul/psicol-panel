<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <VacantPositionTable
        :positions="positions"
        @laboral="openVacantDialog"
        @show="openVacantDetail"
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

  <VacantCreateDialog v-model="vacantDialog" />
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

const { links, positions, vacantDialog } = storeToRefs(
  useVacantPositionPageStore()
);
const { openVacantDialog, openVacantDetail } = useVacantPositionPageStore();

const confirmationDialog = ref();
</script>
