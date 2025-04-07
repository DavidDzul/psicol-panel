import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useGraduateStore } from "@/stores/api/graduatesStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

export const useGraduatesPageStore = defineStore("graduatesPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus, readGraduates, createGraduates, editGraduates } =
        storeToRefs(useAuthStore());
    const { resGenerations } = storeToRefs(useGenerationsStore());
    const { resGraduates } = storeToRefs(useGraduateStore());
    const { fetchGraduates, createGraduate, updateGraduate } = useGraduateStore();

    const router = useRouter();
    const createDialog = ref(false);
    const updateDialog = ref(false);
    const editGraduate = ref(undefined);

    const loadingCreate = ref(false);
    const loadingUpdate = ref(false);
    const loadingTable = ref(false)

    onBeforeMount(async () => {
        loadingTable.value = true
        await fetchGraduates();
        loadingTable.value = false
    });

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Egresados",
            disabled: true,
            href: "/egresados",
        },
    ]);

    const graduates = computed(() => [...resGraduates.value.values()]);
    const generations = computed(() => [...resGenerations.value.values()]);

    const openCreateDialog = () => {
        createDialog.value = true;
    };

    const openUpdateDialog = (id) => {
        const graduate = resGraduates.value.get(id);
        if (!graduate) return;
        editGraduate.value = { ...graduate };
        updateDialog.value = true;
    };

    const openGraduateDetail = (id) => {
        router.push("egresados/" + id);
    };

    const onSaveGradute = async (form) => {
        loadingCreate.value = true;
        if (form) {
            try {
                const res = await createGraduate(form);
                if (res) {
                    createDialog.value = false;
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingCreate.value = false;
    };

    const onUpdateGraduate = async (form) => {
        if (!editGraduate.value) return;
        loadingUpdate.value = true;
        if (form) {
            try {
                const res = await updateGraduate(form, editGraduate.value.id);
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
        graduates,
        createDialog,
        updateDialog,
        generations,
        filteredCampus,
        loadingCreate,
        loadingUpdate,
        editGraduate,
        readGraduates,
        createGraduates,
        editGraduates,
        loadingTable,
        openCreateDialog,
        onSaveGradute,
        openUpdateDialog,
        onUpdateGraduate,
        openGraduateDetail,
    };
});
