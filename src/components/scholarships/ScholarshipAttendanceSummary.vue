<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

    <template v-if="summary">
      <!-- Semester context -->
      <div class="text-caption text-medium-emphasis mb-3">
        Semestre: {{ summary.semester_start }} — {{ summary.semester_end }}
      </div>

      <!-- Stats grid -->
      <v-row dense class="mb-3">
        <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="4" md="3">
          <v-card variant="tonal" :color="stat.color" rounded="lg" class="text-center pa-2">
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            <div class="text-caption">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Retardos detail -->
      <v-alert
        v-if="summary.late_unconsumed > 0"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <strong>{{ summary.late_unconsumed }}</strong> retardo(s) no consumido(s) en el semestre — al acumular 2 se aplica descuento del 25%.
      </v-alert>

      <!-- Records table -->
      <v-expansion-panels v-model="showRecords" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title class="text-caption font-weight-medium">
            Ver registros detallados ({{ summary.records.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text class="pa-0">
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Retardo consumido</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rec in summary.records" :key="rec.id">
                  <td>{{ rec.class_date ?? '—' }}</td>
                  <td>
                    <v-chip :color="statusColor(rec.status)" size="x-small" label>
                      {{ statusLabel(rec.status) }}
                    </v-chip>
                  </td>
                  <td>
                    <v-icon v-if="rec.late_penalty_consumed" color="orange" size="small">mdi-check-circle</v-icon>
                    <span v-else class="text-medium-emphasis">—</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <v-alert v-else-if="!loading" type="info" variant="tonal" density="compact">
      No hay registros de asistencia para este periodo.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { AttendanceSummary } from "@/interfaces/scholarship";

const props = defineProps<{
  userId: number;
  year: number;
  month: number;
}>();

const store   = useScholarshipStore();
const loading = ref<boolean>(false);
const summary = ref<AttendanceSummary | null>(null);
const showRecords = ref<number | undefined>(undefined);

const load = async (): Promise<void> => {
  loading.value = true;
  summary.value = (await store.fetchAttendanceSummary(props.userId, props.year, props.month)) ?? null;
  loading.value = false;
};

onMounted(load);
watch(() => `${props.userId}_${props.year}_${props.month}`, load);

const stats = computed(() => {
  if (!summary.value) return [];
  const s = summary.value;
  return [
    { label: "Total clases", value: s.total, color: "grey" },
    { label: "Presentes", value: s.present, color: "success" },
    { label: "Retardos", value: s.late + s.late_justified, color: "warning" },
    { label: "Ret. consumidos", value: s.late_consumed, color: "orange" },
    { label: "Ret. pendientes", value: s.late_unconsumed, color: "error" },
    { label: "Faltas injust.", value: s.absent_unjustified, color: "error" },
    { label: "Faltas just.", value: s.absent_justified, color: "blue" },
  ];
});

const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    PRESENT: "success",
    LATE: "warning",
    JUSTIFIED_LATE: "blue",
    ABSENT: "error",
    JUSTIFIED: "blue",
    JUSTIFIED_ABSENCE: "blue",
  };
  return map[status] ?? "grey";
};

const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    PRESENT: "Presente",
    LATE: "Retardo",
    JUSTIFIED_LATE: "Retardo just.",
    ABSENT: "Falta",
    JUSTIFIED: "Justificada",
    JUSTIFIED_ABSENCE: "Ausencia just.",
  };
  return map[status] ?? status;
};
</script>
