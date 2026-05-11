<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="selectedPerson"
                title="Información de usuario"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <UserForm v-if="selectedPerson" :user="selectedPerson" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <UserUpdateDialog
    v-if="selectedPerson"
    v-model="updateDialog"
    :title="dialogTitle"
    :edit-item="selectedPerson"
    :loading="loadingUpdate"
    :user-campus="filteredCampus"
    :generations="generations"
    @submit="onUpdate"
  />
  <ConfirmationDialog ref="confirmationDialog" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePersonDetailsPage } from "@/composables/usePersonDetailsPage";
import type { PersonsMode } from "@/composables/usePersonsPage";

import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";
import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";
import UserForm from "@/components/users/UserForm.vue";

const props = defineProps<{
  mode: PersonsMode;
}>();

const confirmationDialog = ref();
const panel = ref([0]);

const {
  links,
  selectedPerson,
  updateDialog,
  loadingUpdate,
  generations,
  filteredCampus,
  dialogTitle,
  openUpdateDialog,
  onUpdate,
} = usePersonDetailsPage(props.mode);
</script>
