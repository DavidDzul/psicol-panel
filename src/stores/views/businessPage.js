import { defineStore, storeToRefs } from "pinia";
import { useBusinessStore } from "@/stores/api/businessStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

export const useBusinessPageStore = defineStore("businessPage", () => {
    const { setLoading } = useAppStore();

    const {
        filteredCampus,
        readBusiness,
        createBusinessPermission,
        editBusiness,
    } = storeToRefs(useAuthStore());
    const { resBusiness } = storeToRefs(useBusinessStore());
    const { fetchBusiness, createBusiness } = useBusinessStore();

    const router = useRouter();
    const createDialog = ref(false);
    const updateDialog = ref(false);
    const editUser = ref(undefined);

    const loadingCreate = ref(false);
    const loadingUpdate = ref(false);

    onBeforeMount(async () => {
        await fetchBusiness();
    });

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Empresas",
            disabled: true,
            href: "/empresas",
        },
    ]);

    const business = computed(() => [...resBusiness.value.values()]);

    const openCreateDialog = () => {
        createDialog.value = true;
    };

    const openUpdateDialog = (id) => {
        const user = resUsers.value.get(id);
        if (!user) return;
        editUser.value = { ...user };
        updateDialog.value = true;
    };

    const openBusinessDetail = (id) => {
        router.push("empresas/" + id);
    };

    const onSaveBusiness = async (form) => {
        loadingCreate.value = true;
        if (form) {
            try {
                const res = await createBusiness(form);
                if (res) {
                    createDialog.value = false;
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingCreate.value = false;
    };

    // const onUpdateUser = async (form) => {
    //     if (!editUser.value) return
    //     loadingUpdate.value = true
    //     if (form) {
    //         try {
    //             const res = await updateUser(form, editUser.value.id);
    //             if (res) {
    //                 updateDialog.value = false
    //             }
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    //     loadingUpdate.value = false
    // };

    return {
        links,
        business,
        // editUser,
        // generations,
        // updateDialog,
        createDialog,
        loadingCreate,
        filteredCampus,
        // loadingUpdate,
        readBusiness,
        createBusinessPermission,
        editBusiness,
        openBusinessDetail,
        // openUpdateDialog,
        openCreateDialog,
        onSaveBusiness,
        // onUpdateUser,
    };
});
