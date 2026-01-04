<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <RolesTable :roles="roles" @edit="openUpdateDialog" />
    </v-col>
  </v-row>

  <RoleUpdateDialog
    v-model="updateDialog"
    :edit-item="editItem"
    :permissions="userPermissions"
    @submit="onUpdateRole"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRolesPageStore } from "@/stores/views/rolesPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import RolesTable from "@/components/roles/RolesTable.vue";
import RoleUpdateDialog from "@/components/roles/RoleUpdateDialog.vue";

const { roles, links, editItem, updateDialog, userPermissions } = storeToRefs(
  useRolesPageStore()
);

const { openUpdateDialog, onUpdateRole } = useRolesPageStore();

const confirmationDialog = ref();
</script>
