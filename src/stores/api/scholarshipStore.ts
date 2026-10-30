import axios from "@/axiosConfig";
import { isAxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toRaw } from "vue";
import { useAlertStore } from "@/stores/alert";
import { usePersonsStore } from "@/stores/api/personsStore";
import type {
  ScholarshipProfile,
  ScholarshipRefrend,
  ScholarshipProfileForm,
  GeneratePeriodForm,
  AttendanceSummary,
  BulkRefrendRow,
  BulkTableMeta,
  BulkTableParams,
  InlinePatchPayload,
  AtencionFlagForm,
  PedagogiaResolveForm,
  RecordSituationForm,
  RecordSituationResult,
  ScholarshipWithholding,
  AdvancePaymentForm,
  RevertAdvancePaymentResult,
  CycleCutPreview,
  ScholarshipAdvancePayment,
  GenerateRefrendsResult,
  CutBlockingMonth,
} from "@/interfaces/scholarship";
import type { User } from "@/interfaces/user";
import type {
  ScholarshipProfileResponse,
  ScholarshipRefrendsResponse,
  ScholarshipRefrendResponse,
  GenerateRefrendsResponse,
  AttendanceSummaryResponse,
  ScholarshipWithholdingsResponse,
  PendingWithholdingsMeta,
  AdvancePaymentResponse,
} from "@/interfaces/api";

export const useScholarshipStore = defineStore("scholarshipStore", () => {
  const { showAlert } = useAlertStore();

  const refrends = ref<Map<number, ScholarshipRefrend>>(new Map());
  const profiles = ref<Map<number, ScholarshipProfile>>(new Map());
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
      usePersonsStore().patchPersonFlags(form.user_id, { has_scholarship_profile: true });
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

  // ── Refrends — generation ─────────────────────────────────────────────────

  // sdd/verificacion-incidencias-ux PR3: useSedeRefrendGeneration calls this
  // SEQUENTIALLY, once per generación of a sede. A per-call alert (the prior
  // behavior) would spam one toast per generación, so this returns the typed
  // result and RETHROWS on failure with NO alert of its own — the composable
  // owns aggregating outcomes and reporting one summary at the end.
  const generatePeriod = async (
    form: GeneratePeriodForm
  ): Promise<GenerateRefrendsResult> => {
    const res = await axios.post<GenerateRefrendsResponse>(
      "api/admin/scholarship-refrends/generate",
      form
    );
    return res.data.data;
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
      showAlert({ title: "Revisión de aprobación guardada.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al guardar revisión.")
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
      await _refreshActiveTables();
      showAlert({ title: "Refrendo recalculado.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al recalcular.")
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
      usePersonsStore().patchPersonFlags(userId, { curriculum_uploaded: true });
      showAlert({ title: "Retícula guardada.", status: "success" });
      return profile;
    } catch (error: unknown) {
      // RETICULA_ADVANCE_CONFLICT (422) carries a fully-formed Spanish msg
      // listing the conflicting advance months: show it verbatim.
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string } | undefined)?.msg ?? "Error al guardar retícula.")
        : "Error al guardar retícula.";
      showAlert({ title: msg, status: "error" });
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

  // incidents_count is never touched here — it's the real count of
  // scholarship_refrend_incidents rows (server-computed, see
  // RefrendBulkQueryService), unrelated to atencion_labels. Previously reset
  // to atencion_labels.length on every call (even a plain notified_at
  // toggle), which zeroed a row's real incident count and made it wrongly
  // vanish/reappear from incident-based filters (user-reported).
  // atencionFlag/clearFlag already own incidents_count correctly.
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

  const _mergeBulkRow = (
    refrend: ScholarshipRefrend,
    extra?: Partial<Omit<BulkRefrendRow, "refrend">>
  ): void => {
    for (const { rows, idx } of _findRowLocations(refrend.id)) {
      rows.value[idx] = { ...rows.value[idx], refrend, ...extra };
    }
  };

  // A single action can shift many derived, cross-cutting fields at once
  // (attendance summary, discounts, incidents count...) that a hand-picked
  // partial merge keeps missing one at a time. Reusing the real search
  // (same params already on file) is the only way to guarantee the row is
  // byte-identical to what a manual "Buscar" would show. Mirrors bulkApprove's
  // existing pattern — a changed row can live in either query, so refresh
  // whichever ones currently have an active search.
  const _refreshActiveTables = async (): Promise<void> => {
    if (bulkParams.value) await fetchBulkTable(bulkParams.value);
    if (incidenciasParams.value) await fetchIncidenciasTable(incidenciasParams.value);
  };

  const _mergeRefrend = (refrend: ScholarshipRefrend): ScholarshipRefrend => {
    const newMap = new Map(refrends.value);
    newMap.set(refrend.id, refrend);
    refrends.value = newMap;
    return refrend;
  };

  // ── Approve actions ──────────────────────────────────────────────────────

  // Returns a discriminated result, same contract as recordPaymentSituation
  // (sdd/pago-adelantado fix 2026-09-27): this is staff's most natural way
  // to approve at 100%, and it went through a DIFFERENT backend action
  // (ApproveFullPaymentAction) that used to bypass advance-payment
  // reconciliation entirely — a live bug report (approving an arrived
  // advance-paid month silently succeeded with no reason, no audit trail).
  // The backend now shares the same ADVANCE_DIVERGENCE_REQUIRED code via
  // AdvancePaymentReconciler, so this must surface it the same way.
  const approveFullPayment = async (
    id: number,
    advanceDivergenceReason?: string,
  ): Promise<RecordSituationResult> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/approve-full`,
        advanceDivergenceReason ? { advance_divergence_reason: advanceDivergenceReason } : {},
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend, { has_retardos_discount: false, has_falta_discount: false });
      showAlert({ title: "Pago sin descuento por faltas aplicado.", status: "success" });
      return { status: "success", refrend };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string; code?: string } | undefined;
        if (data?.code === "ADVANCE_DIVERGENCE_REQUIRED") {
          return { status: "divergence_required" };
        }
        showAlert({
          title: data?.message ?? "Error al aplicar el pago sin descuento por faltas.",
          status: "error",
        });
        return { status: "error" };
      }
      showAlert({ title: "Error de red.", status: "error" });
      return { status: "error" };
    }
  };

  // Undo an applied resolution — wipes resolution fields and forces DRAFT,
  // then lets the backend's fullRecalculate() re-derive everything from live
  // data. Mirrors recalculateRefrend (not clearFlag): the derived bulk-row
  // attendance flags must be refreshed the same way since fullRecalculate can
  // re-create RETARDOS / FALTA_INJUSTIFICADA discount rows.
  const clearRefrendResolution = async (id: number): Promise<ScholarshipRefrend | undefined> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/clear-resolution`,
      );
      const refrend = _mergeRefrend(res.data.data);
      await _refreshActiveTables();
      showAlert({ title: "Resolución deshecha.", status: "success" });
      return refrend;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al deshacer la resolución.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  // ── Payment situation ─────────────────────────────────────────────────────

  // Returns a discriminated result instead of throwing/toasting-only on
  // every failure (sdd/pago-adelantado, design D4 fix 2026-09-25) — the
  // server's ADVANCE_DIVERGENCE_REQUIRED code must reach the caller
  // distinctly so it can show AdvanceDivergenceReasonDialog and resubmit,
  // rather than leaving staff at a dead end with only a generic error toast.
  const recordPaymentSituation = async (
    id: number,
    form: RecordSituationForm,
  ): Promise<RecordSituationResult> => {
    try {
      const res = await axios.post<ScholarshipRefrendResponse>(
        `api/admin/scholarship-refrends/${id}/situation`,
        form,
      );
      const refrend = _mergeRefrend(res.data.data);
      _mergeBulkRow(refrend);
      showAlert({ title: "Situación registrada.", status: "success" });
      return { status: "success", refrend };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const body = error.response?.data as
          | {
              msg?: string;
              code?: string;
              data?: {
                blocking_months?: CutBlockingMonth[];
                coverage_id?: number;
                status?: string;
                start_period?: string;
              };
            }
          | undefined;
        if (body?.code === "ADVANCE_DIVERGENCE_REQUIRED") {
          return { status: "divergence_required" };
        }
        // sdd/egresado-baja-definitiva PR3 (amendments #1987/#1988): the cut
        // guards carry a structured `data` payload the situation dialogs
        // render inline — no generic toast here, same precedent as
        // ADVANCE_DIVERGENCE_REQUIRED above.
        if (body?.code === "CYCLE_CUT_BLOCKED") {
          return {
            status: "cut_blocked",
            msg: body.msg ?? "El cierre de ciclo está bloqueado.",
            blocking_months: body.data?.blocking_months ?? [],
          };
        }
        if (body?.code === "CYCLE_CUT_ACTIVE_TELMEX_COVERAGE") {
          return {
            status: "cut_blocked",
            msg: body.msg ?? "El becario tiene una cobertura Telmex activa.",
            telmex_coverage: {
              coverage_id: body.data?.coverage_id ?? 0,
              status: body.data?.status ?? "",
              start_period: body.data?.start_period ?? "",
            },
          };
        }
        showAlert({ title: body?.msg ?? "Error al registrar situación.", status: "error" });
        return { status: "error" };
      }
      showAlert({ title: "Error de red.", status: "error" });
      return { status: "error" };
    }
  };

  // ── Advance payment (pago adelantado) ───────────────────────────────────────
  //
  // Distinct endpoint/store method from recordPaymentSituation: this records a
  // NEW batch of future advance-paid months on the origin refrendo, it does
  // not resolve the origin refrendo's own current-month situation. The
  // response is a ScholarshipAdvancePayment header, not a ScholarshipRefrend,
  // so there is nothing to _mergeRefrend — but the origin refrendo's own
  // advance_payment_amount/total_to_pay change server-side (design D6), so
  // active tables are refreshed the same way clearRefrendResolution does for
  // other cross-cutting derived-field changes.

  const recordAdvancePayment = async (
    id: number,
    form: AdvancePaymentForm,
  ): Promise<ScholarshipAdvancePayment | undefined> => {
    try {
      const res = await axios.post<AdvancePaymentResponse>(
        `api/admin/scholarship-refrends/${id}/advance-payment`,
        form,
      );
      await _refreshActiveTables();
      showAlert({ title: "Pago adelantado registrado.", status: "success" });
      return res.data.data;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al registrar pago adelantado.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  // Revert a recorded advance payment (sdd/revertir-pago-adelantado). Returns
  // a discriminated result so the dialog can stay open and map `code` to its
  // own Spanish copy; the server msg is also toasted, same as the record
  // action. Success refreshes the active tables (origin amounts change).
  const revertAdvancePayment = async (
    id: number,
    reason: string,
  ): Promise<RevertAdvancePaymentResult> => {
    try {
      await axios.post(`api/admin/scholarship-refrends/${id}/advance-payment/revert`, { reason });
      await _refreshActiveTables();
      showAlert({ title: "Pago adelantado revertido.", status: "success" });
      return { status: "success" };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const body = error.response?.data as { msg?: string; code?: string } | undefined;
        const msg = body?.msg ?? "Error al revertir pago adelantado.";
        showAlert({ title: msg, status: "error" });
        return { status: "error", code: body?.code ?? null, msg };
      }
      showAlert({ title: "Error de red.", status: "error" });
      return { status: "error", code: null, msg: "Error de red." };
    }
  };

  // sdd/revertir-pago-adelantado S10: read-only cut preview. Errors resolve to
  // null WITHOUT a toast (the dialog just hides the warning, S52).
  const fetchCycleCutPreview = async (
    id: number,
    reason: "BAJA_DEFINITIVA" | "EGRESADO",
  ): Promise<CycleCutPreview | null> => {
    try {
      const res = await axios.get<{ res: boolean; data: CycleCutPreview }>(
        `api/admin/scholarship-refrends/${id}/cycle-cut-preview`,
        { params: { reason } },
      );
      return res.data.data ?? null;
    } catch {
      return null;
    }
  };

  // ── Withholding ledger (retenciones individuales) ──────────────────────────

  const fetchPendingWithholdings = async (
    userId: number,
    relativeYear?: number | null,
    relativeMonth?: number | null,
  ): Promise<{ rows: ScholarshipWithholding[]; meta?: PendingWithholdingsMeta }> => {
    try {
      const params: Record<string, string | number> = { status: "pending" };
      // Both-or-neither, matching the backend's `required_with` validation —
      // sending only one would trigger a 422.
      if (relativeYear != null && relativeMonth != null) {
        params.relative_year = relativeYear;
        params.relative_month = relativeMonth;
      }
      const res = await axios.get<ScholarshipWithholdingsResponse>(
        `api/admin/users/${userId}/scholarship-withholdings`,
        { params }
      );
      return { rows: res.data.data, meta: res.data.meta };
    } catch {
      showAlert({ title: "Error al cargar retenciones pendientes.", status: "error" });
      return { rows: [] };
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
      await _refreshActiveTables();
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
    generatePeriod,
    generateForUser,
    fetchAttendanceSummary,
    getAttendanceSummary,
    uploadReticula,
    fetchBulkTable,
    resetBulkTable,
    fetchIncidenciasTable,
    resetIncidenciasTable,
    patchInline,
    atencionFlag,
    clearFlag,
    pedagogiaResolve,
    recalculateRefrend,
    approveFullPayment,
    clearRefrendResolution,
    recordPaymentSituation,
    recordAdvancePayment,
    revertAdvancePayment,
    fetchCycleCutPreview,
    bulkApprove,
    fetchPendingWithholdings,
    voidWithholdingPayment,
  };
});


