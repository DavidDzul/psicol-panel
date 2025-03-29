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
                @button-click=""
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <AreaTable :areas="areas" />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Datos registrados"
                button-text="Agregar"
                :expanded="expanded"
                @button-click=""
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <CandidateDataTable :areas="areas" :candidates="candidates" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <!-- <v-col cols="12">
    </v-col> -->
  </v-row>

  <!-- <VacantCreateDialog v-model="vacantDialog" /> -->

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

const { links, areas, candidates } = storeToRefs(useDataPageStore());
const {} = useDataPageStore();

const confirmationDialog = ref();
const panel = ref([1, 1]);

//   const openEnableDialog = async (id) => {
//     if (!id) return;
//     const response = await confirmationDialog.value?.open({
//       title: "Activar vacante",
//       body: "Al aceptar, la vacante se hará pública y los usuarios podrán postularse. ¿Estás seguro de que deseas continuar?",
//     });
//     if (!response) return;
//     await onEnableVacant(id);
//   };
</script>
