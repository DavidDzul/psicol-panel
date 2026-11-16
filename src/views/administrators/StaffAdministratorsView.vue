<template>
  <v-row>
    <v-col cols="12">
      <v-alert type="info" variant="tonal" density="compact" class="mb-2">
        Los cambios de rol y permisos se aplican cuando el usuario vuelve a iniciar sesión.
        Cambiar el rol, desactivar o restablecer la contraseña de un administrador cierra sus
        sesiones activas. Las cuentas sin rol pueden conservar accesos desde el panel de
        administración (Accesos).
      </v-alert>
      <v-tabs v-model="tab" color="primary">
        <v-tab value="administrators">Administradores</v-tab>
        <v-tab value="roles">Roles y permisos</v-tab>
      </v-tabs>

      <v-window v-model="tab" class="mt-4">
        <v-window-item value="administrators">
          <v-alert v-if="adminsLoadFailed" type="error" variant="tonal" density="compact" class="mb-2">
            No se pudieron cargar los administradores. Intenta nuevamente.
          </v-alert>
          <StaffAdministratorsTable
            :administrators="administrators"
            :loading="adminsLoading"
            @create="openCreateAdministrator"
          />
        </v-window-item>
        <v-window-item value="roles">
          <v-alert v-if="loadFailed" type="error" variant="tonal" density="compact" class="mb-2">
            No se pudieron cargar los roles. Intenta nuevamente.
          </v-alert>
          <v-snackbar v-model="savedNotice" color="success" timeout="6000">
            Permisos guardados. Se aplican cuando los usuarios vuelvan a iniciar sesión.
          </v-snackbar>
          <StaffRolesTable :roles="roles" :loading="loading" @create="openCreate" @edit="openEdit" />
        </v-window-item>
      </v-window>
    </v-col>
  </v-row>

  <CreateStaffAdministratorDialog
    v-model="createAdminDialog"
    :roles="assignableRoles"
    :loading="creatingAdmin"
    :server-error="createAdminError"
    @submit="createAdministrator"
  />
  <StaffCredentialsDialog :credentials="credentials" @close="closeCredentials" />
  <CreateStaffRoleDialog v-model="createDialog" :server-error="createError" @submit="createRole" />
  <EditStaffRolePermissionsDialog
    v-model="editDialog"
    v-model:draft-ids="draftIds"
    :role="editingRole"
    :catalog="catalog"
    :lockout="lockout"
    :confirm-open="confirmOpen"
    :saving="saving"
    :server-error="saveError"
    @save="requestSave"
    @cancel="closeEdit"
    @confirm="confirmSave"
    @cancel-confirm="cancelConfirm"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import StaffRolesTable from "@/components/staff/StaffRolesTable.vue";
import StaffAdministratorsTable from "@/components/staff/StaffAdministratorsTable.vue";
import CreateStaffAdministratorDialog from "@/components/staff/CreateStaffAdministratorDialog.vue";
import StaffCredentialsDialog from "@/components/staff/StaffCredentialsDialog.vue";
import CreateStaffRoleDialog from "@/components/staff/CreateStaffRoleDialog.vue";
import EditStaffRolePermissionsDialog from "@/components/staff/EditStaffRolePermissionsDialog.vue";
import { useStaffRolesPage } from "@/composables/useStaffRolesPage";
import { useStaffAdministratorsPage } from "@/composables/useStaffAdministratorsPage";

const tab = ref<"administrators" | "roles">("administrators");

const {
  roles,
  catalog,
  loading,
  loadFailed,
  createDialog,
  createError,
  editDialog,
  confirmOpen,
  editingRole,
  draftIds,
  saveError,
  saving,
  savedNotice,
  lockout,
  load,
  openCreate,
  createRole,
  openEdit,
  closeEdit,
  requestSave,
  confirmSave,
  cancelConfirm,
} = useStaffRolesPage();

const {
  administrators,
  assignableRoles,
  loading: adminsLoading,
  loadFailed: adminsLoadFailed,
  createDialog: createAdminDialog,
  createError: createAdminError,
  creating: creatingAdmin,
  credentials,
  load: loadAdministrators,
  openCreate: openCreateAdministrator,
  createAdministrator,
  closeCredentials,
} = useStaffAdministratorsPage();

onMounted(() => {
  void load();
  void loadAdministrators();
});
</script>
