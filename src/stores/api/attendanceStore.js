import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useAttendanceStore = defineStore("attendanceStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()

    const createCheckIn = async (code) => {
        try {
            const res = await axios.post("api/attendance/check-in", code, {
                headers: { 'accept': 'application/json' }
            });
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };


    return {
        createCheckIn,
    };
});