import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useClassStore = defineStore("classStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const classMap = ref(new Map())

    const fetchClasses = async () => {
        try {
            const res = await axios.get("api/admin/class", {
                headers: { 'accept': 'application/json' }
            });
            classMap.value = new Map(res.data.data.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const createClass = async (form) => {
        try {
            const param = await axios.post("api/admin/class", form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                classMap.value.set(param.data.data.id, param.data.data)
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

    const updateClass = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/class/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                classMap.value.set(param.data.data.id, param.data.data)
                return param.data.res
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

    const deleteClass = async (id) => {
        try {
            const param = await axios.delete(`api/admin/class/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información eliminada exitosamente.",
                    status: "success",
                });
                classMap.value.delete(id)
                return param.data.res
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
        classMap,
        fetchClasses,
        createClass,
        updateClass,
        deleteClass
    };
});