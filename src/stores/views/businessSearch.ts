import { defineStore } from "pinia";
import { ref } from "vue";
import { useBusinessStore } from "@/stores/api/businessStore";

import type { BusinessSearchItem } from "@/interfaces/business";

const MIN_QUERY_LENGTH = 3;

export const useBusinessSearchStore = defineStore("businessSearchPage", () => {
  const businessList = ref<BusinessSearchItem[]>([]);
  const { searchBusiness } = useBusinessStore();
  let requestSeq = 0;

  // The autocomplete renders the raw model value when it is not in `items`,
  // so the selected business must always stay in the list.
  const withSelected = (
    items: BusinessSearchItem[],
    selected: BusinessSearchItem | undefined,
  ): BusinessSearchItem[] => {
    if (!selected || items.some((b) => b.user_id === selected.user_id)) {
      return items;
    }
    return [selected, ...items];
  };

  const getBusiness = async (
    query: string | null,
    selectedId: number | null,
  ): Promise<void> => {
    const seq = ++requestSeq;
    const selected =
      selectedId === null
        ? undefined
        : businessList.value.find((b) => b.user_id === Number(selectedId));

    if (!query || query.length < MIN_QUERY_LENGTH) {
      businessList.value = withSelected([], selected);
      return;
    }

    try {
      const res = await searchBusiness(query);
      if (seq !== requestSeq || !res) return;
      const items = res.businesses.map((b) => ({
        ...b,
        id: Number(b.id),
        user_id: Number(b.user_id),
      }));
      businessList.value = withSelected(items, selected);
    } catch (error) {
      console.error(error);
    }
  };

  return { getBusiness, businessList };
});
