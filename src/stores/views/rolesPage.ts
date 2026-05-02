import { defineStore, storeToRefs } from "pinia";
import { useRolesStore } from "@/stores/api/rolesStore";
import { useAppStore } from "@/stores/app";
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/api/authStore";

import type { Role, Permission } from "@/interfaces/role";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useRolesPageStore = defineStore("rolesPage", () => {
  const { setLoading } = useAppStore();

  const { filteredCampus } = storeToRefs(useAuthStore());
  const { resRoles, resPermissions } = storeToRefs(useRolesStore());
  const { fetchPermissions, updateRole } = useRolesStore();

  const editItem = ref<Role | undefined>(undefined);
  const updateDialog = ref<boolean>(false);
  const loading = ref<boolean>(false);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Roles",
      disabled: true,
      href: "/roles",
    },
  ]);

  const roles = computed<Role[]>(() => [...resRoles.value.values()]);
  const permissions = computed<Permission[]>(() => [
    ...resPermissions.value.values(),
  ]);

  const userPermissions = computed<Permission[]>(() =>
    permissions.value.filter((map) => map.type === "USER"),
  );

  const openUpdateDialog = (id: number): void => {
    const data = resRoles.value.get(id);
    if (!data) return;
    editItem.value = { ...data };
    updateDialog.value = true;
  };

  onMounted(async () => {
    await fetchPermissions();
  });

  const onUpdateRole = async (form: unknown): Promise<void> => {
    loading.value = true;
    try {
      if (form && editItem.value) {
        const res = await updateRole(form, editItem.value.id);
        if (res) {
          updateDialog.value = false;
        }
      }
    } catch (error) {
      console.error(error);
      loading.value = false;
    }
    loading.value = false;
  };

  return {
    links,
    roles,
    editItem,
    permissions,
    userPermissions,
    updateDialog,
    openUpdateDialog,
    onUpdateRole,
  };
});
