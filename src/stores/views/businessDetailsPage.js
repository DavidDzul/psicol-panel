import { defineStore, storeToRefs } from "pinia";
import { useBusinessStore } from "@/stores/api/businessStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router"

export const useBusinessDetailsPageStore = defineStore("businessDetailsPage", () => {
    const { setLoading } = useAppStore();
    const { userProfile, editBusiness } = storeToRefs(useAuthStore());

    const { resBusinessDetails, resBusinessData, resBusinessAgreements } = storeToRefs(useBusinessStore());
    const { getBusiness, getBusinessData, getBusinessAgreements, updateBusinessData, updateBusiness, createAgreement } = useBusinessStore();

    const route = useRoute();
    const loadUser = ref(false);
    const editDialog = ref(false)
    const editBusinessDialog = ref(false)
    const agreementDialog = ref(false)

    const loadingCreate = ref(false)
    const loadingUpdate = ref(false)

    onBeforeMount(() => {
        validateAndFetchBusinessDetail();
    });

    watch(
        () => route.fullPath,
        () => validateAndFetchBusinessDetail()
    );

    const validateAndFetchBusinessDetail = async () => {
        // Verificar si la ruta coincide con "/empresas/:id"
        if (!route.path.startsWith("/empresas/")) return;

        const id = parseInt(route.params.id, 10);
        if (isNaN(id) || id <= 0) {
            console.error("Invalid or missing ID in route:", route.params.id);
            loadUser.value = false;
            return;
        }

        try {
            await getBusiness(id);
            await getBusinessData(id);
            await getBusinessAgreements(id);
            loadUser.value = true;
        } catch (error) {
            console.error("Error fetching user detail:", error);
            loadUser.value = false;
        }
    };

    const selectedBusiness = computed(() => resBusinessDetails.value);
    const businessData = computed(() => resBusinessData.value);
    const agreements = computed(() => [...resBusinessAgreements.value.values()]);

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Empresas",
            disabled: false,
            href: "/empresas",
        },
        {
            title: "Detalles de la Empresa",
            disabled: true,
            href: "/empresas/:id",
        },
    ])

    const openUpdateDialog = () => {
        if (!selectedBusiness.value) return
        editDialog.value = true
    }

    const openUpdateBusinessDialog = () => {
        if (!businessData.value) return
        editBusinessDialog.value = true
    }

    const openAgreementDialog = () => {
        if (!selectedBusiness.value) return
        agreementDialog.value = true
    }

    const onUpdateBusinessData = async (form) => {
        loadingUpdate.value = true
        if (!form && !businessData) return
        try {
            const res = await updateBusinessData(form, businessData.value.id);
            if (res) {
                editBusinessDialog.value = false
            }
        } catch (error) {
            console.error(error);
        }
        loadingUpdate.value = false
    };

    const onUpdateBusiness = async (form) => {
        loadingUpdate.value = true
        if (!form && !selectedBusiness) return
        try {
            const res = await updateBusiness(form, selectedBusiness.value.id);
            if (res) {
                editDialog.value = false
            }
        } catch (error) {
            console.error(error);
        }
        loadingUpdate.value = false
    };

    const onCreateAgreement = async (form) => {
        loadingCreate.value = true
        if (!form && !selectedBusiness) return
        try {
            const res = await createAgreement(form, selectedBusiness.value.id);
            if (res) {
                agreementDialog.value = false
            }
        } catch (error) {
            console.error(error);
        }
        loadingCreate.value = false
    };

    return {
        links,
        selectedBusiness,
        businessData,
        agreements,
        editDialog,
        editBusinessDialog,
        loadingUpdate,
        loadingCreate,
        agreementDialog,
        editBusiness,
        openUpdateBusinessDialog,
        onUpdateBusiness,
        onUpdateBusinessData,
        openUpdateDialog,
        openAgreementDialog,
        onCreateAgreement,
    };
});
