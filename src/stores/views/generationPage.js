import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useGenerationsPageStore = defineStore("generationsPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus } = storeToRefs(useAuthStore())
    const { resGenerations } = storeToRefs(useGenerationsStore());
    const { createGeneration } = useGenerationsStore()

    const router = useRouter()
    const createDialog = ref(false)
    const loadingCreate = ref(false)



    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Generaciones",
            disabled: true,
            href: "/generaciones",
        },
    ])

    const generations = computed(() => [...resGenerations.value.values()])

    const openCreateDialog = () => {
        createDialog.value = true
    }

    const onSaveGeneration = async (form) => {
        loadingCreate.value = true
        console.log(form)
        if (form) {
            try {
                const res = await createGeneration(form);
                if (res) {
                    createDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingCreate.value = false
    };

    return {
        links,
        generations,
        createDialog,
        loadingCreate,
        filteredCampus,
        openCreateDialog,
        onSaveGeneration,
    };
});