import { computed, onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useAuthStore } from "@/stores/api/authStore";
import type { ScholarshipRefrend, GeneratePeriodForm } from "@/interfaces/scholarship";
import type { SelectOption } from "@/constants";

export function useScholarshipPage() {
  const store = useScholarshipStore();
  const { refrends } = storeToRefs(store);
  const { filteredCampus } = storeToRefs(useAuthStore());

  const selectedYear         = ref<number>(new Date().getFullYear());
  const selectedMonth        = ref<number>(new Date().getMonth() + 1);
  const selectedCampus       = ref<string | null>(null);
  const selectedGenerationId = ref<number | null>(null);
  const advancePaymentOnly   = ref<boolean>(false);
  const generating     = ref<boolean>(false);
  const generateDialog = ref<boolean>(false);

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

  const onGeneratePeriod = async (): Promise<void> => {
    generating.value = true;
    const form: GeneratePeriodForm = {
      year: selectedYear.value,
      month: selectedMonth.value,
      campus: selectedCampus.value!,
      generation_id: selectedGenerationId.value!,
    };
    await store.generatePeriod(form);
    await loadPeriod();
    generating.value = false;
    generateDialog.value = false;
  };

  return {
    selectedYear,
    selectedMonth,
    selectedCampus,
    selectedGenerationId,
    advancePaymentOnly,
    filteredCampus,
    generating,
    generateDialog,
    refrendList,
    onPeriodChange,
    onGeneratePeriod,
  };
}
