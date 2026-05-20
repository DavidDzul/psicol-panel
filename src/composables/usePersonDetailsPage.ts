import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { usePersonsStore } from "@/stores/api/personsStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useGenerationsStore } from "@/stores/api/generationStore";

import type { User, UserUpdateForm } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";
import type { PersonsMode } from "@/composables/usePersonsPage";

const ROUTE_CONFIG = {
  becarios: {
    prefix: "/becarios/",
    listLabel: "Usuarios",
    listHref: "/becarios",
    detailLabel: "Detalles del usuario",
    dialogTitle: "Actualizar usuario",
  },
  egresados: {
    prefix: "/egresados/",
    listLabel: "Usuarios",
    listHref: "/egresados",
    detailLabel: "Detalles del usuario",
    dialogTitle: "Actualizar usuario",
  },
} as const;

export function usePersonDetailsPage(mode: PersonsMode) {
  const config = ROUTE_CONFIG[mode];

  const personsStore = usePersonsStore();
  const { personDetails } = storeToRefs(personsStore);
  const { filteredCampus } = storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const route         = useRoute();
  const updateDialog  = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);

  const validateAndFetch = async (): Promise<void> => {
    if (!route.path.startsWith(config.prefix)) return;

    const id = parseInt(route.params.id as string, 10);
    if (isNaN(id) || id <= 0) {
      return;
    }

    try {
      await personsStore.showPerson(id);
    } catch {
      // personsStore.showPerson already calls showAlert on error
    }
  };

  onBeforeMount(validateAndFetch);
  watch(() => route.fullPath, validateAndFetch);

  const selectedPerson = computed<User | null>(() => personDetails.value);

  const generations = computed<Generation[]>(() => [
    ...resGenerations.value.values(),
  ]);

  const links = computed<LinkInterface[]>(() => [
    { title: "Inicio", disabled: false, href: "/" },
    { title: config.listLabel, disabled: false, href: config.listHref },
    {
      title: config.detailLabel,
      disabled: true,
      href: `${config.listHref}/:id`,
    },
  ]);

  const openUpdateDialog = (): void => {
    if (!selectedPerson.value) return;
    updateDialog.value = true;
  };

  const onUpdate = async (form: UserUpdateForm): Promise<void> => {
    if (!selectedPerson.value) return;
    loadingUpdate.value = true;
    try {
      const res = await personsStore.updatePerson(
        form,
        selectedPerson.value.id,
      );
      if (res) updateDialog.value = false;
    } catch {
      // personsStore.updatePerson already calls showAlert on error
    }
    loadingUpdate.value = false;
  };

  return {
    links,
    selectedPerson,
    updateDialog,
    loadingUpdate,
    generations,
    filteredCampus,
    dialogTitle: config.dialogTitle,
    openUpdateDialog,
    onUpdate,
  };
}
