import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useAppStore } from "@/stores/app";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/api/authStore";

import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useGenerationsPageStore = defineStore("generationsPage", () => {
  const { setLoading } = useAppStore();

  const { filteredCampus } = storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());
  const { createGeneration, updateGeneration } = useGenerationsStore();

  const createDialog = ref<boolean>(false);
  const loadingCreate = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const editItem = ref<Generation | undefined>(undefined);
  const updateDialog = ref<boolean>(false);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Generaciones",
      disabled: true,
      href: "/generaciones",
    },
  ]);

  const generations = computed<Generation[]>(() => [
    ...resGenerations.value.values(),
  ]);

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const data = resGenerations.value.get(id);
    if (!data) return;
    editItem.value = { ...data };
    updateDialog.value = true;
  };

  const onSaveGeneration = async (form: unknown): Promise<void> => {
    loadingCreate.value = true;
    if (form) {
      try {
        const res = await createGeneration(form);
        if (res) {
          createDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingCreate.value = false;
  };

  const onUpdateGeneration = async (form: unknown): Promise<void> => {
    loading.value = true;
    try {
      if (form && editItem.value) {
        const res = await updateGeneration(form, editItem.value.id);
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
    generations,
    createDialog,
    loadingCreate,
    filteredCampus,
    editItem,
    updateDialog,
    openCreateDialog,
    onSaveGeneration,
    openUpdateDialog,
    onUpdateGeneration,
  };
});
