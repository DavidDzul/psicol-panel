import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useJobApplicationsStore = defineStore("jobApplicationsStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resApplications = ref(new Map())

    const fetchApplications = async () => {
        try {
            const res = await axios.get("api/admin/applications", {
                headers: { 'accept': 'application/json' }
            });
            resApplications.value = new Map(res.data.applications.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const dowloandCV = async (userId) => {
        await axios
            .get(`api/fetchPDF/${userId}`, { responseType: 'blob', headers: { 'accept': 'application/json' } }) // Importante: usa responseType 'blob'
            .then((response) => {
                const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                window.open(fileURL);
            })
            .catch((error) => {
                console.error('Error generando el PDF:', error);
            });
    }

    const updateStatusApplications = async (id, form) => {
        try {
            const param = await axios.patch(`api/admin/applications/${id}`, form, {
                headers: { "Accept": "application/json" }
            });

            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resApplications.value.set(param.data.application.id, param.data.application);
                return param.data;
            }
        } catch (error) {
            console.error("Error al actualizar el estado de la postulación:", error);

            showAlert({
                title: error.response?.data?.msg || "Error al actualizar la postulación.",
                status: "error",
            });

            throw error;
        }
    };

    return {
        resApplications,
        dowloandCV,
        fetchApplications,
        updateStatusApplications
    };
});