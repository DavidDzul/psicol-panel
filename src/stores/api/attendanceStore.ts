import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { useAlertStore } from "@/stores/alert";

export const useAttendanceStore = defineStore("attendanceStore", () => {
  const { showAlert } = useAlertStore();

  const createCheckIn = async (code: unknown): Promise<unknown> => {
    const res = await axios.post("api/attendance/check-in", code, {
      headers: { accept: "application/json" },
    });
    return res.data;
  };

  return {
    createCheckIn,
  };
});
