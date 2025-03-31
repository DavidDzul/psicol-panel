<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Áreas registradas"
                button-text="Agregar"
                :expanded="expanded"
                @button-click="openAreaDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <AreaTable
              :areas="areas"
              @edit="openAreaUpdateDialog"
              @delete="removeAreaDialog"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Informe para empresas"
                button-text="Agregar"
                :expanded="expanded"
                @button-click="openCandidateDataDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <CandidateDataTable
              :areas="areas"
              :candidates="candidates"
              @edit="openCandidateUpdateDialog"
              @remove="removeDataDialog"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <!-- <v-col cols="12">
    </v-col> -->
  </v-row>

  <AreaCreateDialog
    v-model="areaDialog"
    :loading="loadingCreate"
    @submit="onSaveArea"
  />
  <AreaUpdateDialog
    v-model="areaUpdateDialog"
    :edit-item="editArea"
    :loading="loadingUpdate"
    @submit="onUpdateArea"
  />

  <CandidateDataCreateDialog
    v-model="candidateDataDialog"
    :areas="areas"
    :loading="loadingCreate"
    @submit="onSaveCandidateData"
  />
  <CandidateDataUpdateDialog
    v-model="candidateUpdateDialog"
    :edit-item="editCandidate"
    :areas="areas"
    :loading="loadingUpdate"
    @submit="onUpdateCandidateData"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDataPageStore } from "@/stores/views/dataPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import AreaTable from "@/components/data/AreaTable.vue";
import CandidateDataTable from "@/components/data/CandidateDataTable.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";
import AreaCreateDialog from "@/components/data/AreaCreateDialog.vue";
import AreaUpdateDialog from "@/components/data/AreaUpdateDialog.vue";
import CandidateDataCreateDialog from "@/components/data/CandidateDataCreateDialog.vue";
import CandidateDataUpdateDialog from "@/components/data/CandidateDataUpdateDialog.vue";

const {
  links,
  areas,
  candidates,
  areaDialog,
  loadingCreate,
  areaUpdateDialog,
  editArea,
  loadingUpdate,
  candidateDataDialog,
  candidateUpdateDialog,
  editCandidate,
} = storeToRefs(useDataPageStore());
const {
  openAreaDialog,
  onSaveArea,
  openAreaUpdateDialog,
  onUpdateArea,
  onRemoveArea,
  openCandidateDataDialog,
  onSaveCandidateData,
  openCandidateUpdateDialog,
  onUpdateCandidateData,
  onRemoveCandidateData,
} = useDataPageStore();

const confirmationDialog = ref();
const panel = ref([1, 1]);

const removeAreaDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, el área se removerá del listado al igual que de los datos representados en el informe. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveArea(id);
};

const removeDataDialog = async (id) => {
  if (!id) return;
  const response = await confirmationDialog.value?.open({
    title: "Eliminar",
    body: "Al aceptar, esta información se removerá del listado al igual que de los datos representados en el informe. ¿Estás seguro de que deseas continuar?",
  });
  if (!response) return;
  await onRemoveCandidateData(id);
};
</script>
