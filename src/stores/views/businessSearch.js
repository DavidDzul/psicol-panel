import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { ref, watch } from "vue";
import { useBusinessStore } from "@/stores/api/businessStore";

export const useBusinessSearchStore = defineStore("businessSearchPage", () => {
    const businessList = ref([]);
    const { searchBusiness } = useBusinessStore()

    const getBusiness = async (value) => {
        try {
            const res = await searchBusiness(value)
            if (res.data.businesses) {
                businessList.value = res.data.businesses
            }
        } catch (error) {
            console.log(error)
        }
    }

    return { getBusiness, businessList };
});