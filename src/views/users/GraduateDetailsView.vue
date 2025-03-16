<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="selectedGraduate"
                title="Información de usuario"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <UserForm v-if="selectedGraduate" :user="selectedGraduate" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <GraduateUpdateDialog
    v-if="selectedGraduate"
    v-model="updateDialog"
    :edit-item="selectedGraduate"
    :loading="loadingUpdate"
    @submit="onUpdateGraduate"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGraduateDetailsPageStore } from "@/stores/views/graduateDetailsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";

import GraduateUpdateDialog from "@/components/users/GraduateUpdateDialog.vue";
import UserForm from "@/components/users/UserForm.vue";

const { links, selectedGraduate, updateDialog, loadingUpdate } = storeToRefs(
  useGraduateDetailsPageStore()
);
const { openUpdateDialog, onUpdateGraduate } = useGraduateDetailsPageStore();

const panel = ref([0]);
const confirmationDialog = ref();
</script>
