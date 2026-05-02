import { defineStore } from "pinia";
import { useCheckStore } from "@/stores/api/checkStore";
import { useAppStore } from "@/stores/app";
import { computed, ref } from "vue";

import type { LinkInterface } from "@/interfaces/link.interface";

export const useCheckPageStore = defineStore("checkPage", () => {
  const { setLoading } = useAppStore();
  const { createCheckIn } = useCheckStore();

  const loading = ref<boolean>(false);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
  ]);

  const onCreateCheckIn = async (code: string) => {
    loading.value = true;
    try {
      if (!code) throw new Error("Código QR vacío");
      const res = await createCheckIn(code);
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
