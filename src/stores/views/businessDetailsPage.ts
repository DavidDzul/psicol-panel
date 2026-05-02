import { defineStore, storeToRefs } from "pinia";
import { useBusinessStore } from "@/stores/api/businessStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { Business, BusinessData, BusinessAgreement } from "@/interfaces/business";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useBusinessDetailsPageStore = defineStore(
  "businessDetailsPage",
  () => {
    const { setLoading } = useAppStore();
    const { userProfile, editBusiness } = storeToRefs(useAuthStore());

    const { resBusinessDetails, resBusinessData, resBusinessAgreements } =
      storeToRefs(useBusinessStore());
    const {
      getBusiness,
      getBusinessData,
      getBusinessAgreements,
      updateBusinessData,
      updateBusiness,
      createAgreement,
    } = useBusinessStore();

    const route = useRoute();
    const loadUser = ref<boolean>(false);
    const editDialog = ref<boolean>(false);
    const editBusinessDialog = ref<boolean>(false);
    const agreementDialog = ref<boolean>(false);

    const loadingCreate = ref<boolean>(false);
    const loadingUpdate = ref<boolean>(false);

    onBeforeMount(() => {
      validateAndFetchBusinessDetail();
    });

    watch(
      () => route.fullPath,
      () => validateAndFetchBusinessDetail(),
    );

    const validateAndFetchBusinessDetail = async (): Promise<void> => {
      if (!route.path.startsWith("/empresas/")) return;

      const id = parseInt(route.params.id as string, 10);
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

    const selectedBusiness = computed<Business | null>(
      () => resBusinessDetails.value,
    );
    const businessData = computed<BusinessData | null>(
      () => resBusinessData.value,
    );
    const agreements = computed<BusinessAgreement[]>(() => [
      ...resBusinessAgreements.value.values(),
    ]);

    const links = computed<LinkInterface[]>(() => [
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
    ]);

    const openUpdateDialog = (): void => {
      if (!selectedBusiness.value) return;
      editDialog.value = true;
    };

    const openUpdateBusinessDialog = (): void => {
      if (!businessData.value) return;
      editBusinessDialog.value = true;
    };

    const openAgreementDialog = (): void => {
      if (!selectedBusiness.value) return;
      agreementDialog.value = true;
    };

    const onUpdateBusinessData = async (form: unknown): Promise<void> => {
      loadingUpdate.value = true;
      if (!form && !businessData) return;
      try {
        const res = await updateBusinessData(form, businessData.value!.id);
        if (res) {
          editBusinessDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
      loadingUpdate.value = false;
    };

    const onUpdateBusiness = async (form: unknown): Promise<void> => {
      loadingUpdate.value = true;
      if (!form && !selectedBusiness) return;
      try {
        const res = await updateBusiness(form, selectedBusiness.value!.id);
        if (res) {
          editDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
      loadingUpdate.value = false;
    };

    const onCreateAgreement = async (form: unknown): Promise<void> => {
      loadingCreate.value = true;
      if (!form && !selectedBusiness) return;
      try {
        const res = await createAgreement(form, selectedBusiness.value!.id);
        if (res) {
          agreementDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
      loadingCreate.value = false;
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
  },
);
