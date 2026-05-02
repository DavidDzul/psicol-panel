import { defineStore, storeToRefs } from "pinia";
import { useVacantPositionStore } from "@/stores/api/vacanPositionStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { VacantPosition } from "@/interfaces/vacant";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useVacantPositionDetailsPageStore = defineStore(
  "vacantPositionDetailsPage",
  () => {
    const { setLoading } = useAppStore();
    const { editVacant } = storeToRefs(useAuthStore());

    const { resVacantDetails } = storeToRefs(useVacantPositionStore());
    const {
      showVacant,
      updateVacantLaboral,
      updateVacantPractice,
      updateVacantJr,
      statusVacant,
      resetVacant,
    } = useVacantPositionStore();

    const route = useRoute();
    const loadUser = ref<boolean>(false);
    const updateDialog = ref<boolean>(false);
    const updatePracticeDialog = ref<boolean>(false);
    const updateJrDialog = ref<boolean>(false);
    const disabledDialog = ref<boolean>(false);
    const selectedVacantId = ref<number | null>(null);

    const loadingUpdate = ref<boolean>(false);
    const loadingDisabled = ref<boolean>(false);

    onBeforeMount(() => {
      validateAndFetchUserDetail();
    });

    watch(
      () => route.fullPath,
      () => validateAndFetchUserDetail(),
    );

    const validateAndFetchUserDetail = async (): Promise<void> => {
      if (!route.path.startsWith("/vacantes/")) return;

      const id = parseInt(route.params.id as string, 10);
      if (isNaN(id) || id <= 0) {
        console.error("Invalid or missing ID in route:", route.params.id);
        loadUser.value = false;
        return;
      }

      try {
        await showVacant(id);
        loadUser.value = true;
      } catch (error) {
        console.error("Error fetching user detail:", error);
        loadUser.value = false;
      }
    };

    const selectedVacant = computed<VacantPosition | null>(
      () => resVacantDetails.value,
    );

    const links = computed<LinkInterface[]>(() => [
      {
        title: "Inicio",
        disabled: false,
        href: "/",
      },
      {
        title: "Vacantes",
        disabled: false,
        href: "/vacantes",
      },
      {
        title: "Detalles de la vacante",
        disabled: true,
        href: "/vacantes/:id",
      },
    ]);

    const openUpdateDialog = (): void => {
      if (!selectedVacant.value) return;
      if (selectedVacant.value.category === "JOB_POSITION") {
        updateDialog.value = true;
      } else if (selectedVacant.value.category === "PROFESSIONAL_PRACTICE") {
        updatePracticeDialog.value = true;
      } else if ((selectedVacant.value.category as string) === "JR_POSITION") {
        updateJrDialog.value = true;
      }
    };

    const onUpdateVacantLaboral = async (form: unknown): Promise<void> => {
      loadingUpdate.value = true;
      if (!selectedVacant.value && !form) return;
      try {
        const res = await updateVacantLaboral(selectedVacant.value!.id, form);
        if (res) {
          updateDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
      loadingUpdate.value = false;
    };

    const onUpdateVacantPractice = async (form: unknown): Promise<void> => {
      loadingUpdate.value = true;
      if (!selectedVacant.value && !form) return;
      try {
        const res = await updateVacantPractice(
          selectedVacant.value!.id,
          form,
        );
        if (res) {
          updatePracticeDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
      loadingUpdate.value = false;
    };

    const onUpdateVacantJunior = async (form: unknown): Promise<void> => {
      loadingUpdate.value = true;
      if (!selectedVacant.value && !form) return;
      try {
        const res = await updateVacantJr(selectedVacant.value!.id, form);
        if (res) {
          updateJrDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
      loadingUpdate.value = false;
    };

    const openDisabledDialog = (id: number): void => {
      if (!id) return;
      selectedVacantId.value = id;
      disabledDialog.value = true;
    };

    const onDisabledVacant = async (form: unknown): Promise<void> => {
      if (!selectedVacant.value) return;
      loadingDisabled.value = true;
      try {
        await statusVacant(selectedVacant.value.id, form);
        disabledDialog.value = false;
      } catch (e) {
        console.error(e);
      }
      loadingDisabled.value = false;
    };

    const onEnableVacant = async (id: number): Promise<void> => {
      if (!id) return;
      try {
        await resetVacant(id);
      } catch (e) {
        console.error(e);
      }
    };

    return {
      links,
      updateDialog,
      updatePracticeDialog,
      updateJrDialog,
      selectedVacant,
      loadingUpdate,
      disabledDialog,
      editVacant,
      openUpdateDialog,
      onUpdateVacantLaboral,
      onUpdateVacantPractice,
      onUpdateVacantJunior,
      openDisabledDialog,
      onDisabledVacant,
      onEnableVacant,
    };
  },
);
