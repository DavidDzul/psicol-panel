import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAlertStore } from "@/stores/alert";
import { apiErrorMessage } from "@/utils/apiErrorMessage";
import type { StaffRole, StaffPermissionModule, CreateStaffRolePayload } from "@/interfaces/staff";
import type { StaffRolesResponse, StaffRoleResponse, StaffPermissionsResponse } from "@/interfaces/api";

const BASE = "api/admin/staff-roles";
const headers = { accept: "application/json" };

export const useStaffRolesStore = defineStore("staffRolesStore", () => {
  const { showAlert } = useAlertStore();

  const roles = ref<StaffRole[]>([]);
  const catalog = ref<StaffPermissionModule[]>([]);

  const replaceRole = (role: StaffRole): void => {
    roles.value = roles.value.some((r) => r.id === role.id)
      ? roles.value.map((r) => (r.id === role.id ? role : r))
      : [...roles.value, role];
  };

  const fail = (error: unknown): never => {
    console.error(error);
    showAlert({
      title: apiErrorMessage(error, "Error al guardar la información, intente nuevamente."),
      status: "error",
    });
    throw error;
  };

  // Both tabs of the administrators view load roles on mount: concurrent calls
  // share the in-flight request; a call after it settles fetches again.
  let rolesInFlight: Promise<boolean> | null = null;

  // Reads never throw: they return false so the page can show its own state.
  const requestRoles = async (): Promise<boolean> => {
    try {
      const res = await axios.get<StaffRolesResponse>(BASE, { headers });
      roles.value = res.data.roles;
      return true;
    } catch (error: unknown) {
      console.error("Error al obtener roles de administración:", error);
      return false;
    }
  };

  const fetchRoles = (): Promise<boolean> => {
    rolesInFlight ??= requestRoles().finally(() => {
      rolesInFlight = null;
    });
    return rolesInFlight;
  };

  const fetchCatalog = async (): Promise<boolean> => {
    try {
      const res = await axios.get<StaffPermissionsResponse>(`${BASE}/permissions`, { headers });
      catalog.value = res.data.modules;
      return true;
    } catch (error: unknown) {
      console.error("Error al obtener el catálogo de permisos:", error);
      return false;
    }
  };

  const createRole = async (payload: CreateStaffRolePayload): Promise<StaffRole> => {
    try {
      const res = await axios.post<StaffRoleResponse>(BASE, payload, { headers });
      replaceRole(res.data.role);
      return res.data.role;
    } catch (error: unknown) {
      return fail(error);
    }
  };

  const updateRolePermissions = async (id: number, permissionsIds: number[]): Promise<StaffRole> => {
    try {
      const res = await axios.put<StaffRoleResponse>(
        `${BASE}/${id}/permissions`,
        { permissions_ids: permissionsIds },
        { headers },
      );
      replaceRole(res.data.role);
      return res.data.role;
    } catch (error: unknown) {
      return fail(error);
    }
  };

  return { roles, catalog, fetchRoles, fetchCatalog, createRole, updateRolePermissions };
});
