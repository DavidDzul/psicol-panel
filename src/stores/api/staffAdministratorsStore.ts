import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAlertStore } from "@/stores/alert";
import { apiErrorMessage } from "@/utils/apiErrorMessage";
import type {
  StaffAdministrator,
  CreateStaffAdministratorPayload,
  ResetStaffPasswordPayload,
} from "@/interfaces/staff";
import type {
  StaffAdministratorsResponse,
  StaffAdministratorResponse,
  StaffMessageResponse,
} from "@/interfaces/api";

const BASE = "api/admin/staff-administrators";
const headers = { accept: "application/json" };

export const useStaffAdministratorsStore = defineStore("staffAdministratorsStore", () => {
  const { showAlert } = useAlertStore();

  // Passwords are only ever sent, never kept in state.
  const administrators = ref<StaffAdministrator[]>([]);

  const replaceAdministrator = (administrator: StaffAdministrator): void => {
    administrators.value = administrators.value.some((a) => a.id === administrator.id)
      ? administrators.value.map((a) => (a.id === administrator.id ? administrator : a))
      : [...administrators.value, administrator];
  };

  const fail = (error: unknown): never => {
    console.error(error);
    showAlert({
      title: apiErrorMessage(error, "Error al guardar la información, intente nuevamente."),
      status: "error",
    });
    throw error;
  };

  // Reads never throw: they return false / null on failure.
  const fetchAdministrators = async (): Promise<boolean> => {
    try {
      const res = await axios.get<StaffAdministratorsResponse>(BASE, { headers });
      administrators.value = res.data.administrators;
      return true;
    } catch (error: unknown) {
      console.error("Error al obtener administradores:", error);
      return false;
    }
  };

  const fetchAdministrator = async (id: number): Promise<StaffAdministrator | null> => {
    try {
      const res = await axios.get<StaffAdministratorResponse>(`${BASE}/${id}`, { headers });
      return res.data.administrator;
    } catch (error: unknown) {
      console.error("Error al obtener el administrador:", error);
      return null;
    }
  };

  const createAdministrator = async (
    payload: CreateStaffAdministratorPayload,
  ): Promise<StaffAdministrator> => {
    try {
      const res = await axios.post<StaffAdministratorResponse>(BASE, payload, { headers });
      replaceAdministrator(res.data.administrator);
      return res.data.administrator;
    } catch (error: unknown) {
      return fail(error);
    }
  };

  const updateRole = async (id: number, roleId: number): Promise<StaffAdministrator> => {
    try {
      const res = await axios.put<StaffAdministratorResponse>(
        `${BASE}/${id}/role`,
        { role_id: roleId },
        { headers },
      );
      replaceAdministrator(res.data.administrator);
      return res.data.administrator;
    } catch (error: unknown) {
      return fail(error);
    }
  };

  const setActive = async (id: number, active: boolean): Promise<StaffAdministrator> => {
    try {
      const res = await axios.patch<StaffAdministratorResponse>(
        `${BASE}/${id}/active`,
        { active },
        { headers },
      );
      replaceAdministrator(res.data.administrator);
      return res.data.administrator;
    } catch (error: unknown) {
      return fail(error);
    }
  };

  const resetPassword = async (id: number, payload: ResetStaffPasswordPayload): Promise<string> => {
    try {
      const res = await axios.put<StaffMessageResponse>(`${BASE}/${id}/password`, payload, { headers });
      return res.data.msg;
    } catch (error: unknown) {
      return fail(error);
    }
  };

  return {
    administrators,
    fetchAdministrators,
    fetchAdministrator,
    createAdministrator,
    updateRole,
    setActive,
    resetPassword,
  };
});
