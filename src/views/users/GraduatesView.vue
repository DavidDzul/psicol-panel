<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <GraduatesTable
        :graduates="graduates"
        :loading="loadingTable"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @show="openGraduateDetail"
        :read="readGraduates"
        :create="createGraduates"
        :edit="editGraduates"
        :user-campus="filteredCampus"
        :generations="generations"
      />
    </v-col>
  </v-row>

  <GraduateCreateDialog
    v-model="createDialog"
    :user-campus="filteredCampus"
    :loading="loadingCreate"
    :generations="generations"
    @submit="onSaveGradute"
  />
  <GraduateUpdateDialog
    v-model="updateDialog"
    :edit-item="editGraduate"
    :loading="loadingUpdate"
    @submit="onUpdateGraduate"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGraduatesPageStore } from "@/stores/views/graduatesPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import GraduatesTable from "@/components/users/GraduatesTable.vue";
import GraduateCreateDialog from "@/components/users/GraduateCreateDialog.vue";
import GraduateUpdateDialog from "@/components/users/GraduateUpdateDialog.vue";

const {
  links,
  graduates,
  createDialog,
  updateDialog,
  filteredCampus,
  loadingCreate,
  generations,
  loadingUpdate,
  editGraduate,
  loadingTable,
  readGraduates,
  createGraduates,
  editGraduates,
} = storeToRefs(useGraduatesPageStore());
const {
  openCreateDialog,
  onSaveGradute,
  openUpdateDialog,
  onUpdateGraduate,
  openGraduateDetail,
} = useGraduatesPageStore();

const confirmationDialog = ref();
</script>
