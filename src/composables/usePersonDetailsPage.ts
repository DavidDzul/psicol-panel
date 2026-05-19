import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { usePersonsStore } from "@/stores/api/personsStore";
import { useAuthStore } from "@/stores/api/authStore";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useScholarshipDocumentsStore } from "@/stores/api/scholarshipDocumentsStore";

import type { User, UserUpdateForm } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";
import type { LinkInterface } from "@/interfaces/link.interface";
import type { PersonsMode } from "@/composables/usePersonsPage";
import type { StudentDocument } from "@/interfaces/scholarship";

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
  const docsStore    = useScholarshipDocumentsStore();
  const { personDetails } = storeToRefs(personsStore);
  const { documents }     = storeToRefs(docsStore);
  const { filteredCampus } = storeToRefs(useAuthStore());
  const { resGenerations } = storeToRefs(useGenerationsStore());

  const route         = useRoute();
  const updateDialog  = ref<boolean>(false);
  const uploadDialog  = ref<boolean>(false);
  const loadingUpdate = ref<boolean>(false);

  const validateAndFetch = async (): Promise<void> => {
    if (!route.path.startsWith(config.prefix)) return;

    const id = parseInt(route.params.id as string, 10);
    if (isNaN(id) || id <= 0) {
      return;
    }

    try {
      await personsStore.showPerson(id);
      // Cargar todos los documentos del becario (sin filtro de periodo)
      await docsStore.fetchDocuments(id);
    } catch {
      // personsStore.showPerson already calls showAlert on error
    }
  };

  onBeforeMount(validateAndFetch);
  watch(() => route.fullPath, validateAndFetch);

  const selectedPerson = computed<User | null>(() => personDetails.value);

  // Todos los documentos del becario seleccionado
  const userDocuments = computed<StudentDocument[]>(() => {
    const userId = selectedPerson.value?.id;
    if (!userId) return [];
    return [...documents.value.values()].filter((d) => d.user_id === userId);
  });

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

  const onUploadDocument = async (formData: FormData): Promise<void> => {
    await docsStore.uploadDocument(formData);
    uploadDialog.value = false;
  };

  const onAcceptDocument = async (docId: number): Promise<void> => {
    await docsStore.acceptDocument(docId);
  };

  const onRejectDocument = async (docId: number, reason: string): Promise<void> => {
    await docsStore.rejectDocument(docId, reason);
  };

  return {
    links,
    selectedPerson,
    updateDialog,
    uploadDialog,
    loadingUpdate,
    userDocuments,
    generations,
    filteredCampus,
    dialogTitle: config.dialogTitle,
    openUpdateDialog,
    onUpdate,
    onUploadDocument,
    onAcceptDocument,
    onRejectDocument,
  };
}
