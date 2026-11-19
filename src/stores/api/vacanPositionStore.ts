import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { apiErrorMessage } from "@/utils/apiErrorMessage";
import type {
  VacantDisabledPayload,
  VacantForm,
  VacantJrForm,
  VacantPracticeForm,
  VacantPosition,
  VacantPositionDetail,
} from "@/interfaces/vacant";
import type {
  VacantPositionsResponse,
  ShowVacantResponse,
  UpdateVacantResponse,
  UpdatePracticeResponse,
  UpdateVacantJrResponse,
  StatusVacantResponse,
  CreateVacantResponse,
  CreateVacantJrResponse,
  CreatePracticeResponse,
} from "@/interfaces/api";

const SAVE_ERROR_FALLBACK =
  "Error al guardar la información, intente nuevamente.";

// The API may serialize ids as strings; the panel compares them strictly.
const normalizeRow = (row: VacantPosition): VacantPosition => ({
  ...row,
  user_id: Number(row.user_id),
  business: row.business
    ? { ...row.business, user_id: Number(row.business.user_id) }
    : null,
});

const normalizeDetail = (
  detail: VacantPositionDetail,
): VacantPositionDetail => ({
  ...detail,
  user_id: Number(detail.user_id),
  ...(detail.business
    ? {
        business: {
          ...detail.business,
          user_id: Number(detail.business.user_id),
        },
      }
    : {}),
});

// Update/create responses may omit the business, the index row allows null.
const toRow = (detail: VacantPositionDetail): VacantPosition => ({
  ...detail,
  business: detail.business ?? null,
});

export const useVacantPositionStore = defineStore("vacantPositionStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resPositions = ref<Map<number, VacantPosition>>(new Map());
  const resVacantDetails = ref<VacantPositionDetail | null>(null);

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
      const positions = res.data.positions.map(normalizeRow);
      resPositions.value = new Map(positions.map((m) => [m.id, m]));
      return res.data;
    } catch (error: unknown) {
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
      const vacant = normalizeDetail(res.data.vacant);
      resVacantDetails.value = vacant;
      return { ...res.data, vacant };
    } catch (error: unknown) {
      console.error("Error al obtener la vacante:", error);
    }
  };

  const updateVacantLaboral = async (
    id: number,
    form: VacantForm,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.put<UpdateVacantResponse>(
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

        const detail = normalizeDetail(param.data.updateVacant);
        resPositions.value.set(detail.id, toRow(detail));
        resVacantDetails.value = detail;
        return param.data.res;
      }
    } catch (error: unknown) {
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
    form: VacantPracticeForm,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.put<UpdatePracticeResponse>(
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

        const detail = normalizeDetail(param.data.updatePractice);
        resPositions.value.set(detail.id, toRow(detail));
        resVacantDetails.value = detail;
        return param.data.res;
      }
    } catch (error: unknown) {
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
    form: VacantJrForm,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.put<UpdateVacantJrResponse>(
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

        const detail = normalizeDetail(param.data.updateVacantJr);
        resPositions.value.set(detail.id, toRow(detail));
        resVacantDetails.value = detail;
        return param.data.res;
      }
    } catch (error: unknown) {
      console.error(error);
      showAlert({
        title: "Error al actualizar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const statusVacant = async (
    id: number,
    form: VacantDisabledPayload,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.put<StatusVacantResponse>(
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
        const detail = normalizeDetail(param.data.vacant);
        resPositions.value.set(detail.id, toRow(detail));
        if (resVacantDetails.value && resVacantDetails.value.id === id) {
          resVacantDetails.value = detail;
        }
        return param.data.res;
      }
    } catch (error: unknown) {
      console.error(error);
      showAlert({
        title: "Error al actualizar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const resetVacant = async (id: number): Promise<boolean | undefined> => {
    try {
      const param = await axios.put<StatusVacantResponse>(
        `api/admin/vacantPositions/${id}/reset`,
        null,
        { headers: { accept: "application/json" } },
      );
      if (param) {
        showAlert({
          title: "Estatus actualizado exitosamente.",
          status: "success",
        });
        const detail = normalizeDetail(param.data.vacant);
        resPositions.value.set(detail.id, toRow(detail));
        if (resVacantDetails.value && resVacantDetails.value.id === id) {
          resVacantDetails.value = detail;
        }
        return param.data.res;
      }
    } catch (error: unknown) {
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
    form: VacantForm,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.post<CreateVacantResponse>(
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

        const detail = normalizeDetail(param.data.createVacant);
        resPositions.value.set(detail.id, toRow(detail));
        return param.data.res;
      }
    } catch (error: unknown) {
      showAlert({
        title: apiErrorMessage(error, SAVE_ERROR_FALLBACK),
        status: "error",
      });
      throw error;
    }
  };

  const createVacantJunior = async (
    id: number,
    form: VacantJrForm,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.post<CreateVacantJrResponse>(
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

        const detail = normalizeDetail(param.data.createVacantJr);
        resPositions.value.set(detail.id, toRow(detail));
        return param.data.res;
      }
    } catch (error: unknown) {
      showAlert({
        title: apiErrorMessage(error, SAVE_ERROR_FALLBACK),
        status: "error",
      });
      throw error;
    }
  };

  const createVacantPractice = async (
    id: number,
    form: VacantPracticeForm,
  ): Promise<boolean | undefined> => {
    try {
      const param = await axios.post<CreatePracticeResponse>(
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

        const detail = normalizeDetail(param.data.createPractice);
        resPositions.value.set(detail.id, toRow(detail));
        return param.data.res;
      }
    } catch (error: unknown) {
      showAlert({
        title: apiErrorMessage(error, SAVE_ERROR_FALLBACK),
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
