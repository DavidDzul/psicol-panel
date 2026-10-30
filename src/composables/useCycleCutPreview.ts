import { ref } from "vue";
import type { CycleCutPreview } from "@/interfaces/scholarship";

export type CycleCutReason = "BAJA_DEFINITIVA" | "EGRESADO";

// sdd/revertir-pago-adelantado S10 (R21/S53): loads the cut preview when a
// Baja/Egresado dialog opens. A monotonically increasing token discards any
// response that is not from the latest load()/reset(), so reopening the dialog
// for another refrend never shows the previous refrend's warning.
export function useCycleCutPreview(
  fetcher: (id: number, reason: CycleCutReason) => Promise<CycleCutPreview | null>,
) {
  const preview = ref<CycleCutPreview | null>(null);
  const loading = ref(false);
  let token = 0;

  const load = async (id: number, reason: CycleCutReason): Promise<void> => {
    const mine = ++token;
    preview.value = null;
    loading.value = true;
    const result = await fetcher(id, reason);
    if (mine !== token) return;
    preview.value = result;
    loading.value = false;
  };

  const reset = (): void => {
    token++;
    preview.value = null;
    loading.value = false;
  };

  return { preview, loading, load, reset };
}
