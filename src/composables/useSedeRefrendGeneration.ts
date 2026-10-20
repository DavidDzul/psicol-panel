import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { isAxiosError } from "axios";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { useGenerationsStore } from "@/stores/api/generationStore";
import type { Generation } from "@/interfaces/generation";
import type { GenerationRunSummary } from "@/interfaces/scholarship";

// sdd/verificacion-incidencias-ux PR3 (design): loop ALL generaciones whose
// campus matches the selected sede, sorted by name — NOT gated by
// generation_active, since that flag isn't read by any backend logic and
// could silently skip real becarios (egreso grace window). Exported as a
// pure function so ordering/filtering is unit-testable without Pinia.
export const selectCampusGenerations = (
  generations: Generation[],
  campus: string,
): Generation[] =>
  generations
    .filter((generation) => generation.campus === campus)
    // String() guards against a DB that serves generation_name as a number;
    // numeric collation orders "2" before "19".
    .sort((a, b) =>
      String(a.generation_name).localeCompare(String(b.generation_name), undefined, {
        numeric: true,
      }),
    );

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; msg?: string }
      | undefined;
    return data?.message ?? data?.msg ?? "Error al generar refrendos.";
  }
  if (error instanceof Error) return error.message;
  return "Error de red.";
};

export function useSedeRefrendGeneration() {
  const store = useScholarshipStore();
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const running = ref<boolean>(false);
  const currentIndex = ref<number>(0);
  const total = ref<number>(0);
  const currentGenerationName = ref<string | null>(null);
  const summaries = ref<GenerationRunSummary[]>([]);

  const progressText = computed<string | null>(() => {
    if (!running.value || total.value === 0) return null;
    return `Generando ${currentIndex.value} de ${total.value}: ${currentGenerationName.value ?? ""}…`;
  });

  const generationsForCampus = (campus: string): Generation[] =>
    selectCampusGenerations([...resGenerations.value.values()], campus);

  // Sequential by design: a Promise.all here would fan out N concurrent
  // generate requests for the same sede/period, which is unnecessary load
  // and makes per-generación progress reporting meaningless. One request in
  // flight at a time; a rejected request is recorded and the loop CONTINUES
  // to the next generación instead of aborting (spec: partial failure must
  // not stop the loop).
  const run = async (
    campus: string,
    year: number,
    month: number,
  ): Promise<GenerationRunSummary[]> => {
    const generations = generationsForCampus(campus);
    const results: GenerationRunSummary[] = [];

    running.value = true;
    currentIndex.value = 0;
    total.value = generations.length;
    summaries.value = [];

    try {
      for (const generation of generations) {
        currentIndex.value += 1;
        currentGenerationName.value = generation.generation_name;

        try {
          const result = await store.generatePeriod({
            year,
            month,
            campus,
            generation_id: generation.id,
          });
          results.push({
            generationId: generation.id,
            generationName: generation.generation_name,
            result,
          });
        } catch (error: unknown) {
          results.push({
            generationId: generation.id,
            generationName: generation.generation_name,
            requestError: extractErrorMessage(error),
          });
        }
      }
    } finally {
      running.value = false;
      currentGenerationName.value = null;
    }

    summaries.value = results;
    return results;
  };

  return {
    running,
    currentIndex,
    total,
    currentGenerationName,
    progressText,
    summaries,
    generationsForCampus,
    run,
  };
}
