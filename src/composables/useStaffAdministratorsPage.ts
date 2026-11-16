import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useStaffAdministratorsStore } from "@/stores/api/staffAdministratorsStore";
import { useStaffRolesStore } from "@/stores/api/staffRolesStore";
import { useAlertStore } from "@/stores/alert";
import { apiErrorMessage } from "@/utils/apiErrorMessage";
import type {
  CreateStaffAdministratorPayload,
  ResetStaffPasswordPayload,
  StaffAdministrator,
} from "@/interfaces/staff";

// Roles that exist for compatibility but can never be handed out (API enforces it too).
const NON_ASSIGNABLE_ROLES = ["ROOT", "YUCATAN"];

export interface OneTimeCredentials {
  email: string;
  password: string;
}

// Page logic for the "Administradores" tab. The credentials of a freshly created
// account live only in this transient ref: never in a store, cleared on close.
export const useStaffAdministratorsPage = () => {
  const store = useStaffAdministratorsStore();
  const rolesStore = useStaffRolesStore();
  const { showAlert } = useAlertStore();
  const { administrators } = storeToRefs(store);
  const { roles } = storeToRefs(rolesStore);

  const loading = ref(false);
  const loadFailed = ref(false);

  const createDialog = ref(false);
  const createError = ref<string | null>(null);
  const creating = ref(false);

  const credentials = ref<OneTimeCredentials | null>(null);

  const assignableRoles = computed(() =>
    roles.value.filter((role) => !NON_ASSIGNABLE_ROLES.includes(role.name)),
  );

  const load = async (): Promise<void> => {
    loading.value = true;
    const [adminsOk, rolesOk] = await Promise.all([
      store.fetchAdministrators(),
      rolesStore.fetchRoles(),
    ]);
    loadFailed.value = !(adminsOk && rolesOk);
    loading.value = false;
  };

  const openCreate = (): void => {
    createError.value = null;
    createDialog.value = true;
  };

  const createAdministrator = async (payload: CreateStaffAdministratorPayload): Promise<boolean> => {
    createError.value = null;
    creating.value = true;
    try {
      await store.createAdministrator(payload);
      credentials.value = { email: payload.email, password: payload.password };
      createDialog.value = false;
      return true;
    } catch (error: unknown) {
      createError.value = apiErrorMessage(error, "No se pudo crear el administrador.");
      return false;
    } finally {
      creating.value = false;
    }
  };

  const closeCredentials = (): void => {
    credentials.value = null;
  };

  // Assign role. Sessions of the target are closed by the API.
  const assignTarget = ref<StaffAdministrator | null>(null);
  const assignError = ref<string | null>(null);
  const assigning = ref(false);

  const openAssign = (administrator: StaffAdministrator): void => {
    assignError.value = null;
    assignTarget.value = administrator;
  };
  const closeAssign = (): void => {
    assignTarget.value = null;
  };

  const assignRole = async (roleId: number): Promise<boolean> => {
    const target = assignTarget.value;
    if (!target) return false;
    assignError.value = null;
    assigning.value = true;
    try {
      await store.updateRole(target.id, roleId);
      assignTarget.value = null;
      showAlert({ title: "Rol actualizado. Se cerraron las sesiones del usuario.", status: "success" });
      void rolesStore.fetchRoles(); // keeps users_count in sync
      return true;
    } catch (error: unknown) {
      assignError.value = apiErrorMessage(error, "No se pudo cambiar el rol.");
      return false;
    } finally {
      assigning.value = false;
    }
  };

  // Reset password. The new password is shown once through `credentials`, never stored.
  const resetTarget = ref<StaffAdministrator | null>(null);
  const resetError = ref<string | null>(null);
  const resetting = ref(false);

  const openReset = (administrator: StaffAdministrator): void => {
    resetError.value = null;
    resetTarget.value = administrator;
  };
  const closeReset = (): void => {
    resetTarget.value = null;
  };

  const resetPassword = async (payload: ResetStaffPasswordPayload): Promise<boolean> => {
    const target = resetTarget.value;
    if (!target) return false;
    resetError.value = null;
    resetting.value = true;
    try {
      await store.resetPassword(target.id, payload);
      credentials.value = { email: target.email, password: payload.password };
      resetTarget.value = null;
      return true;
    } catch (error: unknown) {
      resetError.value = apiErrorMessage(error, "No se pudo restablecer la contraseña.");
      return false;
    } finally {
      resetting.value = false;
    }
  };

  // Activate / deactivate, always behind a confirmation dialog.
  const activeTarget = ref<StaffAdministrator | null>(null);
  const togglingActive = ref(false);

  const askToggleActive = (administrator: StaffAdministrator): void => {
    activeTarget.value = administrator;
  };
  const cancelToggleActive = (): void => {
    activeTarget.value = null;
  };

  const confirmToggleActive = async (): Promise<boolean> => {
    const target = activeTarget.value;
    if (!target) return false;
    togglingActive.value = true;
    try {
      await store.setActive(target.id, !target.active);
      showAlert({
        title: target.active
          ? "Administrador desactivado. Se cerraron sus sesiones."
          : "Administrador activado.",
        status: "success",
      });
      return true;
    } catch {
      return false; // the store already surfaced the error alert
    } finally {
      togglingActive.value = false;
      activeTarget.value = null;
    }
  };

  return {
    administrators,
    assignTarget,
    assignError,
    assigning,
    openAssign,
    closeAssign,
    assignRole,
    resetTarget,
    resetError,
    resetting,
    openReset,
    closeReset,
    resetPassword,
    activeTarget,
    togglingActive,
    askToggleActive,
    cancelToggleActive,
    confirmToggleActive,
    assignableRoles,
    loading,
    loadFailed,
    createDialog,
    createError,
    creating,
    credentials,
    load,
    openCreate,
    createAdministrator,
    closeCredentials,
  };
};
