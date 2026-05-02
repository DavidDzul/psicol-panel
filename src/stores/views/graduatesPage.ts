import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useGraduateStore } from "@/stores/api/graduatesStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { Graduate } from "@/interfaces/graduate";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useGraduatesPageStore = defineStore("graduatesPage", () => {
  const { setLoading } = useAppStore();

  const { filteredCampus, readGraduates, createGraduates, editGraduates } =
    storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());
  const { resGraduates } = storeToRefs(useGraduateStore());
  const { fetchGraduates, createGraduate, updateGraduate } = useGraduateStore();

  const router = useRouter();
  const createDialog = ref<boolean>(false);
  const updateDialog = ref<boolean>(false);
  const editGraduate = ref<Graduate | undefined>(undefined);

  const loadingCreate = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);
  const loadingTable = ref<boolean>(false);

  onBeforeMount(async () => {
    loadingTable.value = true;
    await fetchGraduates();
    loadingTable.value = false;
  });

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Egresados",
      disabled: true,
      href: "/egresados",
    },
  ]);

  const graduates = computed<Graduate[]>(() => [
    ...resGraduates.value.values(),
  ]);

  const generations = computed<Generation[]>(() => {
    return [...resGenerations.value.values()].filter(
      (gen) => !gen.generation_active,
    );
  });

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const graduate = resGraduates.value.get(id);
    if (!graduate) return;
    editGraduate.value = { ...graduate };
    updateDialog.value = true;
  };

  const openGraduateDetail = (id: number): void => {
    router.push("egresados/" + id);
  };

  const onSaveGradute = async (form: unknown): Promise<void> => {
    loadingCreate.value = true;
    if (form) {
      try {
        const res = await createGraduate(form);
        if (res) {
          createDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingCreate.value = false;
  };

  const onUpdateGraduate = async (form: unknown): Promise<void> => {
    if (!editGraduate.value) return;
    loadingUpdate.value = true;
    if (form) {
      try {
        const res = await updateGraduate(form, editGraduate.value.id);
        if (res) {
          updateDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
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
