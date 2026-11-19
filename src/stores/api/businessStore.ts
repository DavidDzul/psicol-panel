import axios from "@/axiosConfig";
import { isAxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import type {
  Business,
  BusinessData,
  BusinessAgreement,
  BusinessCreateForm,
  BusinessUpdateForm,
  BusinessDataForm,
  AgreementForm,
} from "@/interfaces/business";
import type {
  BusinessListResponse,
  GetBusinessResponse,
  GetBusinessDataResponse,
  GetBusinessAgreementsResponse,
  BusinessSearchResponse,
  CreateBusinessResponse,
  UpdateBusinessResponse,
  UpdateBusinessDataResponse,
  CreateAgreementResponse,
} from "@/interfaces/api";

interface ApiErrorBody {
  errors?: Record<string, string[]>;
  message?: string;
}

// The API serializes user_id as a string in some payloads; normalize it at the
// boundary so strict comparisons against numeric ids work.
const normalizeBusinessData = (data: BusinessData): BusinessData => ({
  ...data,
  user_id: Number(data.user_id),
});

const normalizeBusiness = (business: Business): Business => ({
  ...business,
  business_data: business.business_data
    ? normalizeBusinessData(business.business_data)
    : null,
});

export const useBusinessStore = defineStore("BusinessStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();

  const resBusiness = ref<Map<number, Business>>(new Map());
  const resBusinessDetails = ref<Business | null>(null);
  const resBusinessData = ref<BusinessData | null>(null);
  const resBusinessAgreements = ref<Map<number, BusinessAgreement>>(new Map());

  const fetchBusiness = async (): Promise<BusinessListResponse | undefined> => {
    try {
      const res = await axios.get<BusinessListResponse>("api/admin/business", {
        headers: { accept: "application/json" },
      });
      resBusiness.value = new Map(
        res.data.business.map((m) => [m.id, normalizeBusiness(m)]),
      );
      return res.data;
    } catch (error: unknown) {
      console.error("Error en usuarios:", error);
    }
  };

  const getBusiness = async (
    id: number,
  ): Promise<GetBusinessResponse | undefined> => {
    try {
      const res = await axios.get<GetBusinessResponse>(
        `api/admin/business/${id}`,
        {
          headers: { accept: "application/json" },
        },
      );
      const business = normalizeBusiness(res.data.business);
      resBusinessDetails.value = business;
      return { ...res.data, business };
    } catch (error: unknown) {
      console.error("Error al obtener al usuario:", error);
    }
  };

  const getBusinessData = async (
    id: number,
  ): Promise<GetBusinessDataResponse | undefined> => {
    try {
      const res = await axios.get<GetBusinessDataResponse>(
        `api/admin/businessData/${id}`,
        {
          headers: { accept: "application/json" },
        },
      );
      const data = normalizeBusinessData(res.data.data);
      resBusinessData.value = data;
      return { ...res.data, data };
    } catch (error: unknown) {
      console.error("Error al obtener al usuario:", error);
    }
  };

  const getBusinessAgreements = async (
    id: number,
  ): Promise<GetBusinessAgreementsResponse | undefined> => {
    try {
      const res = await axios.get<GetBusinessAgreementsResponse>(
        `api/admin/businessAgreement/${id}`,
        {
          headers: { accept: "application/json" },
        },
      );
      resBusinessAgreements.value = new Map(
        res.data.agreements.map((m) => [m.id, m]),
      );
      return res.data;
    } catch (error: unknown) {
      console.error("Error al obtener al usuario:", error);
    }
  };

  const createBusiness = async (
    form: BusinessCreateForm,
  ): Promise<CreateBusinessResponse["res"] | undefined> => {
    try {
      const param = await axios.post<CreateBusinessResponse>(
        "api/admin/business",
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

        const created = normalizeBusiness(param.data.createBusiness);
        resBusiness.value.set(created.id, created);
        return param.data.res;
      }
    } catch (error: unknown) {
      if (isAxiosError<ApiErrorBody>(error) && error.response) {
        const errorData = error.response.data;
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join("\n");
          showAlert({
            title: errorMessages,
            status: "error",
          });
        } else {
          showAlert({
            title: errorData?.message || "Ocurrió un error inesperado.",
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

  const updateBusiness = async (
    form: BusinessUpdateForm,
    id: number,
  ): Promise<UpdateBusinessResponse["res"] | undefined> => {
    try {
      const currentBusiness = resBusiness.value.get(id);
      const currentBusinessData = currentBusiness?.business_data || null;

      const param = await axios.put<UpdateBusinessResponse>(
        `api/admin/business/${id}`,
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

        const updatedBusiness = normalizeBusiness({
          ...param.data.updateBusiness,
          business_data:
            param.data.updateBusiness.business_data ?? currentBusinessData,
        });

        resBusiness.value.set(updatedBusiness.id, updatedBusiness);
        resBusinessDetails.value = updatedBusiness;
        return param.data.res;
      }
    } catch (error: unknown) {
      console.error(error);
      showAlert({
        title: "Error al guardar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const updateBusinessData = async (
    form: BusinessDataForm,
    id: number,
  ): Promise<UpdateBusinessDataResponse["res"] | undefined> => {
    try {
      const param = await axios.put<UpdateBusinessDataResponse>(
        `api/admin/businessData/${id}`,
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

        const updatedData = normalizeBusinessData(param.data.updateData);
        const currentBusiness = resBusiness.value.get(id);

        if (currentBusiness) {
          resBusiness.value.set(id, {
            ...currentBusiness,
            business_data: updatedData,
          });
        }

        resBusinessData.value = updatedData;
        return param.data.res;
      }
    } catch (error: unknown) {
      console.error(error);
      showAlert({
        title: "Error al guardar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const createAgreement = async (
    form: AgreementForm,
    id: number,
  ): Promise<CreateAgreementResponse["res"] | undefined> => {
    try {
      const param = await axios.post<CreateAgreementResponse>(
        `api/admin/business/${id}/agreement`,
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
        resBusinessAgreements.value.set(
          param.data.agreement.id,
          param.data.agreement,
        );
        return param.data.res;
      }
    } catch (error: unknown) {
      console.error(error);
      showAlert({
        title: "Error al guardar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const searchBusiness = async (
    search: string,
  ): Promise<BusinessSearchResponse | undefined> => {
    try {
      const res = await axios.get<BusinessSearchResponse>("api/admin/search", {
        params: { search },
        headers: { accept: "application/json" },
      });
      // Normalize at the boundary: ids must be numbers for strict comparison.
      return {
        businesses: res.data.businesses.map((b) => ({
          ...b,
          id: Number(b.id),
          user_id: Number(b.user_id),
        })),
      };
    } catch (error: unknown) {
      console.error("Error:", error);
    }
  };

  return {
    resBusiness,
    fetchBusiness,
    getBusiness,
    getBusinessData,
    getBusinessAgreements,
    resBusinessDetails,
    resBusinessData,
    resBusinessAgreements,
    createBusiness,
    updateBusiness,
    updateBusinessData,
    createAgreement,
    searchBusiness,
  };
});
