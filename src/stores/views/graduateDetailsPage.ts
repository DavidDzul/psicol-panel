import { defineStore, storeToRefs } from "pinia";
import { useGraduateStore } from "@/stores/api/graduatesStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { Graduate } from "@/interfaces/graduate";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useGraduateDetailsPageStore = defineStore(
  "graduateDetailsPage",
  () => {
    const { setLoading } = useAppStore();
    const { userProfile } = storeToRefs(useAuthStore());

    const { resGraduateDetails } = storeToRefs(useGraduateStore());
    const { showGraduate, updateGraduate } = useGraduateStore();

    const route = useRoute();
    const loadUser = ref<boolean>(false);
    const updateDialog = ref<boolean>(false);
    const loadingUpdate = ref<boolean>(false);

    onBeforeMount(() => {
      validateAndFetchUserDetail();
    });

    watch(
      () => route.fullPath,
      () => validateAndFetchUserDetail(),
    );

    const validateAndFetchUserDetail = async (): Promise<void> => {
      if (!route.path.startsWith("/egresados/")) return;

      const id = parseInt(route.params.id as string, 10);
      if (isNaN(id) || id <= 0) {
        console.error("Invalid or missing ID in route:", route.params.id);
        loadUser.value = false;
        return;
      }

      try {
        await showGraduate(id);
        loadUser.value = true;
      } catch (error) {
        console.error("Error fetching user detail:", error);
        loadUser.value = false;
      }
    };

    const selectedGraduate = computed<Graduate | null>(
      () => resGraduateDetails.value,
    );

    const links = computed<LinkInterface[]>(() => [
      {
        title: "Inicio",
        disabled: false,
        href: "/",
      },
      {
        title: "Egresados",
        disabled: false,
        href: "/egresados",
      },
      {
        title: "Detalles del egresados/a",
        disabled: true,
        href: "/egresados/:id",
      },
    ]);

    const openUpdateDialog = (): void => {
      if (!selectedGraduate.value) return;
      updateDialog.value = true;
    };

    const onUpdateGraduate = async (form: unknown): Promise<void> => {
      if (!selectedGraduate.value) return;
      loadingUpdate.value = true;
      if (form) {
        try {
          const res = await updateGraduate(form, selectedGraduate.value.id);
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
      updateDialog,
      loadingUpdate,
      selectedGraduate,
      onUpdateGraduate,
      openUpdateDialog,
    };
  },
);
