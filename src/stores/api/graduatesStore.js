import axios from "@/axiosConfig";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"
import { useUserStore } from "@/stores/api/usersStore";

export const useGraduateStore = defineStore("graduateStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const { resUsers } = storeToRefs(useUserStore())

    const resGraduates = ref(new Map())
    const resGraduateDetails = ref(null)

    const fetchGraduates = async () => {
        try {
            const res = await axios.get("api/admin/graduates", {
                headers: { 'accept': 'application/json' }
            });
            resGraduates.value = new Map(res.data.graduates.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error en usuarios:", error);
        }
    };

    const showGraduate = async (id) => {
        try {
            const res = await axios.get(`api/admin/graduates/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            resGraduateDetails.value = res.data.user;
            return res.data
        } catch (error) {
            console.error("Error al obtener al usuario:", error);
        }
    };

    const createGraduate = async (form) => {
        try {
            const param = await axios.post("api/admin/graduates", form, {
                headers: { 'accept': 'application/json' }
            });

            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                resGraduates.value.set(param.data.createGraduate.id, param.data.createGraduate);
                return param.data.res;
            }
        } catch (error) {
            if (error.response) {
                const errorData = error.response.data;
                if (errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join("\n");
                    showAlert({
                        title: errorMessages,
                        status: "error",
                    });
                } else {
                    showAlert({
                        title: errorData.message || "Ocurrió un error inesperado.",
                        status: "error",
                    });
                }
            } else {
                showAlert({
                    title: "Error de red, intenta más tarde.",
                    status: "error",
                });
            }
            throw error;
        }
    };

    const updateGraduate = async (form, id) => {
        try {
            const response = await axios.patch(`api/admin/graduates/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });

            const updatedGraduate = response?.data?.updateGraduate;
            if (!updatedGraduate) {
                throw new Error("Respuesta inválida del servidor.");
            }

            showAlert({
                title: "Información actualizada exitosamente.",
                status: "success",
            });

            const { id: graduateId, user_type } = updatedGraduate;

            if (user_type === "BEC_ACTIVE") {
                resUsers.value.set(graduateId, updatedGraduate);
                resGraduates.value.delete(graduateId);
            } else {
                resGraduates.value.set(graduateId, updatedGraduate);
            }

            if (resGraduateDetails.value?.id === id) {
                resGraduateDetails.value = updatedGraduate;
            }

            return response.data.res;
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                "Error de red, intenta más tarde.";

            showAlert({
                title: errorMessage,
                status: "error",
            });

            throw error;
        }
    };


    return {
        resGraduates,
        resGraduateDetails,
        showGraduate,
        createGraduate,
        fetchGraduates,
        updateGraduate,
    };
});