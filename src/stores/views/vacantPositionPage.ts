import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useVacantPositionStore } from "@/stores/api/vacanPositionStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { VacantPosition } from "@/interfaces/vacant";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useVacantPositionPageStore = defineStore(
  "vacantPositionPage",
  () => {
    const { setLoading } = useAppStore();

    const { filteredCampus, readVacant, createVacant, editVacant } =
      storeToRefs(useAuthStore());
    const { resGenerations } = storeToRefs(useGenerationsStore());
    const { resPositions } = storeToRefs(useVacantPositionStore());
    const {
      fetchVacantPositions,
      statusVacant,
      resetVacant,
      createVacantLaboral,
      createVacantJunior,
      createVacantPractice,
    } = useVacantPositionStore();

    const router = useRouter();
    const createDialog = ref<boolean>(false);
    const updateDialog = ref<boolean>(false);
    const vacantDialog = ref<boolean>(false);
    const vacantJuniorDialog = ref<boolean>(false);
    const practiceDialog = ref<boolean>(false);
    const disabledDialog = ref<boolean>(false);
    const selectedVacantId = ref<number | null>(null);

    const loadingCreate = ref<boolean>(false);
    const loadingUpdate = ref<boolean>(false);
    const loadingDisabled = ref<boolean>(false);
    const loadingTable = ref<boolean>(false);

    onBeforeMount(async () => {
      loadingTable.value = true;
      await fetchVacantPositions();
      loadingTable.value = false;
    });

    const links = computed<LinkInterface[]>(() => [
      {
        title: "Inicio",
        disabled: false,
        href: "/",
      },
      {
        title: "Vacantes",
        disabled: true,
        href: "/vacantes",
      },
    ]);

    const positions = computed<VacantPosition[]>(() => [
      ...resPositions.value.values(),
    ]);
    const generations = computed<Generation[]>(() => [
      ...resGenerations.value.values(),
    ]);

    const openCreateDialog = (): void => {
      createDialog.value = true;
    };

    const openVacantDetail = (id: number): void => {
      router.push("vacantes/" + id);
    };

    const openVacantDialog = (): void => {
      vacantDialog.value = true;
    };

    const openVacantJuniorDialog = (): void => {
      vacantJuniorDialog.value = true;
    };

    const openVacantPracticeDialog = (): void => {
      practiceDialog.value = true;
    };

    const openDisabledDialog = (id: number): void => {
      if (!id) return;
      selectedVacantId.value = id;
      disabledDialog.value = true;
    };

    const onDisabledVacant = async (form: unknown): Promise<void> => {
      if (!selectedVacantId.value) return;
      loadingDisabled.value = true;
      try {
        await statusVacant(selectedVacantId.value, form);
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

    const saveVacantPosition = async (form: unknown): Promise<void> => {
      if (!form) return;
      loadingCreate.value = true;
      try {
        await createVacantLaboral((form as any).id, form);
        vacantDialog.value = false;
      } catch (e) {
        console.error(e);
      }
      loadingCreate.value = false;
    };

    const saveVacantJunior = async (form: unknown): Promise<void> => {
      if (!form) return;
      loadingCreate.value = true;
      try {
        await createVacantJunior((form as any).id, form);
        vacantJuniorDialog.value = false;
      } catch (e) {
        console.error(e);
      }
      loadingCreate.value = false;
    };

    const saveVacantPractice = async (form: unknown): Promise<void> => {
      if (!form) return;
      loadingCreate.value = true;
      try {
        await createVacantPractice((form as any).id, form);
        practiceDialog.value = false;
      } catch (e) {
        console.error(e);
      }
      loadingCreate.value = false;
    };

    return {
      links,
      positions,
      generations,
      updateDialog,
      createDialog,
      loadingCreate,
      filteredCampus,
      loadingUpdate,
      vacantDialog,
      disabledDialog,
      loadingDisabled,
      readVacant,
      createVacant,
      editVacant,
      vacantJuniorDialog,
      practiceDialog,
      loadingTable,
      openVacantDetail,
      openCreateDialog,
      openVacantDialog,
      openDisabledDialog,
      onDisabledVacant,
      onEnableVacant,
      saveVacantPosition,
      openVacantJuniorDialog,
      saveVacantJunior,
      openVacantPracticeDialog,
      saveVacantPractice,
    };
  },
);
