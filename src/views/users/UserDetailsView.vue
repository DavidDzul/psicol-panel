<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="selectedUser"
                title="Información de usuario"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <UserForm v-if="selectedUser" :user="selectedUser" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <UserUpdateDialog
    v-if="selectedUser"
    v-model="updateDialog"
    :edit-item="selectedUser"
    :loading="loadingUpdate"
    :user-campus="filteredCampus"
    :generations="generations"
    @submit="onUpdateUser"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserDetailsPageStore } from "@/stores/views/userDetailsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";

import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";
import UserForm from "@/components/users/UserForm.vue";

const {
  links,
  selectedUser,
  updateDialog,
  loadingUpdate,
  generations,
  filteredCampus,
} = storeToRefs(useUserDetailsPageStore());
const { openUpdateDialog, onUpdateUser } = useUserDetailsPageStore();

const panel = ref([0]);
const confirmationDialog = ref();
</script>
