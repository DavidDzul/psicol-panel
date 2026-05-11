<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <UsersTable
        :users="persons"
        :loading="loadingTable"
        :default-user-type="defaultUserType"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @show="openDetail"
        :read="canRead"
        :create="canCreate"
        :edit="canEdit"
        :user-campus="filteredCampus"
        :generations="generations"
      />
    </v-col>
  </v-row>
  <PersonCreateDialog
    v-model="createDialog"
    :title="createTitle"
    :user-campus="filteredCampus"
    :loading="loadingCreate"
    :generations="generations"
    :default-user-type="createDefaultUserType"
    @submit="onSave"
  />
  <UserUpdateDialog
    v-model="updateDialog"
    :title="updateTitle"
    :edit-item="editPerson"
    :loading="loadingUpdate"
    :user-campus="filteredCampus"
    :generations="generations"
    @submit="onUpdate"
  />
  <ConfirmationDialog ref="confirmationDialog" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePersonsPage, type PersonsMode } from "@/composables/usePersonsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import UsersTable from "@/components/users/UsersTable.vue";
import PersonCreateDialog from "@/components/users/PersonCreateDialog.vue";
import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";

const props = defineProps<{
  mode: PersonsMode;
}>();

const confirmationDialog = ref();

const {
  links,
  persons,
  editPerson,
  createDialog,
  updateDialog,
  filteredCampus,
  loadingCreate,
  loadingUpdate,
  loadingTable,
  generations,
  canRead,
  canCreate,
  canEdit,
  openCreateDialog,
  openUpdateDialog,
  openDetail,
  onSave,
  onUpdate,
  defaultUserType,
  createDefaultUserType,
  createTitle,
  updateTitle,
} = usePersonsPage(props.mode);
</script>
