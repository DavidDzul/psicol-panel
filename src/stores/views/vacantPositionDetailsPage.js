import { defineStore, storeToRefs } from "pinia";
import { useVacantPositionStore } from "@/stores/api/vacanPositionStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router"

export const useVacantPositionDetailsPageStore = defineStore("vacantPositionDetailsPage", () => {
    const { setLoading } = useAppStore();
    const { userProfile } = storeToRefs(useAuthStore());

    const { resVacantDetails } = storeToRefs(useVacantPositionStore());
    const { showVacant, } = useVacantPositionStore();

    const route = useRoute();
    const loadUser = ref(false);
    const updateDialog = ref(false)
    const loadingUpdate = ref(false)

    onBeforeMount(() => {
        validateAndFetchUserDetail();
    });

    watch(
        () => route.fullPath,
        () => validateAndFetchUserDetail()
    );

    const validateAndFetchUserDetail = async () => {
        // Verificar si la ruta coincide con "/becarios/:id"
        if (!route.path.startsWith("/vacantes/")) return;

        const id = parseInt(route.params.id, 10);
        if (isNaN(id) || id <= 0) {
            console.error("Invalid or missing ID in route:", route.params.id);
            loadUser.value = false;
            return;
        }

        try {
            await showVacant(id);
            loadUser.value = true;
        } catch (error) {
            console.error("Error fetching user detail:", error);
            loadUser.value = false;
        }
    };

    const selectedVacant = computed(() => resVacantDetails.value);

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Vacantes",
            disabled: false,
            href: "/vacantes",
        },
        {
            title: "Detalles de la vacante",
            disabled: true,
            href: "/vacantes/:id",
        },
    ])

    // const openUpdateDialog = () => {
    //     if (!selectedUser.value) return
    //     updateDialog.value = true
    // }

    // const onUpdateUser = async (form) => {
    //     if (!selectedUser.value) return
    //     loadingUpdate.value = true
    //     if (form) {
    //         try {
    //             const res = await updateUser(form, selectedUser.value.id);
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
        updateDialog,
        selectedVacant,
        loadingUpdate,
        // onUpdateUser,
        // openUpdateDialog
    };
});
