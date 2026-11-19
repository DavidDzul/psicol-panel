import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useBusinessSearchStore } from "@/stores/views/businessSearch";

const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;

/**
 * Shared business autocomplete state for the vacancy create dialogs.
 * Debounces the remote search and keeps the selected business in the list.
 */
export function useBusinessAutocomplete() {
  const searchStore = useBusinessSearchStore();
  const { businessList } = storeToRefs(searchStore);

  const searchQuery = ref("");
  const selectedBusiness = ref<number | null>(null);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, (newQuery) => {
    if (timeout) clearTimeout(timeout);

    if (!newQuery || newQuery.length < MIN_QUERY_LENGTH) {
      void searchStore.getBusiness(newQuery ?? "", selectedBusiness.value);
      return;
    }

    timeout = setTimeout(() => {
      void searchStore.getBusiness(newQuery, selectedBusiness.value);
    }, DEBOUNCE_MS);
  });

  return { searchQuery, selectedBusiness, businessList };
}
