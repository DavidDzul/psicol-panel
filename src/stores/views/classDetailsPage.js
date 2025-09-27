import { defineStore, storeToRefs } from "pinia";
import { useClassStore } from "@/stores/api/classStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router"

export const useClassDetailsPageStore = defineStore("classDetailsPage", () => {
    const { setLoading } = useAppStore();
    const { classDetail,
        attendanceMap, } = storeToRefs(useClassStore())
    const { fetchClassDetais, fetchAttendancesByClass } = useClassStore()

    const router = useRouter()
    const route = useRoute();
    const loading = ref(false)

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Sesiones de F",
            disabled: true,
            href: "/clases",
        },
    ]);


    onBeforeMount(() => {
        validateAndFetDetails();
    });

    watch(
        () => route.fullPath,
        () => validateAndFetDetails()
    );

    const validateAndFetDetails = async () => {
        if (!route.path.startsWith("/clases/")) return;
        const id = parseInt(route.params.id, 10);
        if (isNaN(id) || id <= 0) {
            console.error("Invalid or missing ID in route:", route.params.id);
            loading.value = false;
            return;
        }

        try {
            await fetchClassDetais(id);
            await fetchAttendancesByClass(id)
            loading.value = true;
        } catch (error) {
            console.error("Error fetching class detail:", error);
            loading.value = false;
        }
    };

    const attendances = computed(() => [...attendanceMap.value.values()])


    return {
        links,
        loading,
        classDetail,
        attendances
    };
});
