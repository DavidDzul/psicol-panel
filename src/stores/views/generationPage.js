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
    const { createGeneration, updateGeneration } = useGenerationsStore()

    const router = useRouter()
    const createDialog = ref(false)
    const loadingCreate = ref(false)
    const loading = ref(false)
    const editItem = ref(undefined)
    const updateDialog = ref(false)

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

    const openUpdateDialog = (id) => {
        const data = resGenerations.value.get(id);
        if (!data) return;
        editItem.value = { ...data };
        updateDialog.value = true;
    };

    const onSaveGeneration = async (form) => {
        loadingCreate.value = true
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

    const onUpdateGeneration = async (form) => {
        loading.value = true
        try {
            if (form && editItem.value) {
                const res = await updateGeneration(form, editItem.value.id);
                if (res) {
                    updateDialog.value = false
                }
            }
        } catch (error) {
            console.log(error)
            loading.value = false
        }
        loading.value = false
    };

    return {
        links,
        generations,
        createDialog,
        loadingCreate,
        filteredCampus,
        editItem,
        updateDialog,
        openCreateDialog,
        onSaveGeneration,
        openUpdateDialog,
        onUpdateGeneration
    };
});