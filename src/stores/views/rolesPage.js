import { defineStore, storeToRefs } from "pinia";
import { useRolesStore } from "@/stores/api/rolesStore";
import { useAppStore } from "@/stores/app";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useRolesPageStore = defineStore("rolesPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus } = storeToRefs(useAuthStore())
    const { resRoles, resPermissions } = storeToRefs(useRolesStore());
    const { fetchPermissions, updateRole } = useRolesStore();

    const router = useRouter()

    const editItem = ref(undefined)
    const updateDialog = ref(false)
    const loading = ref(false)

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
    const permissions = computed(() => [...resPermissions.value.values()])

    const userPermissions = computed(() => permissions.value.filter((map) => map.type === 'USER'))

    const openUpdateDialog = (id) => {
        const data = resRoles.value.get(id);
        if (!data) return;
        editItem.value = { ...data };
        updateDialog.value = true;
    };

    onMounted(async () => {
        await fetchPermissions();
    });

    const onUpdateRole = async (form) => {
        loading.value = true
        try {
            if (form && editItem.value) {
                const res = await updateRole(form, editItem.value.id);
                if (res) {
                    updateDialog.value = false
                }
            }
        } catch (error) {
            console.log(error)
            loading.value = false
        }
        loading.value = false

    }

    return {
        links,
        roles,
        editItem,
        permissions,
        userPermissions,
        updateDialog,
        openUpdateDialog,
        onUpdateRole
    };
});