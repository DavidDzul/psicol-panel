<template>
  <v-card variant="outlined">
    <v-card-title class="d-flex align-center pa-3">
      <span class="text-subtitle-1 font-weight-bold">Documentos</span>
      <v-spacer />
      <v-btn
        size="small"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-upload"
        @click="$emit('upload')"
      >
        Subir
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-list v-if="documents.length > 0" lines="two">
        <v-list-item
          v-for="doc in documents"
          :key="doc.id"
          :subtitle="`v${doc.version} · ${formatSize(doc.file_size)}`"
        >
          <template #title>
            <span class="text-body-2 font-weight-medium">
              {{ docLabel(doc.document_type) }}
            </span>
          </template>
          <template #prepend>
            <v-icon :color="statusColor(doc.status)">
              {{ statusIcon(doc.status) }}
            </v-icon>
          </template>
          <template #append>
            <v-chip :color="statusColor(doc.status)" size="x-small" label class="mr-1">
              {{ statusLabel(doc.status) }}
            </v-chip>
            <v-btn
              v-if="doc.status === 'SUBMITTED'"
              icon="mdi-check"
              size="x-small"
              variant="text"
              color="success"
              @click="$emit('accept', doc.id)"
            />
            <v-btn
              v-if="doc.status === 'SUBMITTED'"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="openRejectDialog(doc.id)"
            />
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="pa-4 text-body-2 text-medium-emphasis">
        Sin documentos para este periodo.
      </div>
    </v-card-text>
  </v-card>

  <!-- Reject reason dialog -->
  <v-dialog v-model="rejectDialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="pa-4">Motivo de rechazo</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="rejectReason"
          label="Motivo"
          rows="3"
          variant="outlined"
          maxlength="1000"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="rejectDialog = false">Cancelar</v-btn>
        <v-btn
          color="error"
          variant="elevated"
          :disabled="!rejectReason.trim()"
          @click="submitReject"
        >
          Rechazar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { StudentDocument, DocumentType, DocumentStatus } from "@/interfaces/scholarship";

defineProps<{
  documents: StudentDocument[];
}>();

const emit = defineEmits<{
  upload: [];
  accept: [docId: number];
  reject: [docId: number, reason: string];
}>();

const rejectDialog  = ref<boolean>(false);
const rejectReason  = ref<string>("");
const rejectTargetId = ref<number>(0);

const openRejectDialog = (id: number): void => {
  rejectTargetId.value = id;
  rejectReason.value = "";
  rejectDialog.value = true;
};

const submitReject = (): void => {
  emit("reject", rejectTargetId.value, rejectReason.value.trim());
  rejectDialog.value = false;
};

const docLabel = (type: DocumentType): string => {
  const map: Record<DocumentType, string> = {
    CALIFICACIONES_ORIGINALES: "Calificaciones originales",
    CONSTANCIA_ESTUDIOS: "Constancia de estudios",
    COMPROBANTE_PAGO: "Comprobante de pago",
    JUSTIFICANTE_MEDICO: "Justificante médico",
    OTRO: "Otro documento",
  };
  return map[type] ?? type;
};

const statusColor = (status: DocumentStatus): string => {
  const map: Record<DocumentStatus, string> = {
    PENDING: "grey",
    SUBMITTED: "blue",
    ACCEPTED: "green",
    REJECTED: "red",
  };
  return map[status] ?? "grey";
};

const statusIcon = (status: DocumentStatus): string => {
  const map: Record<DocumentStatus, string> = {
    PENDING: "mdi-clock-outline",
    SUBMITTED: "mdi-file-upload-outline",
    ACCEPTED: "mdi-check-circle",
    REJECTED: "mdi-close-circle",
  };
  return map[status] ?? "mdi-file";
};

const statusLabel = (status: DocumentStatus): string => {
  const map: Record<DocumentStatus, string> = {
    PENDING: "Pendiente",
    SUBMITTED: "Enviado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
  };
  return map[status] ?? status;
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
</script>
