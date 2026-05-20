<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-3"
    />

    <!-- Toolbar: type filter -->
    <div class="d-flex align-center flex-wrap ga-3 mb-3">
      <v-select
        v-model="typeFilter"
        :items="typeFilterOptions"
        label="Filtrar por tipo"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        style="max-width: 220px"
      />
    </div>

    <!-- Table -->
    <v-table v-if="filteredDocuments.length > 0" density="compact">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Observaciones</th>
          <th>Archivo</th>
          <th>Subido</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in filteredDocuments" :key="doc.id">
          <td>
            <div class="text-body-2 font-weight-medium">
              {{
                doc.document_type === "OTRO" && doc.description
                  ? doc.description
                  : docLabel(doc.document_type)
              }}
            </div>
            <div
              v-if="doc.document_type === 'OTRO' && doc.description"
              class="text-caption text-medium-emphasis"
            >
              {{ docLabel("OTRO") }}
            </div>
          </td>
          <td class="text-caption" style="max-width: 200px">
            <span
              v-if="doc.observations"
              :title="doc.observations"
              class="d-block text-truncate"
            >
              {{ doc.observations }}
            </span>
            <span v-else class="text-medium-emphasis">—</span>
          </td>
          <td class="text-caption">
            <div>{{ doc.original_name }}</div>
            <div class="text-medium-emphasis">
              {{ formatSize(doc.file_size) }}
            </div>
          </td>
          <td class="text-caption text-no-wrap">
            {{ formatDate(doc.created_at) }}
          </td>
          <td class="text-right text-no-wrap">
            <v-btn
              v-if="doc.file_path"
              icon
              size="small"
              variant="text"
              color="primary"
              :href="fileUrl(doc.file_path)"
              target="_blank"
            >
              <v-icon size="small">mdi-eye</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="openEdit(doc)">
              <v-icon size="small">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              @click="openDeleteConfirm(doc)"
            >
              <v-icon size="small">mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div v-else-if="!loading" class="text-body-2 text-medium-emphasis pa-2">
      Sin documentos{{ typeFilter ? " para este tipo" : "" }}.
    </div>
  </div>

  <!-- Upload dialog -->
  <ScholarshipDocumentUploadDialog
    v-model="uploadDialog"
    :user-id="userId"
    :period-year="periodYear"
    :period-month="periodMonth"
    :loading="uploading"
    @upload="onUpload"
  />

  <!-- Edit dialog -->
  <v-dialog v-model="editDialog" max-width="480" persistent>
    <v-card v-if="editTarget">
      <v-card-title class="pa-4">Editar documento</v-card-title>
      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-3">
          {{ editTarget.original_name }}
        </div>
        <v-select
          v-model="editForm.document_type"
          :items="typeFilterOptions"
          label="Tipo de documento"
          variant="outlined"
          density="compact"
          class="mb-3"
        />
        <v-text-field
          v-if="editForm.document_type === 'OTRO'"
          v-model="editForm.description"
          label="Descripción del documento"
          variant="outlined"
          density="compact"
          maxlength="255"
          class="mb-3"
        />
        <v-textarea
          v-model="editForm.observations"
          label="Observaciones (opcional)"
          variant="outlined"
          density="compact"
          rows="3"
          maxlength="2000"
          auto-grow
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :loading="editSaving"
          @click="onEditSave"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete confirm dialog -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card v-if="deleteTarget">
      <v-card-title class="pa-4">Eliminar documento</v-card-title>
      <v-card-text>
        ¿Estás seguro de eliminar
        <strong>{{ docLabel(deleteTarget.document_type) }}</strong>
        ({{ deleteTarget.original_name }})? Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
        <v-btn
          color="error"
          variant="elevated"
          :loading="deleting"
          @click="onDeleteConfirm"
        >
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { API_URL } from "@/constants";
import { useScholarshipDocumentsStore } from "@/stores/api/scholarshipDocumentsStore";
import ScholarshipDocumentUploadDialog from "@/components/scholarships/ScholarshipDocumentUploadDialog.vue";
import type { StudentDocument, DocumentType } from "@/interfaces/scholarship";

const props = defineProps<{
  userId: number;
  periodYear: number;
  periodMonth: number;
}>();

const store = useScholarshipDocumentsStore();
const loading = ref(false);
const uploading = ref(false);
const editSaving = ref(false);
const deleting = ref(false);

const uploadDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);

const typeFilter = ref<DocumentType | null>(null);
const editTarget = ref<StudentDocument | null>(null);
const deleteTarget = ref<StudentDocument | null>(null);

const editForm = reactive<{
  document_type: DocumentType | "";
  description: string;
  observations: string;
}>({
  document_type: "",
  description: "",
  observations: "",
});

// ── Data ──────────────────────────────────────────────────────────────────────

const documents = computed<StudentDocument[]>(() =>
  [...store.documents.values()].filter((d) => d.user_id === props.userId),
);

const filteredDocuments = computed<StudentDocument[]>(() =>
  typeFilter.value
    ? documents.value.filter((d) => d.document_type === typeFilter.value)
    : documents.value,
);

onMounted(async () => {
  loading.value = true;
  await store.fetchDocuments(props.userId);
  loading.value = false;
});

// ── Upload ────────────────────────────────────────────────────────────────────

const onUpload = async (formData: FormData): Promise<void> => {
  uploading.value = true;
  const result = await store.uploadDocument(formData);
  if (result) await store.fetchDocuments(props.userId);
  uploading.value = false;
  uploadDialog.value = false;
};

// ── Edit ──────────────────────────────────────────────────────────────────────

const openEdit = (doc: StudentDocument): void => {
  editTarget.value = doc;
  editForm.document_type = doc.document_type;
  editForm.description = doc.description ?? "";
  editForm.observations = doc.observations ?? "";
  editDialog.value = true;
};

const onEditSave = async (): Promise<void> => {
  if (!editTarget.value) return;
  editSaving.value = true;
  await store.updateDocument(editTarget.value.id, {
    document_type: editForm.document_type || undefined,
    description:
      editForm.document_type === "OTRO"
        ? editForm.description.trim() || null
        : null,
    observations: editForm.observations.trim() || null,
  });
  editSaving.value = false;
  editDialog.value = false;
};

// ── Delete ────────────────────────────────────────────────────────────────────

const openDeleteConfirm = (doc: StudentDocument): void => {
  deleteTarget.value = doc;
  deleteDialog.value = true;
};

const onDeleteConfirm = async (): Promise<void> => {
  if (!deleteTarget.value) return;
  deleting.value = true;
  await store.deleteDocument(deleteTarget.value.id);
  deleting.value = false;
  deleteDialog.value = false;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const docLabel = (type: DocumentType): string => {
  const map: Record<DocumentType, string> = {
    CONSTANCIA_ESTUDIOS: "Constancia de estudios",
    COMPROBANTE_PAGO: "Comprobante de pago",
    JUSTIFICANTE_MEDICO: "Justificante médico",
    OTRO: "Otro documento",
  };
  return map[type] ?? type;
};

const formatSize = (bytes: number | null | undefined): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fileUrl = (path: string): string => API_URL + "storage/" + path;

const typeFilterOptions = [
  { title: "Constancia de estudios", value: "CONSTANCIA_ESTUDIOS" },
  { title: "Comprobante de pago", value: "COMPROBANTE_PAGO" },
  { title: "Justificante médico", value: "JUSTIFICANTE_MEDICO" },
  { title: "Otro documento", value: "OTRO" },
];

const openUpload = (): void => { uploadDialog.value = true; };

defineExpose({ openUpload });
</script>
