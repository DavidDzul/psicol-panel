import { defineStore, storeToRefs } from "pinia";
import { useClassStore } from "@/stores/api/classStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router"

export const useClassDetailsPageStore = defineStore("classDetailsPage", () => {
    const { setLoading } = useAppStore();
    const { classDetail,
        attendanceMap, usersByFilters } = storeToRefs(useClassStore())
    const { fetchClassDetais, fetchAttendancesByClass, fetchUsersByFilters, assignUsers } = useClassStore()
    const { filteredCampus } = storeToRefs(useAuthStore())
    const { resGenerations } = storeToRefs(useGenerationsStore());

    const router = useRouter()
    const route = useRoute();
    const loading = ref(false)
    const assignDialog = ref(false)

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Sesiones de F",
            disabled: false,
            href: "/clases",
        },
        {
            title: "Detalles de sesión de F.",
            disabled: true,
            href: "/clases/:id",
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
    const generations = computed(() => [...resGenerations.value.values()])
    const users = computed(() => [...usersByFilters.value.values()])

    const openAssignDialog = () => {
        assignDialog.value = true
    }

    const searchUsers = async (form) => {
        if (!form) return
        await fetchUsersByFilters(form)
    }

    const onAssignUsersToClass = async (ids) => {
        if (!ids) return
        const form = { class_id: classDetail.value.id, user_ids: ids }
        const res = await assignUsers(form)
        if (res) {
            assignDialog.value = false

        }
    }

    return {
        links,
        loading,
        classDetail,
        attendances,
        assignDialog,
        filteredCampus,
        generations,
        users,
        searchUsers,
        assignUsers,
        openAssignDialog,
        onAssignUsersToClass
    };
});
