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

    const updateVacantLaboral = async (id, form) => {
        try {
            const param = await axios.put(`api/admin/vacantPositions/${id}/updateVacant`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resPositions.value.set(param.data.updateVacant.id, param.data.updateVacant)
                resVacantDetails.value = param.data.updateVacant;
                return param.data.res;
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al actualizar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    };

    const updateVacantPractice = async (id, form) => {
        try {
            const param = await axios.put(`api/admin/vacantPositions/${id}/updatePractice`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resPositions.value.set(param.data.updatePractice.id, param.data.updatePractice)
                resVacantDetails.value = param.data.updatePractice;
                return param.data.res;
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al actualizar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    };

    const updateVacantJr = async (id, form) => {
        try {
            const param = await axios.put(`api/admin/vacantPositions/${id}/updateVacantJr`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resPositions.value.set(param.data.updateVacantJr.id, param.data.updateVacantJr)
                resVacantDetails.value = param.data.updateVacantJr;
                return param.data.res;
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al actualizar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    };

    const statusVacant = async (id, form) => {
        try {
            const param = await axios.put(`api/admin/vacantPositions/${id}/status`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Estatus actualizado exitosamente.",
                    status: "success",
                });
                resPositions.value.set(param.data.vacant.id, param.data.vacant);
                if (resVacantDetails.value && resVacantDetails.value.id === id) {
                    resVacantDetails.value = param.data.vacant;
                }
                return param.data.res;
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al actualizar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    };

    const resetVacant = async (id) => {
        try {
            const param = await axios.put(`api/admin/vacantPositions/${id}/reset`, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Estatus actualizado exitosamente.",
                    status: "success",
                });
                resPositions.value.set(param.data.vacant.id, param.data.vacant);
                if (resVacantDetails.value && resVacantDetails.value.id === id) {
                    resVacantDetails.value = param.data.vacant;
                }
                return param.data.res;
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al actualizar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    };

    const createVacantLaboral = async (id, form) => {
        try {
            const param = await axios.post(`api/admin/vacantPositions/${id}/storeVacant`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Vacante guardada exitosamente.",
                    status: "success",
                });

                resPositions.value.set(param.data.createVacant.id, param.data.createVacant)
                return param.data.res;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Error al guardar la información, intente nuevamente.";
            showAlert({
                title: errorMessage,
                status: "error",
            });
            throw error;
        }
    };

    const createVacantJunior = async (id, form) => {
        try {
            const param = await axios.post(`api/admin/vacantPositions/${id}/storeVacantJr`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Vacante guardada exitosamente.",
                    status: "success",
                });

                resPositions.value.set(param.data.createVacantJr.id, param.data.createVacantJr)
                return param.data.res;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Error al guardar la información, intente nuevamente.";
            showAlert({
                title: errorMessage,
                status: "error",
            });
            throw error;
        }
    };

    const createVacantPractice = async (id, form) => {
        try {
            const param = await axios.post(`api/admin/vacantPositions/${id}/storePractice`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Vacante guardada exitosamente.",
                    status: "success",
                });

                resPositions.value.set(param.data.createPractice.id, param.data.createPractice)
                return param.data.res;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Error al guardar la información, intente nuevamente.";
            showAlert({
                title: errorMessage,
                status: "error",
            });
            throw error;
        }
    };

    return {
        resPositions,
        resVacantDetails,
        showVacant,
        fetchVacantPositions,
        updateVacantLaboral,
        updateVacantPractice,
        updateVacantJr,
        statusVacant,
        resetVacant,
        createVacantLaboral,
        createVacantJunior,
        createVacantPractice
    };
});