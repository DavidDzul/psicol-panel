import { defineStore, storeToRefs } from "pinia";
import { useBusinessStore } from "@/stores/api/businessStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router"

export const useBusinessDetailsPageStore = defineStore("businessDetailsPage", () => {
    const { setLoading } = useAppStore();
    const { userProfile } = storeToRefs(useAuthStore());

    const { resBusinessDetails, resBusinessData, resBusinessAgreements } = storeToRefs(useBusinessStore());
    const { getBusiness, getBusinessData, getBusinessAgreements } = useBusinessStore();

    const route = useRoute();
    const loadUser = ref(false);

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

    return {
        links,
        selectedBusiness,
        businessData,
        agreements,
    };
});
