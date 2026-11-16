import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useStaffAdministratorsStore } from "@/stores/api/staffAdministratorsStore";
import { useStaffRolesStore } from "@/stores/api/staffRolesStore";
import { apiErrorMessage } from "@/utils/apiErrorMessage";
import type { CreateStaffAdministratorPayload } from "@/interfaces/staff";

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

  return {
    administrators,
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
