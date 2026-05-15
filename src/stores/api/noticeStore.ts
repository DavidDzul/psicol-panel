import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { Notice } from "@/interfaces/notice";
import type { NoticesResponse } from "@/interfaces/api";

export const useNoticeStore = defineStore("noticeStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const noticesMap = ref<Map<number, Notice>>(new Map());

  const fetchNotices = async (form?: unknown): Promise<NoticesResponse | undefined> => {
    try {
      const res = await axios.get<NoticesResponse>("api/admin/notices", {
        params: form,
        headers: { accept: "application/json" },
      });
      noticesMap.value = new Map(res.data.data.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const createNotice = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post("api/admin/notices", form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        noticesMap.value.set(param.data.data.id, param.data.data);
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

  const updateNotice = async (form: unknown, id: number): Promise<unknown> => {
    try {
      const param = await axios.put(`api/admin/notices/${id}`, form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        noticesMap.value.set(param.data.data.id, param.data.data);
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

  const deleteNotice = async (id: number): Promise<unknown> => {
    try {
      const param = await axios.delete(`api/admin/notices/${id}`, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información eliminada exitosamente.",
          status: "success",
        });
        noticesMap.value.delete(id);
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

  return {
    noticesMap,
    fetchNotices,
    createNotice,
    updateNotice,
    deleteNotice,
  };
});
