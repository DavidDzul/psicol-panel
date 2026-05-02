import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { VacantPosition } from "@/interfaces/vacant";
import type {
  VacantPositionsResponse,
  ShowVacantResponse,
} from "@/interfaces/api";

export const useVacantPositionStore = defineStore("vacantPositionStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resPositions = ref<Map<number, VacantPosition>>(new Map());
  const resVacantDetails = ref<VacantPosition | null>(null);

  const fetchVacantPositions = async (): Promise<
    VacantPositionsResponse | undefined
  > => {
    try {
      const res = await axios.get<VacantPositionsResponse>(
        "api/admin/vacantPositions",
        {
          headers: { accept: "application/json" },
        },
      );
      resPositions.value = new Map(res.data.positions.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const showVacant = async (
    id: number,
  ): Promise<ShowVacantResponse | undefined> => {
    try {
      const res = await axios.get<ShowVacantResponse>(
        `api/admin/vacantPositions/${id}`,
        {
          headers: { accept: "application/json" },
        },
      );
      resVacantDetails.value = res.data.vacant;
      return res.data;
    } catch (error: any) {
      console.error("Error al obtener la vacante:", error);
    }
  };

  const updateVacantLaboral = async (
    id: number,
    form: unknown,
  ): Promise<unknown> => {
    try {
      const param = await axios.put(
        `api/admin/vacantPositions/${id}/updateVacant`,
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

        resPositions.value.set(
          param.data.updateVacant.id,
          param.data.updateVacant,
        );
        resVacantDetails.value = param.data.updateVacant;
        return param.data.res;
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

  const updateVacantPractice = async (
    id: number,
    form: unknown,
  ): Promise<unknown> => {
    try {
      const param = await axios.put(
        `api/admin/vacantPositions/${id}/updatePractice`,
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

        resPositions.value.set(
          param.data.updatePractice.id,
          param.data.updatePractice,
        );
        resVacantDetails.value = param.data.updatePractice;
        return param.data.res;
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

  const updateVacantJr = async (
    id: number,
    form: unknown,
  ): Promise<unknown> => {
    try {
      const param = await axios.put(
        `api/admin/vacantPositions/${id}/updateVacantJr`,
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

        resPositions.value.set(
          param.data.updateVacantJr.id,
          param.data.updateVacantJr,
        );
        resVacantDetails.value = param.data.updateVacantJr;
        return param.data.res;
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

  const statusVacant = async (id: number, form: unknown): Promise<unknown> => {
    try {
      const param = await axios.put(
        `api/admin/vacantPositions/${id}/status`,
        form,
        {
          headers: { accept: "application/json" },
        },
      );
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
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al actualizar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const resetVacant = async (id: number): Promise<unknown> => {
    try {
      const param = await axios.put(`api/admin/vacantPositions/${id}/reset`, {
        headers: { accept: "application/json" },
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
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al actualizar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const createVacantLaboral = async (
    id: number,
    form: unknown,
  ): Promise<unknown> => {
    try {
      const param = await axios.post(
        `api/admin/vacantPositions/${id}/storeVacant`,
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Vacante guardada exitosamente.",
          status: "success",
        });

        resPositions.value.set(
          param.data.createVacant.id,
          param.data.createVacant,
        );
        return param.data.res;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.msg ||
        "Error al guardar la información, intente nuevamente.";
      showAlert({
        title: errorMessage,
        status: "error",
      });
      throw error;
    }
  };

  const createVacantJunior = async (
    id: number,
    form: unknown,
  ): Promise<unknown> => {
    try {
      const param = await axios.post(
        `api/admin/vacantPositions/${id}/storeVacantJr`,
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Vacante guardada exitosamente.",
          status: "success",
        });

        resPositions.value.set(
          param.data.createVacantJr.id,
          param.data.createVacantJr,
        );
        return param.data.res;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.msg ||
        "Error al guardar la información, intente nuevamente.";
      showAlert({
        title: errorMessage,
        status: "error",
      });
      throw error;
    }
  };

  const createVacantPractice = async (
    id: number,
    form: unknown,
  ): Promise<unknown> => {
    try {
      const param = await axios.post(
        `api/admin/vacantPositions/${id}/storePractice`,
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Vacante guardada exitosamente.",
          status: "success",
        });

        resPositions.value.set(
          param.data.createPractice.id,
          param.data.createPractice,
        );
        return param.data.res;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.msg ||
        "Error al guardar la información, intente nuevamente.";
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
    createVacantPractice,
  };
});
