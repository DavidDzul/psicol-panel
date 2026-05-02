import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { Generation } from "@/interfaces/generation";
import type { GenerationsResponse } from "@/interfaces/api";

export const useGenerationsStore = defineStore("generationsStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resGenerations = ref<Map<number, Generation>>(new Map());

  const fetchGenerations = async (): Promise<
    GenerationsResponse | undefined
  > => {
    try {
      const res = await axios.get<GenerationsResponse>(
        "api/admin/generations",
        {
          headers: { accept: "application/json" },
        },
      );
      resGenerations.value = new Map(
        res.data.generations.map((m) => [m.id, m]),
      );
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const createGeneration = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post("api/admin/generations", form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        resGenerations.value.set(
          param.data.createGeneration.id,
          param.data.createGeneration,
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

  const updateGeneration = async (
    form: unknown,
    id: number,
  ): Promise<unknown> => {
    try {
      const param = await axios.put(`api/admin/generations/${id}`, form, {
        headers: { accept: "application/json" },
      });
      if (param) {
        showAlert({
          title: "Información actualizada exitosamente.",
          status: "success",
        });

        resGenerations.value.set(param.data.data.id, param.data.data);
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
    resGenerations,
    fetchGenerations,
    createGeneration,
    updateGeneration,
  };
});
