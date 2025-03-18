import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useBusinessStore = defineStore("BusinessStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resBusiness = ref(new Map())
    const resBusinessDetails = ref(null)
    const resBusinessData = ref(null)
    const resBusinessAgreements = ref(new Map())

    const fetchBusiness = async () => {
        try {
            const res = await axios.get("api/admin/business", {
                headers: { 'accept': 'application/json' }
            });
            resBusiness.value = new Map(res.data.business.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error en usuarios:", error);
        }
    };

    const getBusiness = async (id) => {
        try {
            const res = await axios.get(`api/admin/business/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            resBusinessDetails.value = res.data.business;
            return res.data
        } catch (error) {
            console.error("Error al obtener al usuario:", error);
        }
    };

    const getBusinessData = async (id) => {
        try {
            const res = await axios.get(`api/admin/businessData/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            resBusinessData.value = res.data.data;
            return res.data
        } catch (error) {
            console.error("Error al obtener al usuario:", error);
        }
    };

    const getBusinessAgreements = async (id) => {
        try {
            const res = await axios.get(`api/admin/businessAgreement/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            resBusinessAgreements.value = new Map(res.data.agreements.map((m) => [m.id, m]));
            return res.data
        } catch (error) {
            console.error("Error al obtener al usuario:", error);
        }
    };

    const createBusiness = async (form) => {
        try {
            const param = await axios.post("api/admin/business", form, {
                headers: { 'accept': 'application/json' }
            });

            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                resBusiness.value.set(param.data.createBusiness.id, param.data.createBusiness);
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

    const updateBusiness = async (form, id) => {
        try {
            const currentBusiness = resBusiness.value.get(id);
            const currentBusinessData = currentBusiness?.business_data || null;

            const param = await axios.put(`api/admin/business/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                const updatedBusiness = param.data.updateBusiness;

                if (!updatedBusiness.business_data) {
                    updatedBusiness.business_data = currentBusinessData;
                }

                resBusiness.value.set(updatedBusiness.id, updatedBusiness);
                resBusinessDetails.value = updatedBusiness
                return param.data.res;
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

    const updateBusinessData = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/businessData/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });

            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                const currentBusiness = resBusiness.value.get(id);

                if (currentBusiness) {
                    currentBusiness.business_data = param.data.updateData;
                    resBusiness.value.set(id, { ...currentBusiness });
                }

                resBusinessData.value = param.data.updateData
                return param.data.res;
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error al guardar la información, intente nuevamente.",
                status: "error",
            });
            throw error;
        }
    };


    const createAgreement = async (form, id) => {
        try {
            const param = await axios.post(`api/admin/business/${id}/agreement`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });
                resBusinessAgreements.value.set(param.data.agreement.id, param.data.agreement)
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
        resBusiness,
        fetchBusiness,
        getBusiness,
        getBusinessData,
        getBusinessAgreements,
        resBusinessDetails,
        resBusinessData,
        resBusinessAgreements,
        // showUser,
        createBusiness,
        updateBusiness,
        updateBusinessData,
        createAgreement,
        // updateUser,
    };
});