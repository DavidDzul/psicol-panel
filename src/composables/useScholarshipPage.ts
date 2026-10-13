import { computed, onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useSedeRefrendGeneration } from "@/composables/useSedeRefrendGeneration";
import type { ScholarshipRefrend } from "@/interfaces/scholarship";
import type { SelectOption } from "@/constants";

export function useScholarshipPage() {
  const store = useScholarshipStore();
  const { refrends } = storeToRefs(store);
  const { filteredCampus } = storeToRefs(useAuthStore());
  const sedeGeneration = useSedeRefrendGeneration();

  const selectedYear         = ref<number>(new Date().getFullYear());
  const selectedMonth        = ref<number>(new Date().getMonth() + 1);
  const selectedCampus       = ref<string | null>(null);
  const selectedGenerationId = ref<number | null>(null);
  const generateDialog = ref<boolean>(false);
  const summaryDialog  = ref<boolean>(false);

  // Auto-select campus: if only one option available, pick it immediately
  watch(
    filteredCampus,
    (list: SelectOption[]) => {
      if (list.length > 0 && selectedCampus.value === null) {
        selectedCampus.value = list[0].value;
      }
    },
    { immediate: true },
  );

  const refrendList = computed<ScholarshipRefrend[]>(() => [
    ...refrends.value.values(),
  ]);

  const loadPeriod = async (): Promise<void> => {
    await store.fetchRefrends(selectedYear.value, selectedMonth.value, selectedCampus.value);
  };

  onBeforeMount(loadPeriod);

  const onPeriodChange = async (): Promise<void> => {
    await loadPeriod();
  };

  // sdd/verificacion-incidencias-ux PR3: "Generar ref." no longer targets a
  // single generación — it loops SEQUENTIALLY over every generación of the
  // selected sede (useSedeRefrendGeneration owns the loop/progress/
  // aggregation). The dialog stays open for the whole run (the view switches
  // its body to the progress text while `sedeGeneration.running` is true),
  // then closes and opens the summary dialog once the loop finishes. Table
  // refresh is the CALLER's responsibility (the view's own onPeriodChange,
  // which reads the incidencias* pair) — this composable has no opinion on
  // which table a given mode reads.
  const runSedeGeneration = async (): Promise<void> => {
    if (!selectedCampus.value) return;
    await sedeGeneration.run(selectedCampus.value, selectedYear.value, selectedMonth.value);
    generateDialog.value = false;
    summaryDialog.value = true;
  };

  return {
    selectedYear,
    selectedMonth,
    selectedCampus,
    selectedGenerationId,
    filteredCampus,
    generateDialog,
    summaryDialog,
    refrendList,
    onPeriodChange,
    // Per-sede sequential generation (PR3)
    sedeRunning: sedeGeneration.running,
    sedeProgressText: sedeGeneration.progressText,
    sedeSummaries: sedeGeneration.summaries,
    generationsForCampus: sedeGeneration.generationsForCampus,
    runSedeGeneration,
  };
}
