import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { Role, Permission } from "@/interfaces/role";
import type { RolesResponse, PermissionsResponse } from "@/interfaces/api";

export const useRolesStore = defineStore("rolesStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resRoles = ref<Map<number, Role>>(new Map());
  const resRolesAdmin = ref<Map<number, Role>>(new Map());
  const resPermissions = ref<Map<number, Permission>>(new Map());

  const fetchRoles = async (): Promise<RolesResponse | undefined> => {
    try {
      const res = await axios.get<RolesResponse>("api/admin/roles", {
        params: { type: "USER" },
        headers: { accept: "application/json" },
      });
      resRoles.value = new Map(res.data.roles.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error al obtener roles:", error);
    }
  };

  const fetchAdminRoles = async (): Promise<RolesResponse | undefined> => {
    try {
      const res = await axios.get<RolesResponse>("api/admin/roles", {
        params: { type: "ADMIN" },
        headers: { accept: "application/json" },
      });
      resRolesAdmin.value = new Map(res.data.roles.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error al obtener roles:", error);
    }
  };

  const fetchPermissions = async (): Promise<PermissionsResponse | undefined> => {
    try {
      const res = await axios.get<PermissionsResponse>(
        "api/admin/roles/permissions",
        {
          headers: { accept: "application/json" },
        },
      );
      resPermissions.value = new Map(res.data.permissions.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const updateRole = async (form: unknown, id: number): Promise<unknown> => {
    try {
      const param = await axios.put(`api/admin/roles/${id}`, form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        resRoles.value.set(param.data.data.id, param.data.data);
        return param.data;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al actualizar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  return {
    resRoles,
    resRolesAdmin,
    resPermissions,
    fetchRoles,
    fetchAdminRoles,
    fetchPermissions,
    updateRole,
  };
});
