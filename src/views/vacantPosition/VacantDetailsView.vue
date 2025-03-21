<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Información de la vacante"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <VacantForm v-if="selectedVacant" :vacant="selectedVacant" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  <VacantUpdateDialog
    v-if="selectedVacant && selectedVacant.category === 'JOB_POSITION'"
    v-model="updateDialog"
    :edit-item="selectedVacant"
    :loading="loadingUpdate"
    @submit="onUpdateVacantLaboral"
  />
  <VacantPracticeUpdateDialog
    v-if="selectedVacant && selectedVacant.category === 'PROFESSIONAL_PRACTICE'"
    v-model="updatePracticeDialog"
    :edit-item="selectedVacant"
    :loading="loadingUpdate"
    @submit="onUpdateVacantPractice"
  />
  <VacantJrUpdateDialog
    v-if="selectedVacant && selectedVacant.category === 'JR_POSITION'"
    v-model="updateJrDialog"
    :edit-item="selectedVacant"
    :loading="loadingUpdate"
    @submit="onUpdateVacantJunior"
  />
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useVacantPositionDetailsPageStore } from "@/stores/views/vacantPositionDetailsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";
import VacantForm from "@/components/vacantPosition/VacantForm.vue";
import VacantJrUpdateDialog from "@/components/vacantPosition/VacantJrUpdateDialog.vue";
import VacantPracticeUpdateDialog from "@/components/vacantPosition/VacantPracticeUpdateDialog.vue";
import VacantUpdateDialog from "@/components/vacantPosition/VacantUpdateDialog.vue";

const {
  links,
  selectedVacant,
  updateDialog,
  updatePracticeDialog,
  updateJrDialog,
  loadingUpdate,
} = storeToRefs(useVacantPositionDetailsPageStore());
const {
  openUpdateDialog,
  onUpdateVacantLaboral,
  onUpdateVacantPractice,
  onUpdateVacantJunior,
} = useVacantPositionDetailsPageStore();

const panel = ref([0]);
const confirmationDialog = ref();
</script>
