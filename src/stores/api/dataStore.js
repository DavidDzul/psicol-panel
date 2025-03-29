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

    const createArea = async (form) => {
        try {
            const param = await axios.post("api/admin/areas", form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                resAreas.value.set(param.data.createArea.id, param.data.createArea)
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

    const updateArea = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/areas/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resAreas.value.set(param.data.updateArea.id, param.data.updateArea)
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

    const deleteArea = async (id) => {
        try {
            const param = await axios.delete(`api/admin/areas/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información eliminada exitosamente.",
                    status: "success",
                });
                resAreas.value.delete(id)
                resCandidates.value = new Map(
                    [...resCandidates.value].filter(([_, candidate]) => candidate.area_id !== id)
                );
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

    const createCandidateData = async (form) => {
        try {
            const param = await axios.post("api/admin/candidateData", form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                resCandidates.value.set(param.data.createData.id, param.data.createData)
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

    const updateCandidateData = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/candidateData/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resCandidates.value.set(param.data.updateData.id, param.data.updateData)
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

    const deleteCandidateData = async (id) => {
        try {
            const param = await axios.delete(`api/admin/candidateData/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información eliminada exitosamente.",
                    status: "success",
                });
                resCandidates.value.delete(id)

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
        resAreas,
        resCandidates,
        fetchAreas,
        fetchCandidates,
        createArea,
        updateArea,
        deleteArea,
        createCandidateData,
        updateCandidateData,
        deleteCandidateData
    };
});