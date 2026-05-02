import { defineStore, storeToRefs } from "pinia";
import { useUserStore } from "@/stores/api/usersStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useGenerationsStore } from "@/stores/api/generationStore";

import type { User, UserUpdateForm } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useUserDetailsPageStore = defineStore("userDetailsPage", () => {
  const { setLoading } = useAppStore();
  const { userProfile, filteredCampus } = storeToRefs(useAuthStore());

  const { resUserDetails } = storeToRefs(useUserStore());
  const { showUser, updateUser } = useUserStore();
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const route = useRoute();
  const loadUser = ref<boolean>(false);
  const updateDialog = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);

  onBeforeMount(() => {
    validateAndFetchUserDetail();
  });

  watch(
    () => route.fullPath,
    () => validateAndFetchUserDetail(),
  );

  const validateAndFetchUserDetail = async (): Promise<void> => {
    if (!route.path.startsWith("/becarios/")) return;

    const id = parseInt(route.params.id as string, 10);
    if (isNaN(id) || id <= 0) {
      console.error("Invalid or missing ID in route:", route.params.id);
      loadUser.value = false;
      return;
    }

    try {
      await showUser(id);
      loadUser.value = true;
    } catch (error) {
      console.error("Error fetching user detail:", error);
      loadUser.value = false;
    }
  };

  const selectedUser = computed<User | null>(() => resUserDetails.value);
  const generations = computed<Generation[]>(() => [
    ...resGenerations.value.values(),
  ]);

  const links = computed<LinkInterface[]>(() => [
    {
      title: "Inicio",
      disabled: false,
      href: "/",
    },
    {
      title: "Becarios",
      disabled: false,
      href: "/becarios",
    },
    {
      title: "Detalles del becario/a",
      disabled: true,
      href: "/becarios/:id",
    },
  ]);

  const openUpdateDialog = (): void => {
    if (!selectedUser.value) return;
    updateDialog.value = true;
  };

  const onUpdateUser = async (form: UserUpdateForm): Promise<void> => {
    if (!selectedUser.value) return;
    loadingUpdate.value = true;
    if (form) {
      try {
        const res = await updateUser(form, selectedUser.value.id);
        if (res) {
          updateDialog.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadingUpdate.value = false;
  };

  return {
    links,
    updateDialog,
    selectedUser,
    loadingUpdate,
    generations,
    filteredCampus,
    onUpdateUser,
    openUpdateDialog,
  };
});
