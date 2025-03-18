import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useVacantPositionStore = defineStore("vacantPositionStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resPositions = ref(new Map())
    const resVacantDetails = ref(null)

    const fetchVacantPositions = async () => {
        try {
            const res = await axios.get("api/admin/vacantPositions", {
                headers: { 'accept': 'application/json' }
            });
            resPositions.value = new Map(res.data.positions.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const showVacant = async (id) => {
        try {
            const res = await axios.get(`api/admin/vacantPositions/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            resVacantDetails.value = res.data.vacant;
            return res.data
        } catch (error) {
            console.error("Error al obtener la vacante:", error);
        }
    };

    return {
        resPositions,
        resVacantDetails,
        showVacant,
        fetchVacantPositions,
    };
});