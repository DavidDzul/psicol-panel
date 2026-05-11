import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { usePersonsStore } from "@/stores/api/personsStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { User, UserForm, UserUpdateForm } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";

export const useUserPageStore = defineStore("userPage", () => {
  const { loading } = storeToRefs(useAppStore());
  const { filteredCampus, readUsers, createUsers, editUsers } =
    storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const personsStore = usePersonsStore();
  const { allPersons } = storeToRefs(personsStore);
  const { fetchPersons, createPerson, updatePerson } = personsStore;

  const router = useRouter();

  const createDialog = ref<boolean>(false);
  const updateDialog = ref<boolean>(false);
  const editUser = ref<User>();

  const loadingTable = ref<boolean>(false);
  const loadingCreate = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);

  onBeforeMount(async () => {
    loadingTable.value = true;
    await fetchPersons();
    loadingTable.value = false;
  });

  const links = computed(() => [
    { title: "Inicio", disabled: false, href: "/" },
    { title: "Usuarios", disabled: true, href: "/becarios" },
  ]);

  // All persons passed to the table; the table filters by user_type internally
  const users = computed<User[]>(() => [...allPersons.value.values()]);

  const generations = computed<Generation[]>(() =>
    [...resGenerations.value.values()],
  );

  const loadingUsers = computed<boolean>(() => loading.value);

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const user = allPersons.value.get(id);
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
      const res = await createPerson(form);
      if (res) createDialog.value = false;
    } catch (error) {
      console.error(error);
    }
    loadingCreate.value = false;
  };

  const onUpdateUser = async (form: UserUpdateForm): Promise<void> => {
    if (!editUser.value) return;
    loadingUpdate.value = true;
    try {
      const res = await updatePerson(form, editUser.value.id);
      if (res) updateDialog.value = false;
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
