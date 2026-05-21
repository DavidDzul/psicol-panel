import axios from "@/axiosConfig";
import { isAxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toRaw } from "vue";
import { useAlertStore } from "@/stores/alert";
import type {
  ScholarshipProfile,
  ScholarshipRefrend,
  ScholarshipProfileForm,
  GeneratePeriodForm,
  ReviewForm,
  AuthorizeForm,
  AttendanceSummary,
  GraduateForm,
  BulkRefrendRow,
  BulkTableMeta,
  BulkTableParams,
  InlinePatchPayload,
} from "@/interfaces/scholarship";
import type { User } from "@/interfaces/user";
import type {
  ScholarshipProfileResponse,
  ScholarshipRefrendsResponse,
  ScholarshipRefrendResponse,
  GenerateRefrendsResponse,
  AttendanceSummaryResponse,
  GraduatePersonResponse,
} from "@/interfaces/api";

export const useScholarshipStore = defineStore("scholarshipStore", () => {
  const { showAlert } = useAlertStore();

  const refrends = ref<Map<number, ScholarshipRefrend>>(new Map());
  const profiles = ref<Map<number, ScholarshipProfile>>(new Map());
  const selectedRefrend = ref<ScholarshipRefrend | null>(null);
  const attendanceSummaries = ref<Map<string, AttendanceSummary>>(new Map());

  // ── Bulk table (master table) ─────────────────────────────────────────────
  const bulkRows = ref<BulkRefrendRow[]>([]);
  const bulkMeta = ref<BulkTableMeta | null>(null);
  const bulkLoading = ref<boolean>(false);
  const bulkError = ref<string | null>(null);
  const bulkParams = ref<BulkTableParams | null>(null);

  // ── Profiles ──────────────────────────────────────────────────────────────

  const fetchProfile = async (userId: number): Promise<ScholarshipProfile | undefined> => {
    try {
      const res = await axios.get<ScholarshipProfileResponse>(
        `api/admin/scholarship-profiles/${userId}`
      );
      const profile = res.data.data;
      const newMap = new Map(profiles.value);
      newMap.set(userId, profile);
      profiles.value = newMap;
      return profile;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return undefined;
      showAlert({ title: "Error al cargar perfil de beca.", status: "error" });
    }
  };

  const saveProfile = async (
    form: ScholarshipProfileForm
  ): Promise<ScholarshipProfile | undefined> => {
    try {
      const existing = profiles.value.get(form.user_id);
      const res = existing
        ? await axios.put<ScholarshipProfileResponse>(
            `api/admin/scholarship-profiles/${form.user_id}`,
            form
          )
        : await axios.post<ScholarshipProfileResponse>(
            `api/admin/scholarship-profiles/`,
            form
          );
      const profile = res.data.data;
      const newMap = new Map(profiles.value);
      newMap.set(form.user_id, profile);
      profiles.value = newMap;
      showAlert({ title: "Perfil de beca guardado.", status: "success" });
      return profile;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al guardar perfil.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
      throw error;
    }
  };

  // ── Refrends — list ───────────────────────────────────────────────────────

  const fetchRefrends = async (year: number, month: number, campus?: string | null): Promise<void> => {
    try {
      const params: Record<string, unknown> = { year, month };
      if (campus) params.campus = campus;
      const res = await axios.get<ScholarshipRefrendsResponse>(
        "api/admin/scholarship-refrends",
        { params }
      );
      refrends.value = new Map(res.data.data.map((r) => [r.id, r]));
    } catch {
      showAlert({ title: "Error al cargar refrendos.", status: "error" });
    }
  };

  const fetchRefrendsForUser = async (userId: number): Promise<ScholarshipRefrend[]> => {
    try {
      const res = await axios.get<ScholarshipRefrendsResponse>(
        `api/admin/users/${userId}/scholarship-refrends`
      );
      const list = res.data.data;
      const newMap = new Map(refrends.value);
      list.forEach((r) => newMap.set(r.id, r));
      refrends.value = newMap;
      return list;
    } catch {
      showAlert({ title: "Error al cargar historial de refrendos.", status: "error" });
      return [];
    }
  };

  const fetchRefrend = async (id: number): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.get<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}`
      );
      const refrend = res.data.data;
      const newMap = new Map(refrends.value);
      newMap.set(refrend.id, refrend);
      refrends.value = newMap;
      selectedRefrend.value = refrend;
      return refrend;
    } catch {
      showAlert({ title: "Error al cargar el refrendo.", status: "error" });
    }
  };

  // ── Refrends — generation ─────────────────────────────────────────────────

  const generatePeriod = async (
    form: GeneratePeriodForm
  ): Promise<{ created: number; skipped: number; errors: number } | undefined> => {
    try {
      const res = await axios.post<GenerateRefrendsResponse>(
        "api/admin/scholarship-refrends/generate",
        form
      );
      showAlert({ title: "Refrendos generados exitosamente.", status: "success" });
      return res.data.data;
    } catch {
      showAlert({ title: "Error al generar refrendos.", status: "error" });
    }
  };

  const generateForUser = async (
    userId: number,
    form: GeneratePeriodForm
  ): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/generate/${userId}`,
        form
      );
      const refrend = res.data.data;
      const newMap = new Map(refrends.value);
      newMap.set(refrend.id, refrend);
      refrends.value = newMap;
      showAlert({ title: "Refrendo generado.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        showAlert({ title: "Ya existe un refrendo para este periodo.", status: "error" });
        return undefined;
      }
      showAlert({ title: "Error al generar refrendo.", status: "error" });
    }
  };

  // ── Refrends — status transitions ─────────────────────────────────────────

  const submitAtencionReview = async (id: number, form: ReviewForm): Promise<ScholarshipRefrend | undefined> =>
    _updateRefrend(`api/admin/scholarship-refrends/${id}/atencion-review`, form);

  const submitPedagogiaReview = async (id: number, form: ReviewForm): Promise<ScholarshipRefrend | undefined> =>
    _updateRefrend(`api/admin/scholarship-refrends/${id}/pedagogia-review`, form);

  const authorizeRefrend = async (id: number, form?: AuthorizeForm): Promise<ScholarshipRefrend | undefined> =>
    _updateRefrend(`api/admin/scholarship-refrends/${id}/authorize`, form ?? {});

  const markPaid = async (id: number): Promise<ScholarshipRefrend | undefined> =>
    _putRefrend(`api/admin/scholarship-refrends/${id}/paid`);

  const withholdRefrend = async (id: number, reason?: string): Promise<ScholarshipRefrend | undefined> =>
    _updateRefrend(`api/admin/scholarship-refrends/${id}/withhold`, { reason });

  // ── Retícula ──────────────────────────────────────────────────────────────

  const uploadReticula = async (userId: number, formData: FormData): Promise<ScholarshipProfile | undefined> => {
    try {
      const res = await axios.post<ScholarshipProfileResponse>(
        `api/admin/scholarship-profiles/${userId}/reticula`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const profile = res.data.data;
      const newMap = new Map(profiles.value);
      newMap.set(userId, profile);
      profiles.value = newMap;
      showAlert({ title: "Retícula guardada.", status: "success" });
      return profile;
    } catch {
      showAlert({ title: "Error al guardar retícula.", status: "error" });
    }
  };

  // ── Attendance summary ────────────────────────────────────────────────────

  const fetchAttendanceSummary = async (
    userId: number,
    year: number,
    month: number
  ): Promise<AttendanceSummary | undefined> => {
    const key = `${userId}_${year}_${month}`;
    try {
      const res = await axios.get<AttendanceSummaryResponse>(
        `api/admin/users/${userId}/attendance-summary`,
        { params: { year, month } }
      );
      const summary = res.data.data;
      const newMap = new Map(attendanceSummaries.value);
      newMap.set(key, summary);
      attendanceSummaries.value = newMap;
      return summary;
    } catch {
      showAlert({ title: "Error al cargar resumen de asistencias.", status: "error" });
    }
  };

  const getAttendanceSummary = (userId: number, year: number, month: number): AttendanceSummary | undefined =>
    attendanceSummaries.value.get(`${userId}_${year}_${month}`);

  // ── Graduate ──────────────────────────────────────────────────────────────

  const markAsGraduate = async (userId: number, form: GraduateForm): Promise<User | undefined> => {
    try {
      const res = await axios.post<GraduatePersonResponse>(
        `api/admin/persons/${userId}/graduate`,
        form
      );
      showAlert({ title: "Becario marcado como egresado.", status: "success" });
      return res.data.data;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al marcar como egresado.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  // ── Bulk table actions ────────────────────────────────────────────────────

  const fetchBulkTable = async (params: BulkTableParams): Promise<void> => {
    bulkLoading.value = true;
    bulkError.value = null;
    bulkParams.value = params;
    try {
      const res = await axios.get("api/admin/scholarship-refrends/bulk-table", { params });
      bulkRows.value = res.data.data;
      bulkMeta.value = res.data.meta;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al cargar la tabla.")
        : "Error de red.";
      bulkError.value = msg;
      bulkRows.value = [];
      bulkMeta.value = null;
      showAlert({ title: msg, status: "error" });
    } finally {
      bulkLoading.value = false;
    }
  };

  const patchInline = async (id: number, payload: InlinePatchPayload): Promise<void> => {
    const rowIdx = bulkRows.value.findIndex((r) => r.refrend.id === id);
    const previous = rowIdx >= 0 ? structuredClone(toRaw(bulkRows.value[rowIdx])) : null;

    if (rowIdx >= 0) {
      const row = bulkRows.value[rowIdx];
      if (payload.atencion_labels !== undefined) {
        row.refrend.atencion_labels = payload.atencion_labels;
      }
      if (payload.atencion_observations !== undefined) {
        row.refrend.atencion_observations = payload.atencion_observations;
      }
      if (payload.pedagogia_observations !== undefined) {
        row.refrend.pedagogia_observations = payload.pedagogia_observations;
      }
      if (payload.final_amount_override != null) {
        row.refrend.final_amount = String(payload.final_amount_override);
        row.projected_amount = String(payload.final_amount_override);
      }
      row.incidents_count = row.refrend.atencion_labels?.length ?? 0;
    }

    try {
      const res = await axios.patch(`api/admin/scholarship-refrends/${id}/inline`, payload);
      if (rowIdx >= 0) {
        bulkRows.value[rowIdx].refrend = res.data.data as ScholarshipRefrend;
      }
    } catch (error: unknown) {
      if (rowIdx >= 0 && previous !== null) {
        bulkRows.value[rowIdx] = previous;
      }
      throw error;
    }
  };

  // ── Private helpers ───────────────────────────────────────────────────────

  const _updateRefrend = async (url: string, data: object): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.put<ScholarshipRefrendResponse>(url, data);
      return _mergeRefrend(res.data.data);
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al actualizar refrendo.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const _putRefrend = async (url: string): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.put<ScholarshipRefrendResponse>(url);
      return _mergeRefrend(res.data.data);
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al actualizar refrendo.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const _mergeRefrend = (refrend: ScholarshipRefrend): ScholarshipRefrend => {
    const newMap = new Map(refrends.value);
    newMap.set(refrend.id, refrend);
    refrends.value = newMap;
    if (selectedRefrend.value?.id === refrend.id) {
      selectedRefrend.value = refrend;
    }
    return refrend;
  };

  return {
    refrends,
    profiles,
    selectedRefrend,
    attendanceSummaries,
    bulkRows,
    bulkMeta,
    bulkLoading,
    bulkError,
    bulkParams,
    fetchProfile,
    saveProfile,
    fetchRefrends,
    fetchRefrendsForUser,
    fetchRefrend,
    generatePeriod,
    generateForUser,
    submitAtencionReview,
    submitPedagogiaReview,
    authorizeRefrend,
    markPaid,
    withholdRefrend,
    fetchAttendanceSummary,
    getAttendanceSummary,
    uploadReticula,
    markAsGraduate,
    fetchBulkTable,
    patchInline,
  };
});
