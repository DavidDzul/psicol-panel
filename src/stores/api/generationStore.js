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

    const createGeneration = async (form) => {
        try {
            const param = await axios.post("api/admin/generations", form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                resGenerations.value.set(param.data.createGeneration.id, param.data.createGeneration)
                return param.data.res
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al guardar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    }

    return {
        resGenerations,
        fetchGenerations,
        createGeneration,
    };
});