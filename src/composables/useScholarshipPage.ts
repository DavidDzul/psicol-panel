import { computed, onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { ScholarshipRefrend, GeneratePeriodForm } from "@/interfaces/scholarship";

export function useScholarshipPage() {
  const store = useScholarshipStore();
  const { refrends } = storeToRefs(store);

  const selectedYear  = ref<number>(new Date().getFullYear());
  const selectedMonth = ref<number>(new Date().getMonth() + 1);
  const generating    = ref<boolean>(false);
  const generateDialog = ref<boolean>(false);

  const refrendList = computed<ScholarshipRefrend[]>(() => [
    ...refrends.value.values(),
  ]);

  const loadPeriod = async (): Promise<void> => {
    await store.fetchRefrends(selectedYear.value, selectedMonth.value);
  };

  onBeforeMount(loadPeriod);

  const onPeriodChange = async (): Promise<void> => {
    await loadPeriod();
  };

  const onGeneratePeriod = async (): Promise<void> => {
    generating.value = true;
    const form: GeneratePeriodForm = { year: selectedYear.value, month: selectedMonth.value };
    await store.generatePeriod(form);
    await loadPeriod();
    generating.value = false;
    generateDialog.value = false;
  };

  return {
    selectedYear,
    selectedMonth,
    generating,
    generateDialog,
    refrendList,
    onPeriodChange,
    onGeneratePeriod,
  };
}
