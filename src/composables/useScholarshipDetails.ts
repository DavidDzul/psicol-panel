import { computed, onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useScholarshipDocumentsStore } from "@/stores/api/scholarshipDocumentsStore";
import type {
  ScholarshipProfile,
  ScholarshipRefrend,
  ReviewForm,
  AuthorizeForm,
  StudentDocument,
  AttendanceSummary,
  GraduateForm,
} from "@/interfaces/scholarship";

export function useScholarshipDetails() {
  const route    = useRoute();
  const store    = useScholarshipStore();
  const docsStore = useScholarshipDocumentsStore();
  const { selectedRefrend, refrends } = storeToRefs(store);
  const { documents } = storeToRefs(docsStore);

  const loading           = ref<boolean>(false);
  const reviewDialog      = ref<boolean>(false);
  const reviewMode        = ref<'atencion' | 'pedagogia'>('atencion');
  const withholdDialog    = ref<boolean>(false);
  const withholdReason    = ref<string>('');
  const authorizeDialog   = ref<boolean>(false);
  const graduateDialog    = ref<boolean>(false);
  const attendanceSummary = ref<AttendanceSummary | null>(null);
  const scholarshipProfile = ref<ScholarshipProfile | null>(null);

  const refrend = computed<ScholarshipRefrend | null>(() => selectedRefrend.value);

  // Refrendos del mismo semestre que el refrendo consultado
  // Semestre 1: meses 1–7 | Semestre 2: meses 8–12
  const semesterRefrends = computed<ScholarshipRefrend[]>(() => {
    if (!refrend.value) return [];
    const { user_id, period_year, period_month } = refrend.value;
    const isSemOne = period_month <= 7;
    const semStart = isSemOne ? 1 : 8;
    const semEnd   = isSemOne ? 7 : 12;
    return [...refrends.value.values()]
      .filter(
        (r) =>
          r.user_id === user_id &&
          r.period_year === period_year &&
          r.period_month >= semStart &&
          r.period_month <= semEnd
      )
      .sort((a, b) => a.period_month - b.period_month);
  });

  // Documentos del periodo del refrendo (solo para mostrar estado, sin upload aquí)
  const docList = computed<StudentDocument[]>(() =>
    [...documents.value.values()].filter(
      (d) =>
        refrend.value &&
        d.period_year === refrend.value.period_year &&
        d.period_month === refrend.value.period_month &&
        d.user_id === refrend.value.user_id
    )
  );

  const load = async (): Promise<void> => {
    const id = parseInt(route.params.id as string, 10);
    if (isNaN(id) || id <= 0) return;

    loading.value = true;
    await store.fetchRefrend(id);

    if (selectedRefrend.value) {
      const { user_id, period_year, period_month } = selectedRefrend.value;
      const [, , profile] = await Promise.all([
        docsStore.fetchDocuments(user_id, period_year, period_month),
        store.fetchAttendanceSummary(user_id, period_year, period_month).then((s) => {
          attendanceSummary.value = s ?? null;
        }),
        store.fetchProfile(user_id),
        // Cargar todos los refrendos del becario para construir el historial semestral
        store.fetchRefrendsForUser(user_id),
      ]);
      scholarshipProfile.value = profile ?? null;
    }
    loading.value = false;
  };

  onBeforeMount(load);
  watch(() => route.fullPath, load);

  const openAtencionReview = (): void => {
    reviewMode.value = 'atencion';
    reviewDialog.value = true;
  };

  const openPedagogiaReview = (): void => {
    reviewMode.value = 'pedagogia';
    reviewDialog.value = true;
  };

  const onSubmitReview = async (form: ReviewForm): Promise<void> => {
    if (!refrend.value) return;
    if (reviewMode.value === 'atencion') {
      await store.submitAtencionReview(refrend.value.id, form);
    } else {
      await store.submitPedagogiaReview(refrend.value.id, form);
    }
    reviewDialog.value = false;
  };

  const openAuthorize = (): void => {
    authorizeDialog.value = true;
  };

  const onAuthorize = async (form: AuthorizeForm): Promise<void> => {
    if (!refrend.value) return;
    await store.authorizeRefrend(refrend.value.id, form);
    authorizeDialog.value = false;
  };

  const onMarkPaid = async (): Promise<void> => {
    if (!refrend.value) return;
    await store.markPaid(refrend.value.id);
  };

  const openWithhold = (): void => {
    withholdReason.value = '';
    withholdDialog.value = true;
  };

  const onWithhold = async (reason?: string): Promise<void> => {
    if (!refrend.value) return;
    await store.withholdRefrend(refrend.value.id, reason);
    withholdDialog.value = false;
  };

  const onGraduate = async (form: GraduateForm): Promise<void> => {
    if (!refrend.value) return;
    await store.markAsGraduate(refrend.value.user_id, form);
    graduateDialog.value = false;
  };

  return {
    refrend,
    docList,
    semesterRefrends,
    attendanceSummary,
    scholarshipProfile,
    loading,
    reviewDialog,
    reviewMode,
    withholdDialog,
    withholdReason,
    authorizeDialog,
    graduateDialog,
    openAtencionReview,
    openPedagogiaReview,
    onSubmitReview,
    openAuthorize,
    onAuthorize,
    onMarkPaid,
    openWithhold,
    onWithhold,
    onGraduate,
  };
}
