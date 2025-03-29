import { defineStore, storeToRefs } from "pinia";
import { useDataStore } from "@/stores/api/dataStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useDataPageStore = defineStore("dataPage", () => {
    const { setLoading } = useAppStore();
    const { filteredCampus } = storeToRefs(useAuthStore())

    const { resAreas, resCandidates } = storeToRefs(useDataStore())
    const { fetchAreas, fetchCandidates, createArea, updateArea, deleteArea, createCandidateData, updateCandidateData, deleteCandidateData } = useDataStore()

    const router = useRouter()
    const areaDialog = ref(false)
    const candidateDataDialog = ref(false)
    const areaUpdateDialog = ref(false)
    const candidateUpdateDialog = ref(false)
    const loadingCreate = ref(false)
    const loadingUpdate = ref(false)
    const editArea = ref(undefined)
    const editCandidate = ref(undefined)

    onBeforeMount(async () => {
        await fetchAreas();
        await fetchCandidates()
    });

    const links = computed(() => [
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
    ])

    const areas = computed(() => [...resAreas.value.values()])
    const candidates = computed(() => [...resCandidates.value.values()])

    const openAreaDialog = () => {
        areaDialog.value = true
    }

    const openCandidateDataDialog = () => {
        candidateDataDialog.value = true
    }

    const openAreaUpdateDialog = (id) => {
        const area = resAreas.value.get(id);
        if (!area) return;
        editArea.value = { ...area };
        areaUpdateDialog.value = true;
    };

    const openCandidateUpdateDialog = (id) => {
        const candidate = resCandidates.value.get(id);
        if (!candidate) return;
        editCandidate.value = { ...candidate };
        candidateUpdateDialog.value = true;
    };

    const onSaveArea = async (form) => {
        loadingCreate.value = true
        if (form) {
            try {
                const res = await createArea(form);
                if (res) {
                    areaDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingCreate.value = false
    };

    const onUpdateArea = async (form) => {
        loadingUpdate.value = true
        if (form && editArea.value) {
            try {
                const res = await updateArea(form, editArea.value.id);
                if (res) {
                    areaUpdateDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingUpdate.value = false
    };

    const onRemoveArea = async (id) => {
        if (!id) return
        try {
            await deleteArea(id)
        } catch (e) {
            console.error(e)
        }
    }

    const onSaveCandidateData = async (form) => {
        loadingCreate.value = true
        if (form) {
            try {
                const res = await createCandidateData(form);
                if (res) {
                    candidateDataDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingCreate.value = false
    };

    const onUpdateCandidateData = async (form) => {
        loadingUpdate.value = true
        if (form && editCandidate.value) {
            try {
                const res = await updateCandidateData(form, editCandidate.value.id);
                if (res) {
                    candidateUpdateDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingUpdate.value = false
    };

    const onRemoveCandidateData = async (id) => {
        if (!id) return
        try {
            await deleteCandidateData(id)
        } catch (e) {
            console.error(e)
        }
    }

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
        onRemoveCandidateData
    };
});