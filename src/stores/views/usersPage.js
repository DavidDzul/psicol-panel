import { defineStore, storeToRefs } from "pinia";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useUserStore } from "@/stores/api/usersStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useUserPageStore = defineStore("userPage", () => {
    const { setLoading } = useAppStore();

    const { filteredCampus, readUsers, createUsers, editUsers } = storeToRefs(useAuthStore())
    const { resGenerations } = storeToRefs(useGenerationsStore());
    const { resUsers } = storeToRefs(useUserStore())
    const { showUser, fetchUsers, createUser, updateUser } = useUserStore()

    const router = useRouter()
    const createDialog = ref(false)
    const updateDialog = ref(false)
    const editUser = ref(undefined)

    const loadingCreate = ref(false)
    const loadingUpdate = ref(false)

    onBeforeMount(async () => {
        await fetchUsers()
    })

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Becarios",
            disabled: true,
            href: "/becarios",
        },
    ])

    const users = computed(() => [...resUsers.value.values()])
    const generations = computed(() => [...resGenerations.value.values()])

    const openCreateDialog = () => {
        createDialog.value = true
    }

    const openUpdateDialog = (id) => {
        const user = resUsers.value.get(id)
        if (!user) return
        editUser.value = { ...user }
        updateDialog.value = true
    }

    const openUserDetail = (id) => {
        router.push("becarios/" + id)
    }

    const onSaveUser = async (form) => {
        loadingCreate.value = true
        if (form) {
            try {
                const res = await createUser(form);
                if (res) {
                    createDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingCreate.value = false
    };

    const onUpdateUser = async (form) => {
        if (!editUser.value) return
        loadingUpdate.value = true
        if (form) {
            try {
                const res = await updateUser(form, editUser.value.id);
                if (res) {
                    updateDialog.value = false
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadingUpdate.value = false
    };

    return {
        links,
        users,
        editUser,
        generations,
        updateDialog,
        createDialog,
        loadingCreate,
        filteredCampus,
        loadingUpdate,
        readUsers,
        createUsers,
        editUsers,
        openUserDetail,
        openUpdateDialog,
        openCreateDialog,
        onSaveUser,
        onUpdateUser,
    };
});