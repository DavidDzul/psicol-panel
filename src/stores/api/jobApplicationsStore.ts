import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type { JobApplication } from "@/interfaces/jobApplication";
import type { ApplicationsResponse } from "@/interfaces/api";

export const useJobApplicationsStore = defineStore(
  "jobApplicationsStore",
  () => {
    const router = useRouter();
    const { showAlert } = useAlertStore();

    const resApplications = ref<Map<number, JobApplication>>(new Map());

    const fetchApplications = async (): Promise<
      ApplicationsResponse | undefined
    > => {
      try {
        const res = await axios.get<ApplicationsResponse>(
          "api/admin/applications",
          {
            headers: { accept: "application/json" },
          },
        );
        resApplications.value = new Map(
          res.data.applications.map((m) => [m.id, m]),
        );
        return res.data;
      } catch (error: any) {
        console.error("Error:", error);
      }
    };

    const dowloandCV = async (userId: number): Promise<void> => {
      await axios
        .get(`api/fetchPDF/${userId}`, {
          responseType: "blob",
          headers: { accept: "application/json" },
        })
        .then((response) => {
          const fileURL = URL.createObjectURL(
            new Blob([response.data], { type: "application/pdf" }),
          );
          window.open(fileURL);
        })
        .catch((error: any) => {
          console.error("Error generando el PDF:", error);
        });
    };

    const updateStatusApplications = async (
      id: number,
      form: unknown,
    ): Promise<unknown> => {
      try {
        const param = await axios.patch(`api/admin/applications/${id}`, form, {
          headers: { Accept: "application/json" },
        });

        if (param) {
          showAlert({
            title: "Información actualizada exitosamente.",
            status: "success",
          });

          resApplications.value.set(
            param.data.application.id,
            param.data.application,
          );
          return param.data;
        }
      } catch (error: any) {
        console.error(
          "Error al actualizar el estado de la postulación:",
          error,
        );

        showAlert({
          title:
            error.response?.data?.msg ||
            "Error al actualizar la postulación.",
          status: "error",
        });

        throw error;
      }
    };

    return {
      resApplications,
      dowloandCV,
      fetchApplications,
      updateStatusApplications,
    };
  },
);
