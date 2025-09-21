import { defineStore, storeToRefs } from "pinia";
import { useAttendanceStore } from "@/stores/api/attendanceStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

export const useAttendancePageStore = defineStore("attendancePage", () => {
    const { setLoading } = useAppStore();
    const { createCheckIn } = useAttendanceStore();

    const loading = ref(false)

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Empresas",
            disabled: true,
            href: "/empresas",
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
