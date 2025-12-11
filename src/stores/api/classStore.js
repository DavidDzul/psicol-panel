import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useClassStore = defineStore("classStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const classMap = ref(new Map())
    const attendanceMap = ref(new Map())
    const classDetail = ref(null)
    const usersByFilters = ref(new Map())

    const fetchClasses = async (form) => {
        try {
            const res = await axios.get("api/admin/class", {
                params: form,
                headers: { 'accept': 'application/json' }
            });
            classMap.value = new Map(res.data.data.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchClassDetais = async (id) => {
        try {
            const res = await axios.get(`api/admin/class/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            classDetail.value = res.data.data
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchAttendancesByClass = async (id) => {
        try {
            const res = await axios.get(`api/admin/class/${id}/attendances`, {
                headers: { 'accept': 'application/json' }
            });
            attendanceMap.value = new Map(res.data.data.map((m) => [m.id, m]))
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

    const fetchUsersByFilters = async (form) => {
        try {
            const res = await axios.get(`api/admin/filterUsers`, {
                params: form,
                headers: { 'accept': 'application/json' }
            });
            usersByFilters.value = res.data.data
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const assignUsers = async (form) => {
        try {
            const param = await axios.post("api/admin/attendance", form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información guardada exitosamente.",
                    status: "success",
                });

                // param.data.data es un array de attendance
                const updatedMap = new Map(param.data.data.map(m => [m.id, m]));
                attendanceMap.value = updatedMap;

                return param.data;
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

    const updateAttendance = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/attendance/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                attendanceMap.value.set(param.data.data.id, param.data.data)
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

    const deleteAttendance = async (id) => {
        try {
            const param = await axios.delete(`api/admin/attendance/${id}`, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información eliminada exitosamente.",
                    status: "success",
                });
                attendanceMap.value.delete(id)
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

    const generateReportPDF = async (id) => {
        try {
            const res = await axios.get(`api/admin/class/${id}/pdf`, {
                responseType: "blob",
                headers: { Accept: "application/pdf" },
            });

            const fileURL = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));

            window.open(fileURL, "_blank");
        } catch (error) {
            console.error("Error al generar el reporte:", error);
        }
    };

    const generateReportSheet = async (id) => {
        try {
            const res = await axios.get(`/api/admin/class/${id}/sheet`, {
                responseType: "blob",
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                },
            });

            // Crear URL temporal para descarga
            const fileURL = window.URL.createObjectURL(
                new Blob([res.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                })
            );

            // Crear link temporal y hacer click
            const link = document.createElement("a");
            link.href = fileURL;
            link.setAttribute("download", `Asistencias_Clase_${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error al descargar el Excel:", error);
        }
    };

    const reportByPeriod = async (form) => {
        try {
            const res = await axios.post(`api/admin/class/report`, form, {
                responseType: "blob",
                headers: { Accept: "application/pdf" },
            });

            const fileURL = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));

            window.open(fileURL, "_blank");
        } catch (error) {
            showAlert({
                title: "No se encontraron datos para este reporte, intente nuevamente.",
                status: "error",
            });
            console.error("Error al generar el reporte:", error);
        }
    };


    return {
        classMap,
        classDetail,
        attendanceMap,
        usersByFilters,
        assignUsers,
        fetchClasses,
        createClass,
        updateClass,
        deleteClass,
        fetchClassDetais,
        fetchUsersByFilters,
        fetchAttendancesByClass,
        updateAttendance,
        deleteAttendance,
        generateReportPDF,
        generateReportSheet,
        reportByPeriod
    };
});