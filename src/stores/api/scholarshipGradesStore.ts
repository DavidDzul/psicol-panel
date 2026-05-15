import axios from "@/axiosConfig";
import { isAxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAlertStore } from "@/stores/alert";
import type { ScholarshipSemesterGrade } from "@/interfaces/scholarship";
import type { SemesterGradesResponse, SemesterGradeResponse } from "@/interfaces/api";

export const useScholarshipGradesStore = defineStore("scholarshipGradesStore", () => {
  const { showAlert } = useAlertStore();

  const gradesByUser = ref<Map<number, ScholarshipSemesterGrade[]>>(new Map());

  const fetchGrades = async (userId: number): Promise<ScholarshipSemesterGrade[]> => {
    try {
      const res = await axios.get<SemesterGradesResponse>(
        `api/admin/users/${userId}/semester-grades`
      );
      const list = res.data.data;
      const newMap = new Map(gradesByUser.value);
      newMap.set(userId, list);
      gradesByUser.value = newMap;
      return list;
    } catch {
      showAlert({ title: "Error al cargar calificaciones.", status: "error" });
      return [];
    }
  };

  const saveGrade = async (userId: number, formData: FormData): Promise<ScholarshipSemesterGrade | undefined> => {
    try {
      const res = await axios.post<SemesterGradeResponse>(
        `api/admin/users/${userId}/semester-grades`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const grade = res.data.data;
      const current = gradesByUser.value.get(userId) ?? [];
      const idx = current.findIndex(
        (g) => g.semester_year === grade.semester_year && g.semester_period === grade.semester_period
      );
      const updated = idx >= 0
        ? current.map((g, i) => (i === idx ? grade : g))
        : [grade, ...current];
      const newMap = new Map(gradesByUser.value);
      newMap.set(userId, updated);
      gradesByUser.value = newMap;
      showAlert({ title: "Calificación guardada.", status: "success" });
      return grade;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al guardar calificación.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const deleteGrade = async (userId: number, gradeId: number): Promise<void> => {
    try {
      await axios.delete(`api/admin/semester-grades/${gradeId}`);
      const current = gradesByUser.value.get(userId) ?? [];
      const newMap = new Map(gradesByUser.value);
      newMap.set(userId, current.filter((g) => g.id !== gradeId));
      gradesByUser.value = newMap;
      showAlert({ title: "Calificación eliminada.", status: "success" });
    } catch {
      showAlert({ title: "Error al eliminar calificación.", status: "error" });
    }
  };

  const getGrades = (userId: number): ScholarshipSemesterGrade[] =>
    gradesByUser.value.get(userId) ?? [];

  return {
    gradesByUser,
    fetchGrades,
    saveGrade,
    deleteGrade,
    getGrades,
  };
});
