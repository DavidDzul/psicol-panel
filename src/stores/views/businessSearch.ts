import { defineStore } from "pinia";
import { ref } from "vue";
import { useBusinessStore } from "@/stores/api/businessStore";

import type { Business } from "@/interfaces/business";

export const useBusinessSearchStore = defineStore("businessSearchPage", () => {
  const businessList = ref<Business[]>([]);
  const { searchBusiness } = useBusinessStore();

  const getBusiness = async (value: unknown): Promise<void> => {
    try {
      const res = await searchBusiness(value);
      if (res?.data?.businesses) {
        businessList.value = res.data.businesses;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { getBusiness, businessList };
});
