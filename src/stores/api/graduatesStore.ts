import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useUserStore } from "@/stores/api/usersStore";
import type { Graduate } from "@/interfaces/graduate";
import type {
  GraduatesResponse,
  GraduateResponse,
} from "@/interfaces/api";

export const useGraduateStore = defineStore("graduateStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resGraduates = ref<Map<number, Graduate>>(new Map());
  const resGraduateDetails = ref<Graduate | null>(null);

  const fetchGraduates = async (): Promise<GraduatesResponse | undefined> => {
    try {
      const res = await axios.get<GraduatesResponse>("api/admin/graduates", {
        headers: { accept: "application/json" },
      });
      resGraduates.value = new Map(res.data.graduates.map((m) => [m.id, m]));
      return res.data;
    } catch (error: any) {
      console.error("Error en usuarios:", error);
    }
  };

  const showGraduate = async (
    id: number,
  ): Promise<GraduateResponse | undefined> => {
    try {
      const res = await axios.get<GraduateResponse>(
        `api/admin/graduates/${id}`,
        {
          headers: { accept: "application/json" },
        },
      );
      resGraduateDetails.value = res.data.user;
      return res.data;
    } catch (error: any) {
      console.error("Error al obtener al usuario:", error);
    }
  };

  const createGraduate = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post("api/admin/graduates", form, {
        headers: { accept: "application/json" },
      });

      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });

        resGraduates.value.set(
          param.data.createGraduate.id,
          param.data.createGraduate,
        );
        return param.data.res;
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join("\n");
          showAlert({
            title: errorMessages,
            status: "error",
          });
        } else {
          showAlert({
            title: errorData.message || "Ocurrió un error inesperado.",
            status: "error",
          });
        }
      } else {
        showAlert({
          title: "Error de red, intenta más tarde.",
          status: "error",
        });
      }
      throw error;
    }
  };

  const updateGraduate = async (form: unknown, id: number): Promise<unknown> => {
    try {
      const response = await axios.patch(`api/admin/graduates/${id}`, form, {
        headers: { accept: "application/json" },
      });

      const updatedGraduate = response?.data?.updateGraduate;
      if (!updatedGraduate) throw new Error("Respuesta inválida");

      const userStore = useUserStore();
      const graduateId = updatedGraduate.id;
      const userType = updatedGraduate.user_type;

      showAlert({ title: "Actualizado con éxito", status: "success" });

      if (userType === "BEC_ACTIVE") {
        const newUsersMap = new Map(userStore.resUsers);
        newUsersMap.set(graduateId, updatedGraduate);
        userStore.resUsers = newUsersMap;

        const newGradsMap = new Map(resGraduates.value);
        newGradsMap.delete(graduateId);
        resGraduates.value = newGradsMap;
      } else {
        const newGradsMap = new Map(resGraduates.value);
        newGradsMap.set(graduateId, updatedGraduate);
        resGraduates.value = newGradsMap;
      }

      if (resGraduateDetails.value?.id === id) {
        resGraduateDetails.value = updatedGraduate;
      }

      return response.data.res;
    } catch (error: any) {
      console.error("Error en updateGraduate:", error);
      showAlert({ title: "Error al actualizar", status: "error" });
      throw error;
    }
  };

  return {
    resGraduates,
    resGraduateDetails,
    showGraduate,
    createGraduate,
    fetchGraduates,
    updateGraduate,
  };
});
