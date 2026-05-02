import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { useAlertStore } from "@/stores/alert";
import { CheckInResponse } from "@/interfaces";

export const useCheckStore = defineStore("checkStore", () => {
  const { showAlert } = useAlertStore();

  const createCheckIn = async (code: string): Promise<CheckInResponse> => {
    const res = await axios.post("api/admin/attendance/check-in", code, {
      headers: { accept: "application/json" },
    });
    return res.data;
  };

  return {
    createCheckIn,
  };
});
