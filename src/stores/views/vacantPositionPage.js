import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useVacantPositionStore } from "@/stores/api/vacanPositionStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

export const useVacantPositionPageStore = defineStore("vacantPositionPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus, readVacant, createVacant, editVacant } =
        storeToRefs(useAuthStore());
    const { resGenerations } = storeToRefs(useGenerationsStore());
    const { resPositions } = storeToRefs(useVacantPositionStore());
    const { fetchVacantPositions, statusVacant, resetVacant, createVacantLaboral, createVacantJunior, createVacantPractice } =
        useVacantPositionStore();

    const router = useRouter();
    const createDialog = ref(false);
    const updateDialog = ref(false);
    const vacantDialog = ref(false);
    const vacantJuniorDialog = ref(false);
    const practiceDialog = ref(false);
    const disabledDialog = ref(false);
    const selectedVacantId = ref(null);

    const loadingCreate = ref(false);
    const loadingUpdate = ref(false);
    const loadingDisabled = ref(false);
    const loadingTable = ref(false);

    onBeforeMount(async () => {
        loadingTable.value = true
        await fetchVacantPositions();
        loadingTable.value = false
    });

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
    ]);

    const positions = computed(() => [...resPositions.value.values()]);
    const generations = computed(() => [...resGenerations.value.values()]);

    const openCreateDialog = () => {
        createDialog.value = true;
    };

    const openVacantDetail = (id) => {
        router.push("vacantes/" + id);
    };

    const openVacantDialog = () => {
        vacantDialog.value = true;
    };

    const openVacantJuniorDialog = () => {
        vacantJuniorDialog.value = true;
    };

    const openVacantPracticeDialog = () => {
        practiceDialog.value = true;
    };


    const openDisabledDialog = (id) => {
        if (!id) return;
        selectedVacantId.value = id;
        disabledDialog.value = true;
    };

    const onDisabledVacant = async (form) => {
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

    const onEnableVacant = async (id) => {
        if (!id) return;
        try {
            await resetVacant(id);
        } catch (e) {
            console.error(e);
        }
    };

    const saveVacantPosition = async (form) => {
        if (!form) return
        loadingCreate.value = true
        try {
            await createVacantLaboral(form.id, form)
            vacantDialog.value = false
        } catch (e) {
            console.error(e)
        }
        loadingCreate.value = false
    };

    const saveVacantJunior = async (form) => {
        if (!form) return
        loadingCreate.value = true
        try {
            await createVacantJunior(form.id, form)
            vacantJuniorDialog.value = false
        } catch (e) {
            console.error(e)
        }
        loadingCreate.value = false
    };


    const saveVacantPractice = async (form) => {
        if (!form) return
        loadingCreate.value = true
        try {
            await createVacantPractice(form.id, form)
            practiceDialog.value = false
        } catch (e) {
            console.error(e)
        }
        loadingCreate.value = false
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
        saveVacantPractice
    };
}
);
