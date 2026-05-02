import { defineStore, storeToRefs } from "pinia";
import { useDataStore } from "@/stores/api/dataStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useAuthStore } from "@/stores/api/authStore";

import type { Area, CandidateData } from "@/interfaces/data";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useDataPageStore = defineStore("dataPage", () => {
  const { setLoading } = useAppStore();
  const { filteredCampus } = storeToRefs(useAuthStore());

  const { resAreas, resCandidates } = storeToRefs(useDataStore());
  const {
    fetchAreas,
    fetchCandidates,
    createArea,
    updateArea,
    deleteArea,
    createCandidateData,
    updateCandidateData,
    deleteCandidateData,
  } = useDataStore();

  const areaDialog = ref<boolean>(false);
  const candidateDataDialog = ref<boolean>(false);
  const areaUpdateDialog = ref<boolean>(false);
  const candidateUpdateDialog = ref<boolean>(false);
  const loadingCreate = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);
  const editArea = ref<Area | undefined>(undefined);
  const editCandidate = ref<CandidateData | undefined>(undefined);

  onBeforeMount(async () => {
    await fetchAreas();
    await fetchCandidates();
  });

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Datos",
      disabled: true,
      href: "/datos",
    },
  ]);

  const areas = computed<Area[]>(() => [...resAreas.value.values()]);
  const candidates = computed<CandidateData[]>(() => [
    ...resCandidates.value.values(),
  ]);

  const openAreaDialog = (): void => {
    areaDialog.value = true;
  };

  const openCandidateDataDialog = (): void => {
    candidateDataDialog.value = true;
  };

  const openAreaUpdateDialog = (id: number): void => {
    const area = resAreas.value.get(id);
    if (!area) return;
    editArea.value = { ...area };
    areaUpdateDialog.value = true;
  };

  const openCandidateUpdateDialog = (id: number): void => {
    const candidate = resCandidates.value.get(id);
    if (!candidate) return;
    editCandidate.value = { ...candidate };
    candidateUpdateDialog.value = true;
  };

  const onSaveArea = async (form: unknown): Promise<void> => {
    loadingCreate.value = true;
    if (form) {
      try {
        const res = await createArea(form);
        if (res) {
          areaDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingCreate.value = false;
  };

  const onUpdateArea = async (form: unknown): Promise<void> => {
    loadingUpdate.value = true;
    if (form && editArea.value) {
      try {
        const res = await updateArea(form, editArea.value.id);
        if (res) {
          areaUpdateDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingUpdate.value = false;
  };

  const onRemoveArea = async (id: number): Promise<void> => {
    if (!id) return;
    try {
      await deleteArea(id);
    } catch (e) {
      console.error(e);
    }
  };

  const onSaveCandidateData = async (form: unknown): Promise<void> => {
    loadingCreate.value = true;
    if (form) {
      try {
        const res = await createCandidateData(form);
        if (res) {
          candidateDataDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingCreate.value = false;
  };

  const onUpdateCandidateData = async (form: unknown): Promise<void> => {
    loadingUpdate.value = true;
    if (form && editCandidate.value) {
      try {
        const res = await updateCandidateData(form, editCandidate.value.id);
        if (res) {
          candidateUpdateDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingUpdate.value = false;
  };

  const onRemoveCandidateData = async (id: number): Promise<void> => {
    if (!id) return;
    try {
      await deleteCandidateData(id);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    links,
    areas,
    candidates,
    areaDialog,
    loadingCreate,
    editArea,
    areaUpdateDialog,
    loadingUpdate,
    candidateDataDialog,
    candidateUpdateDialog,
    editCandidate,
    openAreaDialog,
    onSaveArea,
    openAreaUpdateDialog,
    onUpdateArea,
    onRemoveArea,
    openCandidateDataDialog,
    onSaveCandidateData,
    openCandidateUpdateDialog,
    onUpdateCandidateData,
    onRemoveCandidateData,
  };
});
