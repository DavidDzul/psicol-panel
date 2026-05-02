import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { Area, CandidateData } from "@/interfaces/data";
import type {
  AreasResponse,
  CandidatesResponse,
} from "@/interfaces/api";

export const useDataStore = defineStore("dataStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resAreas = ref<Map<number, Area>>(new Map());
  const resCandidates = ref<Map<number, CandidateData>>(new Map());

  const fetchAreas = async (): Promise<AreasResponse | undefined> => {
    try {
      const res = await axios.get<AreasResponse>("api/admin/areas", {
        headers: { accept: "application/json" },
      });
      resAreas.value = new Map(res.data.areas.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const fetchCandidates = async (): Promise<CandidatesResponse | undefined> => {
    try {
      const res = await axios.get<CandidatesResponse>(
        "api/admin/candidateData",
        {
          headers: { accept: "application/json" },
        },
      );
      resCandidates.value = new Map(res.data.candidates.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const createArea = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post("api/admin/areas", form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        resAreas.value.set(param.data.createArea.id, param.data.createArea);
        return param.data.res;
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

  const updateArea = async (form: unknown, id: number): Promise<unknown> => {
    try {
      const param = await axios.put(`api/admin/areas/${id}`, form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        resAreas.value.set(param.data.updateArea.id, param.data.updateArea);
        return param.data.res;
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

  const deleteArea = async (id: number): Promise<unknown> => {
    try {
      const param = await axios.delete(`api/admin/areas/${id}`, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información eliminada exitosamente.",
          status: "success",
        });
        resAreas.value.delete(id);
        resCandidates.value = new Map(
          [...resCandidates.value].filter(
            ([_, candidate]) => candidate.area_id !== id,
          ),
        );
        return param.data.res;
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

  const createCandidateData = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post("api/admin/candidateData", form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        resCandidates.value.set(
          param.data.createData.id,
          param.data.createData,
        );
        return param.data.res;
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

  const updateCandidateData = async (
    form: unknown,
    id: number,
  ): Promise<unknown> => {
    try {
      const param = await axios.put(`api/admin/candidateData/${id}`, form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        resCandidates.value.set(
          param.data.updateData.id,
          param.data.updateData,
        );
        return param.data.res;
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

  const deleteCandidateData = async (id: number): Promise<unknown> => {
    try {
      const param = await axios.delete(`api/admin/candidateData/${id}`, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información eliminada exitosamente.",
          status: "success",
        });
        resCandidates.value.delete(id);

        return param.data.res;
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
    resAreas,
    resCandidates,
    fetchAreas,
    fetchCandidates,
    createArea,
    updateArea,
    deleteArea,
    createCandidateData,
    updateCandidateData,
    deleteCandidateData,
  };
});
