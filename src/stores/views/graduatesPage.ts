import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { usePersonsStore } from "@/stores/api/personsStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { User, UserForm, UserUpdateForm } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useGraduatesPageStore = defineStore("graduatesPage", () => {
  const { filteredCampus, readGraduates, createGraduates, editGraduates } =
    storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const personsStore = usePersonsStore();
  const { allPersons } = storeToRefs(personsStore);
  const { fetchPersons, createPerson, updatePerson } = personsStore;

  const router = useRouter();
  const createDialog = ref<boolean>(false);
  const updateDialog = ref<boolean>(false);
  const editGraduate = ref<User | undefined>(undefined);

  const loadingCreate = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);
  const loadingTable = ref<boolean>(false);

  onBeforeMount(async () => {
    loadingTable.value = true;
    await fetchPersons();
    loadingTable.value = false;
  });

  const links = computed<LinkInterface[]>(() => [
    { title: "Inicio", disabled: false, href: "/" },
    { title: "Usuarios", disabled: true, href: "/egresados" },
  ]);

  // All persons passed to the table; the table pre-selects BEC_INACTIVE filter
  const graduates = computed<User[]>(() => [...allPersons.value.values()]);

  const generations = computed<Generation[]>(() =>
    [...resGenerations.value.values()],
  );

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const graduate = allPersons.value.get(id);
    if (!graduate) return;
    editGraduate.value = { ...graduate };
    updateDialog.value = true;
  };

  const openGraduateDetail = (id: number): void => {
    router.push("egresados/" + id);
  };

  const onSaveGradute = async (form: UserForm): Promise<void> => {
    loadingCreate.value = true;
    try {
      const res = await createPerson(form);
      if (res) createDialog.value = false;
    } catch (error) {
      console.error(error);
    }
    loadingCreate.value = false;
  };

  const onUpdateGraduate = async (form: UserUpdateForm): Promise<void> => {
    if (!editGraduate.value) return;
    loadingUpdate.value = true;
    try {
      const res = await updatePerson(form, editGraduate.value.id);
      if (res) updateDialog.value = false;
    } catch (error) {
      console.error(error);
    }
    loadingUpdate.value = false;
  };

  return {
    links,
    graduates,
    createDialog,
    updateDialog,
    generations,
    filteredCampus,
    loadingCreate,
    loadingUpdate,
    editGraduate,
    readGraduates,
    createGraduates,
    editGraduates,
    loadingTable,
    openCreateDialog,
    onSaveGradute,
    openUpdateDialog,
    onUpdateGraduate,
    openGraduateDetail,
  };
});
