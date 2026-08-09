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
  AtencionFlagForm,
  PedagogiaResolveForm,
  RefrendPaymentVerifyForm,
  RecordSituationForm,
  ScholarshipWithholding,
} from "@/interfaces/scholarship";
import type { User } from "@/interfaces/user";
import type {
  ScholarshipProfileResponse,
  ScholarshipRefrendsResponse,
  ScholarshipRefrendResponse,
  GenerateRefrendsResponse,
  AttendanceSummaryResponse,
  GraduatePersonResponse,
  ScholarshipWithholdingsResponse,
} from "@/interfaces/api";

export const useScholarshipStore = defineStore("scholarshipStore", () => {
  const { showAlert } = useAlertStore();

  const refrends = ref<Map<number, ScholarshipRefrend>>(new Map());
  const profiles = ref<Map<number, ScholarshipProfile>>(new Map());
  const selectedRefrend = ref<ScholarshipRefrend | null>(null);
  const attendanceSummaries = ref<Map<string, AttendanceSummary>>(new Map());

  // ── Bulk table (master table — variante Completa) ─────────────────────────
  const bulkRows = ref<BulkRefrendRow[]>([]);
  const bulkMeta = ref<BulkTableMeta | null>(null);
  const bulkLoading = ref<boolean>(false);
  const bulkError = ref<string | null>(null);
  const bulkParams = ref<BulkTableParams | null>(null);

  // ── Bulk table (master table — variante Incidencias) ──────────────────────
  // Query independiente de la Completa: no comparten loading/error/params, así
  // alternar de tab nunca muestra datos de la otra búsqueda (p.ej. filtrados
  // por una generación que solo aplicaba a la búsqueda Completa).
  const incidenciasRows = ref<BulkRefrendRow[]>([]);
  const incidenciasMeta = ref<BulkTableMeta | null>(null);
  const incidenciasLoading = ref<boolean>(false);
  const incidenciasError = ref<string | null>(null);
  const incidenciasParams = ref<BulkTableParams | null>(null);

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

  // ── Workflow actions (master table) ───────────────────────────────────────

  const atencionFlag = async (id: number, form: AtencionFlagForm): Promise<ScholarshipRefrend | undefined> => {
    try {
      const currentRow =
        bulkRows.value.find((r) => r.refrend.id === id) ??
        incidenciasRows.value.find((r) => r.refrend.id === id);
      const isEdit = currentRow?.refrend.workflow_status === 'CON_INCIDENCIA';
      const payload = {
        description: form.description,
        incident_category: form.incident_category ?? 'ADMINISTRATIVO',
        incident_type: 'Incidencia administrativa',
        priority: 'MEDIUM',
      };
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/atencion-flag`,
        payload
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend, {
        incident_description: form.description,
        incident_category: form.incident_category ?? 'ADMINISTRATIVO',
        incident_type: payload.incident_type,
        incidents_count: isEdit
          ? (currentRow?.incidents_count ?? 1)
          : (currentRow?.incidents_count ?? 0) + 1,
      });
      showAlert({ title: isEdit ? "Incidencia actualizada." : "Incidencia registrada.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al registrar incidencia.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const pedagogiaResolve = async (id: number, form: PedagogiaResolveForm): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/pedagogia-resolve`,
        form
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      showAlert({ title: "Revisión de pedagogía guardada.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al guardar revisión.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const notifyStudent = async (id: number, notificationMethod?: string): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/notify`,
        { method: notificationMethod ?? 'EMAIL' }
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al notificar.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const clearFlag = async (id: number): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/atencion-clear`
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend, {
        incident_description: null,
        incident_category: null,
        incident_type: null,
        incidents_count: 0,
      });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al limpiar incidencia.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const recalculateRefrend = async (id: number): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/recalculate`
      );
      const refrend = _mergeRefrend(res.data.data);
      const hasRetardos = refrend.discounts?.some(d => d.discount_type === 'RETARDOS') ?? false;
      const hasFalta   = refrend.discounts?.some(d => d.discount_type === 'FALTA_INJUSTIFICADA') ?? false;
      _mergeBulkRow(refrend, {
        has_retardos_discount:     hasRetardos,
        has_falta_discount:        hasFalta,
        semester_lates_unconsumed: refrend.attendance_summary_snapshot?.late_unconsumed ?? 0,
        attendance_late:           refrend.attendance_summary_snapshot?.late ?? 0,
      });
      showAlert({ title: "Refrendo recalculado.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al recalcular.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const submitPaymentVerify = async (id: number, form: RefrendPaymentVerifyForm): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/payment-verify`,
        form
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      showAlert({ title: "Verificación de pago registrada.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al verificar pago.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

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

  const fetchIncidenciasTable = async (params: BulkTableParams): Promise<void> => {
    incidenciasLoading.value = true;
    incidenciasError.value = null;
    incidenciasParams.value = params;
    try {
      const res = await axios.get("api/admin/scholarship-refrends/bulk-table", { params });
      incidenciasRows.value = res.data.data;
      incidenciasMeta.value = res.data.meta;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al cargar la tabla.")
        : "Error de red.";
      incidenciasError.value = msg;
      incidenciasRows.value = [];
      incidenciasMeta.value = null;
      showAlert({ title: msg, status: "error" });
    } finally {
      incidenciasLoading.value = false;
    }
  };

  const patchInline = async (id: number, payload: InlinePatchPayload): Promise<void> => {
    const locations = _findRowLocations(id);
    const snapshots = locations.map(({ rows, idx }) => ({
      rows,
      idx,
      previous: structuredClone(toRaw(rows.value[idx])),
    }));

    for (const { rows, idx } of locations) {
      const row = rows.value[idx];
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
      if (payload.notification_method !== undefined) {
        row.refrend.notification_method = payload.notification_method;
      }
      if (payload.notified_at !== undefined) {
        row.refrend.notified_at = payload.notified_at;
      }
      row.incidents_count = row.refrend.atencion_labels?.length ?? 0;
    }

    try {
      const res = await axios.patch(`api/admin/scholarship-refrends/${id}/inline`, payload);
      for (const { rows, idx } of locations) {
        rows.value[idx].refrend = res.data.data as ScholarshipRefrend;
      }
    } catch (error: unknown) {
      for (const { rows, idx, previous } of snapshots) {
        rows.value[idx] = previous;
      }
      throw error;
    }
  };

  // ── Private helpers ───────────────────────────────────────────────────────

  // Las filas de Completa e Incidencias vienen de queries independientes y
  // pueden coexistir (un mismo becario puede aparecer en ambas) — las acciones
  // de workflow deben reflejarse en cualquier array donde la fila esté presente.
  const _findRowLocations = (
    id: number
  ): { rows: typeof bulkRows; idx: number }[] =>
    [bulkRows, incidenciasRows]
      .map((rows) => ({ rows, idx: rows.value.findIndex((r) => r.refrend.id === id) }))
      .filter((loc) => loc.idx >= 0);

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

  const _mergeBulkRow = (
    refrend: ScholarshipRefrend,
    extra?: Partial<Omit<BulkRefrendRow, "refrend">>
  ): void => {
    for (const { rows, idx } of _findRowLocations(refrend.id)) {
      rows.value[idx] = { ...rows.value[idx], refrend, ...extra };
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

  // ── Approve actions ──────────────────────────────────────────────────────

  const approveFullPayment = async (id: number): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/approve-full`,
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      showAlert({ title: "Pago al 100% aplicado.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al aplicar pago al 100%.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const atencionApprove = async (id: number): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/atencion-approve`,
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      showAlert({ title: "Refrendo aprobado con descuento.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al aprobar el refrendo.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  // ── Payment situation ─────────────────────────────────────────────────────

  const recordPaymentSituation = async (
    id: number,
    form: RecordSituationForm,
  ): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/situation`,
        form,
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      showAlert({ title: "Situación registrada.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al registrar situación.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  // ── Withholding ledger (retenciones individuales) ──────────────────────────

  const fetchPendingWithholdings = async (userId: number): Promise<ScholarshipWithholding[]> => {
    try {
      const res = await axios.get<ScholarshipWithholdingsResponse>(
        `api/admin/users/${userId}/scholarship-withholdings`,
        { params: { status: "pending" } }
      );
      return res.data.data;
    } catch {
      showAlert({ title: "Error al cargar retenciones pendientes.", status: "error" });
      return [];
    }
  };

  const voidWithholdingPayment = async (
    withholdingId: number,
    paymentId: number,
    reason: string,
  ): Promise<boolean> => {
    try {
      await axios.patch(
        `api/admin/scholarship-withholdings/${withholdingId}/payments/${paymentId}/void`,
        { void_reason: reason },
      );
      showAlert({ title: "Abono revertido.", status: "success" });
      return true;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al revertir el abono.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
      return false;
    }
  };

  const resetBulkTable = (): void => {
    bulkRows.value = [];
    bulkMeta.value = null;
    bulkError.value = null;
    bulkParams.value = null;
  };

  const resetIncidenciasTable = (): void => {
    incidenciasRows.value = [];
    incidenciasMeta.value = null;
    incidenciasError.value = null;
    incidenciasParams.value = null;
  };

  const bulkApprove = async (ids: number[]): Promise<void> => {
    try {
      const res = await axios.post("api/admin/scholarship-refrends/bulk/approve", { ids });
      const { approved, skipped } = res.data.data ?? {};
      // Una fila aprobada puede vivir en cualquiera de las dos queries (Completa
      // e Incidencias) — refrescamos las que tengan una búsqueda activa.
      if (bulkParams.value) await fetchBulkTable(bulkParams.value);
      if (incidenciasParams.value) await fetchIncidenciasTable(incidenciasParams.value);
      const msg = skipped > 0
        ? `${approved} aprobado(s), ${skipped} omitido(s).`
        : `${approved} refrendo(s) aprobado(s).`;
      showAlert({ title: msg, status: "success" });
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al aprobar refrendos.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
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
    incidenciasRows,
    incidenciasMeta,
    incidenciasLoading,
    incidenciasError,
    incidenciasParams,
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
    resetBulkTable,
    fetchIncidenciasTable,
    resetIncidenciasTable,
    patchInline,
    atencionFlag,
    clearFlag,
    pedagogiaResolve,
    notifyStudent,
    submitPaymentVerify,
    recalculateRefrend,
    approveFullPayment,
    atencionApprove,
    recordPaymentSituation,
    bulkApprove,
    fetchPendingWithholdings,
    voidWithholdingPayment,
  };
});


