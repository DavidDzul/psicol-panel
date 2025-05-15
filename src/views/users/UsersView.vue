<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <UsersTable
        :users="users"
        :loading="loadingTable"
        @create="openCreateDialog"
        @edit="openUpdateDialog"
        @show="openUserDetail"
        :read="readUsers"
        :create="createUsers"
        :edit="editUsers"
        :user-campus="filteredCampus"
        :generations="generations"
      />
    </v-col>
  </v-row>
  <UserCreateDialog
    v-model="createDialog"
    :user-campus="filteredCampus"
    :loading="loadingCreate"
    :generations="generations"
    @submit="onSaveUser"
  />
  <UserUpdateDialog
    v-model="updateDialog"
    :edit-item="editUser"
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
import { useUserPageStore } from "@/stores/views/usersPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import UsersTable from "@/components/users/UsersTable.vue";
import UserCreateDialog from "@/components/users/UserCreateDialog.vue";
import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";

const {
  links,
  createDialog,
  loadingCreate,
  filteredCampus,
  users,
  generations,
  updateDialog,
  editUser,
  loadingUpdate,
  readUsers,
  createUsers,
  editUsers,
  loadingTable,
} = storeToRefs(useUserPageStore());
const {
  openCreateDialog,
  onSaveUser,
  openUpdateDialog,
  onUpdateUser,
  openUserDetail,
} = useUserPageStore();

const confirmationDialog = ref();
</script>
