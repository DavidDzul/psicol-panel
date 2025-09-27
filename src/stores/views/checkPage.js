import { defineStore, storeToRefs } from "pinia";
import { useCheckStore } from "@/stores/api/checkStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

export const useCheckPageStore = defineStore("checkPage", () => {
    const { setLoading } = useAppStore();
    const { createCheckIn } = useCheckStore();

    const loading = ref(false)

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
    ]);

    const onCreateCheckIn = async (code) => {
        loading.value = true;
        try {
            if (!code) throw new Error("Código QR vacío");
            const res = await createCheckIn({ token: code });
            return res;
        } catch (error) {
            loading.value = false;
            throw error;
        } finally {
            loading.value = false;
        }
    };


    return {
        links,
        loading,
        onCreateCheckIn
    };
});
