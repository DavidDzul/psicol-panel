import { defineStore, storeToRefs } from "pinia";
import { useClassStore } from "@/stores/api/classStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { ClassEntity, ClassAttendance } from "@/interfaces/class";
import type { Generation } from "@/interfaces/generation";
import type { User } from "@/interfaces/user";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useClassDetailsPageStore = defineStore("classDetailsPage", () => {
  const { setLoading } = useAppStore();
  const { classDetail, attendanceMap, usersByFilters } =
    storeToRefs(useClassStore());
  const {
    fetchClassDetais,
    fetchAttendancesByClass,
    fetchUsersByFilters,
    assignUsers,
    updateAttendance,
    deleteAttendance,
    generateReportPDF,
    generateReportSheet,
  } = useClassStore();
  const { filteredCampus } = storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const router = useRouter();
  const route = useRoute();
  const loading = ref<boolean>(false);
  const assignDialog = ref<boolean>(false);
  const editItem = ref<ClassAttendance | null>(null);
  const updateDialog = ref<boolean | null>(null);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Sesiones de F",
      disabled: false,
      href: "/clases",
    },
    {
      title: "Detalles de sesión de F.",
      disabled: true,
      href: "/clases/:id",
    },
  ]);

  onBeforeMount(() => {
    validateAndFetDetails();
  });

  watch(
    () => route.fullPath,
    () => validateAndFetDetails(),
  );

  const validateAndFetDetails = async (): Promise<void> => {
    if (!route.path.startsWith("/clases/")) return;
    const id = parseInt(route.params.id as string, 10);
    if (isNaN(id) || id <= 0) {
      console.error("Invalid or missing ID in route:", route.params.id);
      loading.value = false;
      return;
    }

    try {
      await fetchClassDetais(id);
      await fetchAttendancesByClass(id);
      loading.value = true;
    } catch (error) {
      console.error("Error fetching class detail:", error);
      loading.value = false;
    }
  };

  const attendances = computed<ClassAttendance[]>(() => [
    ...attendanceMap.value.values(),
  ]);
  const generations = computed<Generation[]>(() => [
    ...resGenerations.value.values(),
  ]);
  const users = computed<User[]>(() => usersByFilters.value ?? []);

  const openAssignDialog = (): void => {
    assignDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const data = attendanceMap.value.get(id);
    if (!data) return;
    editItem.value = { ...data };
    updateDialog.value = true;
  };

  const searchUsers = async (form: unknown): Promise<void> => {
    if (!form) return;
    await fetchUsersByFilters(form);
  };

  const onAssignUsersToClass = async (ids: unknown): Promise<void> => {
    if (!ids) return;
    const form = { class_id: classDetail.value?.id, user_ids: ids };
    const res = await assignUsers(form);
    if (res) {
      assignDialog.value = false;
    }
  };

  const onAttendanceUpdate = async (form: unknown): Promise<void> => {
    if (!form && editItem.value) return;
    const res = await updateAttendance(form, editItem.value!.id);
    if (res) {
      updateDialog.value = false;
    }
  };

  const onRemoveAttendance = async (id: number): Promise<void> => {
    if (!id) return;
    try {
      await deleteAttendance(id);
    } catch (e) {
      console.error(e);
    }
  };

  const getReport = async (): Promise<void> => {
    if (!classDetail.value?.id) return;
    try {
      await generateReportPDF(classDetail.value.id);
    } catch (e) {
      console.error(e);
    }
  };

  const getReportSheet = async (): Promise<void> => {
    if (!classDetail.value?.id) return;
    try {
      await generateReportSheet(classDetail.value.id);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    links,
    loading,
    classDetail,
    attendances,
    assignDialog,
    filteredCampus,
    generations,
    users,
    editItem,
    updateDialog,
    searchUsers,
    assignUsers,
    openAssignDialog,
    onAssignUsersToClass,
    openUpdateDialog,
    onAttendanceUpdate,
    onRemoveAttendance,
    getReport,
    getReportSheet,
  };
});
