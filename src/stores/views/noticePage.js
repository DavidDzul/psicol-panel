import { defineStore, storeToRefs } from "pinia";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";
import { useNoticeStore } from "@/stores/api/noticeStore";

export const useNoticePageStore = defineStore("noticePage", () => {
    const { setLoading } = useAppStore();
    const { noticesMap } = storeToRefs(useNoticeStore())
    const { fetchNotices, createNotice, updateNotice, deleteNotice } = useNoticeStore()
    const { filteredCampus, isRoot } = storeToRefs(useAuthStore())

    const router = useRouter()
    const loading = ref(false)
    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Avisos",
            disabled: true,
            href: "/avisos",
        },
    ]);

    const createDialog = ref(false)
    const editItem = ref(undefined)
    const updateDialog = ref(false)

    const notices = computed(() => [...noticesMap.value.values()])

    onBeforeMount(async () => {
        loading.value = true
        await fetchNotices();
        loading.value = false
    });

    const openCreateDialog = () => {
        createDialog.value = true
    }

    const openUpdateDialog = (id) => {
        const data = noticesMap.value.get(id);
        if (!data) return;
        editItem.value = { ...data };
        updateDialog.value = true;
    };

    const onCreateNotice = async (form) => {
        loading.value = true
        try {
            if (form) {
                const res = await createNotice(form);
                if (res) {
                    createDialog.value = false
                }
            }
        } catch (error) {
            console.log(error)
            loading.value = false
        }
        loading.value = false
    };

    const onUpdateNotice = async (form) => {
        loading.value = true
        try {
            if (form && editItem.value) {
                const res = await updateNotice(form, editItem.value.id);
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

    const onRemoveNotice = async (id) => {
        if (!id) return
        await deleteNotice(id)
    }

    return {
        links,
        loading,
        notices,
        createDialog,
        filteredCampus,
        editItem,
        updateDialog,
        isRoot,
        openCreateDialog,
        onCreateNotice,
        openUpdateDialog,
        onUpdateNotice,
        onRemoveNotice
    };
});
