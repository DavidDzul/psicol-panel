import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert"

export const useRolesStore = defineStore("rolesStore", () => {
    const router = useRouter();
    const { showAlert } = useAlertStore()
    const resRoles = ref(new Map())

    const fetchRoles = async () => {
        try {
            const res = await axios.get("api/admin/roles", {
                headers: { 'accept': 'application/json' }
            });
            resRoles.value = new Map(res.data.roles.map((m) => [m.id, m]))
            return res.data
        } catch (error) {
            console.error("Error:", error);
        }
    };


    return {
        resRoles,
        fetchRoles,
    };
});