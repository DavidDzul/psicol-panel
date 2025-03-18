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
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useVacantPositionDetailsPageStore } from "@/stores/views/vacantPositionDetailsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";
import VacantForm from "@/components/vacantPosition/VacantForm.vue";

const { links, selectedVacant } = storeToRefs(
  useVacantPositionDetailsPageStore()
);
const {} = useVacantPositionDetailsPageStore();

const panel = ref([0]);
const confirmationDialog = ref();
</script>
