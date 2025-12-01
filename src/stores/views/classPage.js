import { defineStore, storeToRefs } from "pinia";
import { useClassStore } from "@/stores/api/classStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";
import { useGenerationsStore } from "@/stores/api/generationStore";

export const useClassPageStore = defineStore("classPage", () => {
    const { setLoading } = useAppStore();
    const { classMap } = storeToRefs(useClassStore())
    const { fetchClasses, createClass, updateClass, deleteClass, reportByPeriod } = useClassStore()
    const { filteredCampus } = storeToRefs(useAuthStore())
    const { resGenerations } = storeToRefs(useGenerationsStore());

    const router = useRouter()
    const loading = ref(false)
    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Sesiones de F",
            disabled: true,
            href: "/clases",
        },
    ]);
    const createDialog = ref(false)
    const editClass = ref(undefined)
    const updateDialog = ref(false)
    const reportModal = ref(false)

    // onBeforeMount(async () => {
    //     loading.value = true
    //     await fetchClasses();
    //     loading.value = false
    // });

    const openCreateDialog = () => {
        createDialog.value = true
    }

    const openUpdateDialog = (id) => {
        const data = classMap.value.get(id);
        if (!data) return;
        editClass.value = { ...data };
        updateDialog.value = true;
    };

    const classes = computed(() => [...classMap.value.values()])
    const generations = computed(() => [...resGenerations.value.values()])

    const onCreateClass = async (form) => {
        loading.value = true
        if (form) {
            const res = await createClass(form);
            if (res) {
                createDialog.value = false
            }
        }
        loading.value = false
    };

    const onUpdateClass = async (form) => {
        loading.value = true
        if (form && editClass.value) {
            const res = await updateClass(form, editClass.value.id);
            if (res) {
                updateDialog.value = false
            }
        }
        loading.value = false
    };

    const onRemoveClass = async (id) => {
        if (!id) return
        await deleteClass(id)
    }

    const openClassDetail = (id) => {
        router.push("clases/" + id);
    };

    const openReportModal = () => {
        reportModal.value = true
    };

    const createReport = async (form) => {
        loading.value = true
        if (form) {
            const res = await reportByPeriod(form);
            if (res) {
                reportModal.value = false
            }
        }
    }

    const classTable = computed(() => {
        return classes.value.map(c => {
            const gen = resGenerations.value.get(c.generation_id);

            return {
                ...c,
                generation_name: gen ? gen.generation_name : "—"
            };
        });
    });

    const searchData = async (form) => {
        loading.value = true
        if (form) {
            const res = await fetchClasses(form);
            if (res) {
                reportModal.value = false
            }
        }
    }

    return {
        links,
        loading,
        classes,
        editClass,
        createDialog,
        updateDialog,
        generations,
        filteredCampus,
        reportModal,
        classTable,
        onCreateClass,
        openCreateDialog,
        openUpdateDialog,
        onUpdateClass,
        onRemoveClass,
        openClassDetail,
        createReport,
        openReportModal,
        searchData
    };
});
