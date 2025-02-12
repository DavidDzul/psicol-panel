import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useGenerationsStore = defineStore("generationsStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resGenerations = ref(new Map())

    const fetchGenerations = async () => {
        try {
            const res = await axios.get("api/admin/generations", {
                headers: { 'accept': 'application/json' }
            });
            resGenerations.value = new Map(res.data.generations.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error en vacantes:", error);
        }
    };

    return {
        resGenerations,
        fetchGenerations,
    };
});