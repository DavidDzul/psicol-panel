import { computed, onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useScholarshipDocumentsStore } from "@/stores/api/scholarshipDocumentsStore";
import type { ScholarshipRefrend, ReviewForm, AuthorizeForm, StudentDocument, AttendanceSummary } from "@/interfaces/scholarship";

export function useScholarshipDetails() {
  const route = useRoute();
  const store = useScholarshipStore();
  const docsStore = useScholarshipDocumentsStore();
  const { selectedRefrend } = storeToRefs(store);
  const { documents } = storeToRefs(docsStore);

  const loading             = ref<boolean>(false);
  const reviewDialog        = ref<boolean>(false);
  const reviewMode          = ref<'atencion' | 'pedagogia'>('atencion');
  const uploadDialog        = ref<boolean>(false);
  const withholdDialog      = ref<boolean>(false);
  const withholdReason      = ref<string>('');
  const authorizeDialog     = ref<boolean>(false);
  const attendanceSummary   = ref<AttendanceSummary | null>(null);

  const refrend = computed<ScholarshipRefrend | null>(() => selectedRefrend.value);

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
      await Promise.all([
        docsStore.fetchDocuments(user_id, period_year, period_month),
        store.fetchAttendanceSummary(user_id, period_year, period_month).then((s) => {
          attendanceSummary.value = s ?? null;
        }),
      ]);
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

  const onUpload = async (formData: FormData): Promise<void> => {
    await docsStore.uploadDocument(formData);
    uploadDialog.value = false;
  };

  const onAcceptDoc = async (docId: number): Promise<void> => {
    await docsStore.acceptDocument(docId);
  };

  const onRejectDoc = async (docId: number, reason: string): Promise<void> => {
    await docsStore.rejectDocument(docId, reason);
  };

  return {
    refrend,
    docList,
    attendanceSummary,
    loading,
    reviewDialog,
    reviewMode,
    uploadDialog,
    withholdDialog,
    withholdReason,
    authorizeDialog,
    openAtencionReview,
    openPedagogiaReview,
    onSubmitReview,
    openAuthorize,
    onAuthorize,
    onMarkPaid,
    openWithhold,
    onWithhold,
    onUpload,
    onAcceptDoc,
    onRejectDoc,
  };
}
