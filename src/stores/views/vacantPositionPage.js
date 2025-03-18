import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useVacantPositionStore } from "@/stores/api/vacanPositionStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useVacantPositionPageStore = defineStore("vacantPositionPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus } = storeToRefs(useAuthStore())
    const { resGenerations } = storeToRefs(useGenerationsStore());
    const { resPositions } = storeToRefs(useVacantPositionStore())
    const { fetchVacantPositions } = useVacantPositionStore()

    const router = useRouter()
    const createDialog = ref(false)
    const updateDialog = ref(false)
    const vacantDialog = ref(false)

    const loadingCreate = ref(false)
    const loadingUpdate = ref(false)

    onBeforeMount(async () => {
        await fetchVacantPositions()
    })

    const links = computed(() => [
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
    ])

    const positions = computed(() => [...resPositions.value.values()])
    const generations = computed(() => [...resGenerations.value.values()])

    const openCreateDialog = () => {
        createDialog.value = true
    }

    const openVacantDetail = (id) => {
        router.push("vacantes/" + id)
    }

    const openVacantDialog = () => {
        vacantDialog.value = true
    }

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
        openVacantDetail,
        openCreateDialog,
        openVacantDialog,
    };
});