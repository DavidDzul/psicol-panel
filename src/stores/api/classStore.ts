import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { User } from "@/interfaces/user";
import type { ClassEntity, ClassAttendance } from "@/interfaces/class";
import type {
  ClassListResponse,
  ClassDetailResponse,
  ClassAttendancesResponse,
  FilterUsersResponse,
  ClassOperationResponse,
  AttendancesOperationResponse,
  AttendanceOperationResponse,
} from "@/interfaces/api";

export const useClassStore = defineStore("classStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const classMap = ref<Map<number, ClassEntity>>(new Map());
  const attendanceMap = ref<Map<number, ClassAttendance>>(new Map());
  const classDetail = ref<ClassEntity | null>(null);
  const usersByFilters = ref<User[] | null>(null);

  const fetchClasses = async (form: unknown): Promise<ClassListResponse | undefined> => {
    try {
      const res = await axios.get<ClassListResponse>("api/admin/class", {
        params: form,
        headers: { accept: "application/json" },
      });
      classMap.value = new Map(res.data.data.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const fetchClassDetais = async (
    id: number,
  ): Promise<ClassDetailResponse | undefined> => {
    try {
      const res = await axios.get<ClassDetailResponse>(
        `api/admin/class/${id}`,
        {
          headers: { accept: "application/json" },
        },
      );
      classDetail.value = res.data.data;
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const fetchAttendancesByClass = async (
    id: number,
  ): Promise<ClassAttendancesResponse | undefined> => {
    try {
      const res = await axios.get<ClassAttendancesResponse>(
        `api/admin/class/${id}/attendances`,
        {
          headers: { accept: "application/json" },
        },
      );
      attendanceMap.value = new Map(res.data.data.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const createClass = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post<ClassOperationResponse>(
        "api/admin/class",
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        classMap.value.set(param.data.data.id, param.data.data);
        return param.data;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al guardar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const updateClass = async (form: unknown, id: number): Promise<unknown> => {
    try {
      const param = await axios.put<ClassOperationResponse>(
        `api/admin/class/${id}`,
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        classMap.value.set(param.data.data.id, param.data.data);
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

  const deleteClass = async (id: number): Promise<unknown> => {
    try {
      const param = await axios.delete(`api/admin/class/${id}`, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información eliminada exitosamente.",
          status: "success",
        });
        classMap.value.delete(id);
        return param.data;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al eliminar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const fetchUsersByFilters = async (
    form: unknown,
  ): Promise<FilterUsersResponse | undefined> => {
    try {
      const res = await axios.get<FilterUsersResponse>(
        `api/admin/filterUsers`,
        {
          params: form,
          headers: { accept: "application/json" },
        },
      );
      usersByFilters.value = res.data.data;
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const assignUsers = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post<AttendancesOperationResponse>(
        "api/admin/attendance",
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        const updatedMap = new Map(param.data.data.map((m) => [m.id, m]));
        attendanceMap.value = updatedMap;

        return param.data;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al guardar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const updateAttendance = async (
    form: unknown,
    id: number,
  ): Promise<unknown> => {
    try {
      const param = await axios.put<AttendanceOperationResponse>(
        `api/admin/attendance/${id}`,
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        attendanceMap.value.set(param.data.data.id, param.data.data);
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

  const deleteAttendance = async (id: number): Promise<unknown> => {
    try {
      const param = await axios.delete(`api/admin/attendance/${id}`, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información eliminada exitosamente.",
          status: "success",
        });
        attendanceMap.value.delete(id);
        return param.data;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al eliminar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const generateReportPDF = async (id: number): Promise<void> => {
    try {
      const res = await axios.get(`api/admin/class/${id}/pdf`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });

      const fileURL = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      window.open(fileURL, "_blank");
    } catch (error: any) {
      console.error("Error al generar el reporte:", error);
    }
  };

  const generateReportSheet = async (id: number): Promise<void> => {
    try {
      const res = await axios.get(`/api/admin/class/${id}/sheet`, {
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      const fileURL = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );

      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `Asistencias_Clase_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error("Error al descargar el Excel:", error);
    }
  };

  const reportSemesterPDF = async (form: unknown): Promise<void> => {
    try {
      const res = await axios.post(`api/admin/class/reportPDF`, form, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });

      const fileURL = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      window.open(fileURL, "_blank");
    } catch (error: any) {
      showAlert({
        title:
          "No se encontraron datos para este reporte, intente nuevamente.",
        status: "error",
      });
      console.error("Error al generar el reporte:", error);
    }
  };

  const reportSemesterExcel = async (form: unknown): Promise<void> => {
    try {
      const res = await axios.post(`/api/admin/class/reportExcel`, form, {
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      const fileURL = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );

      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `Asistencias_Clase.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      showAlert({
        title:
          "No se pudo generar el reporte. Verifique que existan asistencias en el periodo seleccionado.",
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
    reportSemesterPDF,
    reportSemesterExcel,
  };
});
