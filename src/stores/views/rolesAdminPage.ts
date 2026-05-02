import { defineStore, storeToRefs } from "pinia";
import { useRolesStore } from "@/stores/api/rolesStore";
import { useAppStore } from "@/stores/app";
import { computed, onMounted, ref } from "vue";

import type { Role } from "@/interfaces/role";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useRolesAdminPageStore = defineStore("rolesAdminPage", () => {
  const { setLoading } = useAppStore();

  const { resRolesAdmin } = storeToRefs(useRolesStore());
  const { fetchAdminRoles } = useRolesStore();

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

  const roles = computed<Role[]>(() => [...resRolesAdmin.value.values()]);

  onMounted(async () => {
    await fetchAdminRoles();
  });

  return {
    links,
    roles,
  };
});
