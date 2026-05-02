import { defineStore, storeToRefs } from "pinia";
import { useBusinessStore } from "@/stores/api/businessStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { Business } from "@/interfaces/business";
import type { LinkInterface } from "@/interfaces/link.interface";

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
  const createDialog = ref<boolean>(false);
  const updateDialog = ref<boolean>(false);
  const editUser = ref<Business | undefined>(undefined);

  const loadingCreate = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);
  const loadingTable = ref<boolean>(false);

  onBeforeMount(async () => {
    loadingTable.value = true;
    await fetchBusiness();
    loadingTable.value = false;
  });

  const links = computed<LinkInterface[]>(() => [
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

  const business = computed<Business[]>(() => [...resBusiness.value.values()]);

  const openCreateDialog = (): void => {
    createDialog.value = true;
  };

  const openBusinessDetail = (id: number): void => {
    router.push("empresas/" + id);
  };

  const onSaveBusiness = async (form: unknown): Promise<void> => {
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

  return {
    links,
    business,
    createDialog,
    loadingCreate,
    filteredCampus,
    readBusiness,
    createBusinessPermission,
    editBusiness,
    loadingTable,
    openBusinessDetail,
    openCreateDialog,
    onSaveBusiness,
  };
});
