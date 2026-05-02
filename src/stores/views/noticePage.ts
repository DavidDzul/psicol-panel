import { defineStore, storeToRefs } from "pinia";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useAuthStore } from "@/stores/api/authStore";
import { useNoticeStore } from "@/stores/api/noticeStore";

import type { Notice } from "@/interfaces/notice";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useNoticePageStore = defineStore("noticePage", () => {
  const { setLoading } = useAppStore();
  const { noticesMap } = storeToRefs(useNoticeStore());
  const { fetchNotices, createNotice, updateNotice, deleteNotice } =
    useNoticeStore();
  const { filteredCampus, isRoot } = storeToRefs(useAuthStore());

  const loading = ref<boolean>(false);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Avisos",
      disabled: true,
      href: "/avisos",
    },
  ]);

  const createDialog = ref<boolean>(false);
  const editItem = ref<Notice | undefined>(undefined);
  const updateDialog = ref<boolean>(false);

  const notices = computed<Notice[]>(() => [...noticesMap.value.values()]);

  onBeforeMount(async () => {
    loading.value = true;
    await fetchNotices();
    loading.value = false;
  });

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openUpdateDialog = (id: number): void => {
    const data = noticesMap.value.get(id);
    if (!data) return;
    editItem.value = { ...data };
    updateDialog.value = true;
  };

  const onCreateNotice = async (form: unknown): Promise<void> => {
    loading.value = true;
    try {
      if (form) {
        const res = await createNotice(form);
        if (res) {
          createDialog.value = false;
        }
      }
    } catch (error) {
      console.error(error);
      loading.value = false;
    }
    loading.value = false;
  };

  const onUpdateNotice = async (form: unknown): Promise<void> => {
    loading.value = true;
    try {
      if (form && editItem.value) {
        const res = await updateNotice(form, editItem.value.id);
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

  const onRemoveNotice = async (id: number): Promise<void> => {
    if (!id) return;
    await deleteNotice(id);
  };

  return {
    links,
    loading,
    notices,
    createDialog,
    filteredCampus,
    editItem,
    updateDialog,
    isRoot,
    openCreateDialog,
    onCreateNotice,
    openUpdateDialog,
    onUpdateNotice,
    onRemoveNotice,
  };
});
