import { defineStore } from "pinia";
import { useAttendanceStore } from "@/stores/api/attendanceStore";
import { useAppStore } from "@/stores/app";
import { computed, ref } from "vue";

import type { LinkInterface } from "@/interfaces/link.interface";

export const useAttendancePageStore = defineStore("attendancePage", () => {
  const { setLoading } = useAppStore();
  const { createCheckIn } = useAttendanceStore();

  const loading = ref<boolean>(false);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Asistencias",
      disabled: true,
      href: "/asistencias",
    },
  ]);

  const onCreateCheckIn = async (code: string): Promise<unknown> => {
    loading.value = true;
    try {
      if (!code) throw new Error("Código QR vacío");
      const res = await createCheckIn({ token: code });
      return res;
    } catch (error) {
      loading.value = false;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    links,
    loading,
    onCreateCheckIn,
  };
});
