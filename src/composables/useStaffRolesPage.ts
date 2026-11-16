import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useStaffRolesStore } from "@/stores/api/staffRolesStore";
import { apiErrorMessage } from "@/utils/apiErrorMessage";
import { staffPermissionChanges } from "@/utils/staffPermissionChanges";
import type { StaffRole } from "@/interfaces/staff";

// Page logic for the "Roles y permisos" tab (sdd/administradores-psicol).
// Dialog components stay presentational; this owns drafts, the lockout
// confirmation gate and server error copy.
export const useStaffRolesPage = () => {
  const store = useStaffRolesStore();
  const { roles, catalog } = storeToRefs(store);

  const loading = ref(false);
  const loadFailed = ref(false);

  const createDialog = ref(false);
  const createError = ref<string | null>(null);

  const editDialog = ref(false);
  const confirmOpen = ref(false);
  const editingRole = ref<StaffRole | null>(null);
  const draftIds = ref<number[]>([]);
  const saveError = ref<string | null>(null);
  const saving = ref(false);
  const savedNotice = ref(false);

  const flatCatalog = computed(() => catalog.value.flatMap((m) => m.permissions));

  const lockout = computed(() =>
    staffPermissionChanges(
      editingRole.value?.permissions_ids ?? [],
      draftIds.value,
      flatCatalog.value,
    ),
  );

  const load = async (): Promise<void> => {
    loading.value = true;
    const [rolesOk, catalogOk] = await Promise.all([store.fetchRoles(), store.fetchCatalog()]);
    loadFailed.value = !(rolesOk && catalogOk);
    loading.value = false;
  };

  const openCreate = (): void => {
    createError.value = null;
    createDialog.value = true;
  };

  const createRole = async (name: string): Promise<boolean> => {
    createError.value = null;
    try {
      await store.createRole({ name });
      createDialog.value = false;
      return true;
    } catch (error: unknown) {
      createError.value = apiErrorMessage(error, "No se pudo crear el rol.");
      return false;
    }
  };

  const openEdit = (role: StaffRole): void => {
    editingRole.value = role;
    draftIds.value = [...role.permissions_ids];
    saveError.value = null;
    confirmOpen.value = false;
    editDialog.value = true;
  };

  const closeEdit = (): void => {
    editDialog.value = false;
    confirmOpen.value = false;
    editingRole.value = null;
  };

  const persist = async (): Promise<void> => {
    if (!editingRole.value) return;
    saving.value = true;
    saveError.value = null;
    try {
      await store.updateRolePermissions(editingRole.value.id, draftIds.value);
      closeEdit();
      savedNotice.value = true;
    } catch (error: unknown) {
      confirmOpen.value = false;
      saveError.value = apiErrorMessage(error, "No se pudieron guardar los permisos.");
    } finally {
      saving.value = false;
    }
  };

  const requestSave = async (): Promise<void> => {
    if (lockout.value.removedMenus.length > 0) {
      confirmOpen.value = true;
      return;
    }
    await persist();
  };

  const confirmSave = persist;

  const cancelConfirm = (): void => {
    confirmOpen.value = false;
  };

  return {
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
  };
};
