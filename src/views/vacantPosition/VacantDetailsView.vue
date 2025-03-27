<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel :readonly="true">
          <v-expansion-panel-title color="#f8f8f8">
            <template v-if="selectedVacant" #default="{ expanded }">
              <PanelHeaderOptions
                v-if="editVacant"
                title="Información de la vacante"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
              <PanelHeaderOptions v-else title="Información de la vacante" />

              <v-btn
                v-if="selectedVacant.status && editVacant"
                class="mr-2"
                color="error"
                @click="openDisabledDialog"
              >
                Desactivar
              </v-btn>
              <v-btn
                v-else-if="!selectedVacant.status && editVacant"
                class="mr-2"
                color="success"
                @click="openEnableDialog"
              >
                Activar
              </v-btn>
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
  <VacantDisabledDialog
    v-model="disabledDialog"
    :loading="loadingDisabled"
    @submit="onDisabledVacant"
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
import VacantDisabledDialog from "@/components/vacantPosition/VacantDisabledDialog.vue";

const {
  links,
  selectedVacant,
  updateDialog,
  updatePracticeDialog,
  updateJrDialog,
  loadingUpdate,
  disabledDialog,
  loadingDisabled,
  editVacant,
} = storeToRefs(useVacantPositionDetailsPageStore());
const {
  openUpdateDialog,
  onUpdateVacantLaboral,
  onUpdateVacantPractice,
  onUpdateVacantJunior,
  openDisabledDialog,
  onDisabledVacant,
  onEnableVacant,
} = useVacantPositionDetailsPageStore();

const panel = ref([0]);
const confirmationDialog = ref();

const openEnableDialog = async () => {
  if (!selectedVacant.value.id) return;
  const response = await confirmationDialog.value?.open({
    title: "Activar vacante",
    body: "Al aceptar, la vacante se hará pública y los usuarios podrán postularse. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onEnableVacant(selectedVacant.value.id);
};
</script>
