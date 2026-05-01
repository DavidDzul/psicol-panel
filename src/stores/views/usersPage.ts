import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useUserStore } from "@/stores/api/usersStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { User } from "@/interfaces/user";
import type { UserForm } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";

export const useUserPageStore = defineStore("userPage", () => {
  const { loading } = storeToRefs(useAppStore());

  const { filteredCampus, readUsers, createUsers, editUsers } =
    storeToRefs(useAuthStore());

  const { resGenerations } = storeToRefs(useGenerationsStore());
  const { resUsers } = storeToRefs(useUserStore());

  const { fetchUsers, createUser, updateUser } = useUserStore();

  const router = useRouter();

  const createDialog = ref<boolean>(false);
  const updateDialog = ref<boolean>(false);

  const editUser = ref<User>();

  const loadingTable = ref<boolean>(false);
  const loadingCreate = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);

  onBeforeMount(async () => {
    loadingTable.value = true;
    await fetchUsers();
    loadingTable.value = false;
  });

  const links = computed(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Becarios",
      disabled: true,
      href: "/becarios",
    },
  ]);

  const users = computed<User[]>(() => [...resUsers.value.values()]);

  const generations = computed<Generation[]>(() =>
    [...resGenerations.value.values()].filter((gen) => gen.generation_active),
  );

  const loadingUsers = computed<boolean>(() => loading.value);

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const user = resUsers.value.get(id);
    if (!user) return;

    editUser.value = { ...user };
    updateDialog.value = true;
  };

  const openUserDetail = (id: number): void => {
    router.push(`becarios/${id}`);
  };

  const onSaveUser = async (form: UserForm): Promise<void> => {
    loadingCreate.value = true;

    try {
      const res = await createUser(form);
      if (res) {
        createDialog.value = false;
      }
    } catch (error) {
      console.error(error);
    }

    loadingCreate.value = false;
  };

  const onUpdateUser = async (form: UserForm): Promise<void> => {
    if (!editUser.value) return;

    loadingUpdate.value = true;

    try {
      const res = await updateUser(form, editUser.value.id);
      if (res) {
        updateDialog.value = false;
      }
    } catch (error) {
      console.error(error);
    }

    loadingUpdate.value = false;
  };

  return {
    links,
    users,
    editUser,
    generations,
    updateDialog,
    createDialog,
    loadingCreate,
    filteredCampus,
    loadingUpdate,
    readUsers,
    createUsers,
    editUsers,
    loadingTable,
    loadingUsers,
    openUserDetail,
    openUpdateDialog,
    openCreateDialog,
    onSaveUser,
    onUpdateUser,
  };
});
