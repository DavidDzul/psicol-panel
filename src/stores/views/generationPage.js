import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"

export const useGenerationsPageStore = defineStore("generationsPage", () => {
    const { setLoading } = useAppStore();
    const router = useRouter()

    const { resGenerations } = storeToRefs(useGenerationsStore());

    const generations = computed(() => [...resGenerations.value.values()])

    return {
        generations
    };
});