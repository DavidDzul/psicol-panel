<template>
  <div>
    <div v-if="!documents.length" class="text-caption text-medium-emphasis">
      Sin documentos registrados para este periodo.
    </div>

    <v-list v-else density="compact" lines="one">
      <v-list-item
        v-for="doc in documents"
        :key="doc.id"
        :title="docTypeLabel(doc.document_type)"
        :subtitle="doc.original_name"
      >
        <template #append>
          <v-chip
            :color="statusColor(doc.status)"
            size="x-small"
            label
          >
            {{ statusLabel(doc.status) }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="pendingCount > 0" class="mt-2">
      <v-alert
        type="warning"
        variant="tonal"
        density="compact"
        :text="`${pendingCount} documento(s) pendiente(s) de entrega.`"
      />
    </div>
    <div v-else-if="rejectedCount > 0" class="mt-2">
      <v-alert
        type="error"
        variant="tonal"
        density="compact"
        :text="`${rejectedCount} documento(s) rechazado(s).`"
      />
    </div>
    <div v-else-if="documents.length > 0" class="mt-2">
      <v-alert
        type="success"
        variant="tonal"
        density="compact"
        text="Todos los documentos están completos."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { StudentDocument, DocumentType, DocumentStatus } from "@/interfaces/scholarship";

const props = defineProps<{
  documents: StudentDocument[];
}>();

const pendingCount = computed(
  () => props.documents.filter((d) => d.status === "PENDING" || d.status === "SUBMITTED").length
);

const rejectedCount = computed(
  () => props.documents.filter((d) => d.status === "REJECTED").length
);

const docTypeLabel = (type: DocumentType): string => {
  const map: Record<DocumentType, string> = {
    CONSTANCIA_ESTUDIOS: "Constancia de estudios",
    COMPROBANTE_PAGO: "Comprobante de pago",
    JUSTIFICANTE_MEDICO: "Justificante médico",
    OTRO: "Otro",
  };
  return map[type] ?? type;
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

const statusColor = (status: DocumentStatus): string => {
  const map: Record<DocumentStatus, string> = {
    PENDING: "grey",
    SUBMITTED: "blue",
    ACCEPTED: "success",
    REJECTED: "error",
  };
  return map[status] ?? "grey";
};
</script>
