import { defineStore, storeToRefs } from "pinia";
import { useRolesStore } from "@/stores/api/rolesStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useRolesPageStore = defineStore("rolesPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus } = storeToRefs(useAuthStore())
    const { resRoles } = storeToRefs(useRolesStore());

    const router = useRouter()

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Roles",
            disabled: true,
            href: "/roles",
        },
    ])

    const roles = computed(() => [...resRoles.value.values()])

    return {
        links,
        roles,
    };
});