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
    const { fetchVacantPositions, statusVacant, resetVacant } = useVacantPositionStore()

    const router = useRouter()
    const createDialog = ref(false)
    const updateDialog = ref(false)
    const vacantDialog = ref(false)
    const disabledDialog = ref(false)
    const selectedVacantId = ref(null)

    const loadingCreate = ref(false)
    const loadingUpdate = ref(false)
    const loadingDisabled = ref(false)

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

    const openDisabledDialog = (id) => {
        if (!id) return
        selectedVacantId.value = id
        disabledDialog.value = true
    }

    const onDisabledVacant = async (form) => {
        if (!selectedVacantId.value) return
        loadingDisabled.value = true
        try {
            await statusVacant(selectedVacantId.value, form)
            disabledDialog.value = false
        } catch (e) {
            console.error(e)
        }
        loadingDisabled.value = false
    }

    const onEnableVacant = async (id) => {
        if (!id) return
        try {
            await resetVacant(id)
        } catch (e) {
            console.error(e)
        }
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
        disabledDialog,
        loadingDisabled,
        openVacantDetail,
        openCreateDialog,
        openVacantDialog,
        openDisabledDialog,
        onDisabledVacant,
        onEnableVacant,
    };
});