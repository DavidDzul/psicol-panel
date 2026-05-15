import { defineStore, storeToRefs } from "pinia";
import { useClassStore } from "@/stores/api/classStore";
import { useAppStore } from "@/stores/app";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";
import { useGenerationsStore } from "@/stores/api/generationStore";

import type { ClassEntity } from "@/interfaces/class";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useClassPageStore = defineStore("classPage", () => {
  const { setLoading } = useAppStore();
  const { classMap } = storeToRefs(useClassStore());
  const {
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    reportSemesterPDF,
    reportSemesterExcel,
  } = useClassStore();
  const { filteredCampus } = storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const router = useRouter();
  const loading = ref<boolean>(false);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Sesiones de F",
      disabled: true,
      href: "/clases",
    },
  ]);

  const createDialog = ref<boolean>(false);
  const editClass = ref<ClassEntity | undefined>(undefined);
  const updateDialog = ref<boolean>(false);
  const reportModal = ref<boolean>(false);

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const data = classMap.value.get(id);
    if (!data) return;
    editClass.value = { ...data };
    updateDialog.value = true;
  };

  const classes = computed<ClassEntity[]>(() => [...classMap.value.values()]);

  const generations = computed<Generation[]>(() => {
    return [...resGenerations.value.values()].filter(
      (gen) => gen.generation_active,
    );
  });

  const onCreateClass = async (form: unknown): Promise<void> => {
    loading.value = true;
    if (form) {
      const res = await createClass(form);
      if (res) {
        createDialog.value = false;
      }
    }
    loading.value = false;
  };

  const onUpdateClass = async (form: unknown): Promise<void> => {
    loading.value = true;
    if (form && editClass.value) {
      const res = await updateClass(form, editClass.value.id);
      if (res) {
        updateDialog.value = false;
      }
    }
    loading.value = false;
  };

  const onRemoveClass = async (id: number): Promise<void> => {
    if (!id) return;
    await deleteClass(id);
  };

  const openClassDetail = (id: number): void => {
    router.push("clases/" + id);
  };

  const openReportModal = (): void => {
    reportModal.value = true;
  };

  const createReport = async (form: unknown): Promise<void> => {
    if (!form) return;

    loading.value = true;
    try {
      let success = false;

      if ((form as any).format === 1) {
        await reportSemesterPDF(form);
        success = true;
      } else if ((form as any).format === 2) {
        await reportSemesterExcel(form);
        success = true;
      }

      if (success) {
        reportModal.value = false;
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    } finally {
      loading.value = false;
    }
  };

  const classTable = computed(() => {
    return classes.value.map((c) => {
      const gen = resGenerations.value.get(c.generation_id!);

      return {
        ...c,
        generation_name: gen ? gen.generation_name : "—",
      };
    });
  });

  const searchData = async (form: unknown): Promise<void> => {
    loading.value = true;
    if (form) {
      await fetchClasses(form);
    }
    loading.value = false;
  };

  return {
    links,
    loading,
    classes,
    editClass,
    createDialog,
    updateDialog,
    generations,
    filteredCampus,
    reportModal,
    classTable,
    onCreateClass,
    openCreateDialog,
    openUpdateDialog,
    onUpdateClass,
    onRemoveClass,
    openClassDetail,
    createReport,
    openReportModal,
    searchData,
  };
});
