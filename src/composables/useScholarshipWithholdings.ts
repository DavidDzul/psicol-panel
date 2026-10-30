import { ref } from "vue";
import axios from "@/axiosConfig";
import type { ScholarshipWithholding } from "@/interfaces/scholarship";
import type { ScholarshipWithholdingsResponse } from "@/interfaces/api";

// sdd/retenciones-pendientes S7 (R7.2): read-only ledger of every withholding
// (pending, paid and cancelled) of one user. Owns its loading/error state so
// the card can render the three states without touching the scholarship store.
export function useScholarshipWithholdings() {
  const rows = ref<ScholarshipWithholding[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const load = async (userId: number): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get<ScholarshipWithholdingsResponse>(
        `api/admin/users/${userId}/scholarship-withholdings`,
        { params: { status: "all" } },
      );
      rows.value = res.data.data;
    } catch {
      rows.value = [];
      error.value = "No se pudieron cargar las retenciones.";
    } finally {
      loading.value = false;
    }
  };

  return { rows, loading, error, load };
}
