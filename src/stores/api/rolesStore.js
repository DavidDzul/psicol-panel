import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useRolesStore = defineStore("rolesStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resRoles = ref(new Map())
    const resRolesAdmin = ref(new Map())
    const resPermissions = ref(new Map())

    const fetchRoles = async () => {
        try {
            const res = await axios.get("api/admin/roles", {
                params: { type: 'USER' },
                headers: { 'accept': 'application/json' }
            });
            resRoles.value = new Map(res.data.roles.map((m) => [m.id, m]));
            return res.data;
        } catch (error) {
            console.error("Error al obtener roles:", error);
        }
    };

    const fetchAdminRoles = async () => {
        try {
            const res = await axios.get("api/admin/roles", {
                params: { type: 'ADMIN' },
                headers: { 'accept': 'application/json' }
            });
            resRolesAdmin.value = new Map(res.data.roles.map((m) => [m.id, m]));
            return res.data;
        } catch (error) {
            console.error("Error al obtener roles:", error);
        }
    };


    const fetchPermissions = async () => {
        try {
            const res = await axios.get("api/admin/roles/permissions", {
                headers: { 'accept': 'application/json' }
            });
            resPermissions.value = new Map(res.data.permissions.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const updateRole = async (form, id) => {
        try {
            const param = await axios.put(`api/admin/roles/${id}`, form, {
                headers: { 'accept': 'application/json' }
            });
            if (param) {
                showAlert({
                    title: "Información actualizada exitosamente.",
                    status: "success",
                });

                resRoles.value.set(param.data.data.id, param.data.data)
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

    return {
        resRoles,
        resRolesAdmin,
        resPermissions,
        fetchRoles,
        fetchAdminRoles,
        fetchPermissions,
        updateRole
    };
});