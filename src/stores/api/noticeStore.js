import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useNoticeStore = defineStore("noticeStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const noticesMap = ref(new Map())

    const fetchNotices = async (form) => {
        try {
            const res = await axios.get("api/admin/notices", {
                params: form,
                headers: { 'accept': 'application/json' }
            });
            noticesMap.value = new Map(res.data.data.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const createNotice = async (form) => {
        try {
            const param = await axios.post("api/admin/notices", form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                noticesMap.value.set(param.data.data.id, param.data.data)
                return param.data
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

    const updateNotice = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/notices/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                noticesMap.value.set(param.data.data.id, param.data.data)
                return param.data
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al actualizar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    }

    const deleteNotice = async (id) => {
        try {
            const param = await axios.delete(`api/admin/notices/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información eliminada exitosamente.",
                    status: "success",
                });
                noticesMap.value.delete(id)
                return param.data
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al eliminar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    }

    return {
        noticesMap,
        fetchNotices,
        createNotice,
        updateNotice,
        deleteNotice
    };
});