import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useCheckStore = defineStore("checkStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()

    const createCheckIn = async (code) => {
        const res = await axios.post("api/attendance/check-in", code, {
            headers: { accept: "application/json" },
        });
        return res.data;
    };


    return {
        createCheckIn,
    };
});