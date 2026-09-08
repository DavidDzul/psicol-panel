<template>
  <div>
    <div v-if="!logs || logs.length === 0" class="text-medium-emphasis text-caption pa-2">
      Sin historial de acciones registradas.
    </div>

    <v-timeline v-else density="compact" side="end" class="timeline-compact">
      <v-timeline-item
        v-for="log in sortedLogs"
        :key="log.id"
        :dot-color="actionColor(log.action)"
        size="small"
      >
        <template #opposite>
          <span class="text-caption text-medium-emphasis">{{ formatDate(log.created_at) }}</span>
        </template>

        <v-card variant="flat" class="pa-0">
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip :color="actionColor(log.action)" size="x-small" label>
              {{ actionLabel(log.action) }}
            </v-chip>
            <span v-if="log.performed_by" class="text-caption text-medium-emphasis">
              por {{ log.performed_by.first_name }} {{ log.performed_by.last_name }}
            </span>
          </div>
          <div v-if="log.notes" class="text-body-2 mt-1">{{ log.notes }}</div>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ScholarshipRefrendLog } from "@/interfaces/scholarship";

const props = defineProps<{
  logs: ScholarshipRefrendLog[];
}>();

const sortedLogs = computed<ScholarshipRefrendLog[]>(() =>
  [...props.logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
);

const actionLabel = (action: string): string => {
  const map: Record<string, string> = {
    atencion_review:  "Rev. Verificación",
    pedagogia_review: "Rev. Aprobación",
    authorized:       "Autorizado",
    paid:             "Pagado",
    withheld:         "Retenido",
    generated:        "Generado",
    cancelled:        "Cancelado",
  };
  return map[action] ?? action;
};

const actionColor = (action: string): string => {
  const map: Record<string, string> = {
    atencion_review:  "blue",
    pedagogia_review: "purple",
    authorized:       "green",
    paid:             "teal",
    withheld:         "orange",
    generated:        "grey",
    cancelled:        "red",
  };
  return map[action] ?? "grey";
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.timeline-compact :deep(.v-timeline-item__body) {
  padding-bottom: 8px;
}
</style>
