import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useDataStore = defineStore("dataStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resAreas = ref(new Map())
    const resCandidates = ref(new Map())

    const fetchAreas = async () => {
        try {
            const res = await axios.get("api/admin/areas", {
                headers: { 'accept': 'application/json' }
            });
            resAreas.value = new Map(res.data.areas.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchCandidates = async () => {
        try {
            const res = await axios.get("api/admin/candidateData", {
                headers: { 'accept': 'application/json' }
            });
            resCandidates.value = new Map(res.data.candidates.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return {
        resAreas,
        resCandidates,
        fetchAreas,
        fetchCandidates,
    };
});