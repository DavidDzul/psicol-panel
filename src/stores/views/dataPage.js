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
    const { fetchAreas, fetchCandidates } = useDataStore()

    const router = useRouter()
    const createDialog = ref(false)
    const loadingCreate = ref(false)

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
    // const openCreateDialog = () => {
    //     createDialog.value = true
    // }

    // const onSaveGeneration = async (form) => {
    //     loadingCreate.value = true
    //     if (form) {
    //         try {
    //             const res = await createGeneration(form);
    //             if (res) {
    //                 createDialog.value = false
    //             }
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    //     loadingCreate.value = false
    // };

    return {
        links,
        areas,
        candidates,
    };
});