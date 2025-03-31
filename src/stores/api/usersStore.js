import axios from "@/axiosConfig";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"
import { useGraduateStore } from "@/stores/api/graduatesStore";

export const useUserStore = defineStore("userStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const { resGraduates } = storeToRefs(useGraduateStore())

    const resUsers = ref(new Map())
    const resUserDetails = ref(null)

    const fetchUsers = async () => {
        try {
            const res = await axios.get("api/admin/users", {
                headers: { 'accept': 'application/json' }
            });
            resUsers.value = new Map(res.data.users.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error en usuarios:", error);
        }
    };

    const showUser = async (id) => {
        try {
            const res = await axios.get(`api/admin/users/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            resUserDetails.value = res.data.user;
            return res.data
        } catch (error) {
            console.error("Error al obtener al usuario:", error);
        }
    };

    const createUser = async (form) => {
        try {
            const param = await axios.post("api/admin/users", form, {
                headers: { 'accept': 'application/json' }
            });

            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                resUsers.value.set(param.data.createUser.id, param.data.createUser);
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

    const updateUser = async (form, id) => {
        try {
            const response = await axios.patch(`api/admin/users/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });

            const updatedUser = response?.data?.updateUser;
            if (!updatedUser) {
                throw new Error("Respuesta inválida del servidor.");
            }

            showAlert({
                title: "Información actualizada exitosamente.",
                status: "success",
            });

            const { id: userId, user_type } = updatedUser;

            if (user_type === "BEC_INACTIVE") {
                resGraduates.value.set(userId, updatedUser);
                resUsers.value.delete(userId);
            } else {
                resUsers.value.set(userId, updatedUser);
            }

            if (resUserDetails.value?.id === id) {
                resUserDetails.value = updatedUser;
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
        resUsers,
        resUserDetails,
        showUser,
        createUser,
        fetchUsers,
        updateUser,
    };
});