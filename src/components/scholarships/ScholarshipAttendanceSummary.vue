<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <template v-if="summary">
      <!-- Semester header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div
            class="text-overline text-medium-emphasis"
            style="line-height: 1.2"
          >
            Periodo semestral
          </div>
          <div class="text-body-2 font-weight-medium">
            {{ dayjs(summary.semester_start).format("DD/MM/YYYY") }} —
            {{ dayjs(summary.semester_end).format("DD/MM/YYYY") }}
          </div>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip
            v-if="summary.late_unconsumed > 0"
            color="warning"
            variant="tonal"
            size="small"
            label
          >
            <v-icon start size="14">mdi-clock-outline</v-icon>
            {{ summary.late_unconsumed }} pendiente{{
              summary.late_unconsumed > 1 ? "s" : ""
            }}
          </v-chip>
          <v-chip
            v-if="summary.late_consumed > 0"
            color="error"
            variant="flat"
            size="small"
            label
          >
            <v-icon start size="14">mdi-alert-circle</v-icon>
            Penalización aplicada
          </v-chip>
        </div>
      </div>

      <!-- Stats grid: two sections -->
      <div class="stats-grid mb-4">
        <!-- Asistencia -->
        <div class="stats-section">
          <div class="stats-section-label">Asistencia</div>
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-value text-grey-darken-1">
                {{ summary.total }}
              </div>
              <div class="stat-label">Clases</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-success">{{ summary.present }}</div>
              <div class="stat-label">Presentes</div>
            </div>

            <div class="stat-item">
              <div class="stat-value text-blue">
                {{ summary.late_justified }}
              </div>
              <div class="stat-label">Ret. just.</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-blue">
                {{ summary.absent_justified }}
              </div>
              <div class="stat-label">F. just.</div>
            </div>
          </div>
        </div>

        <div class="stats-separator" />

        <!-- Incidencias -->
        <div class="stats-section">
          <div class="stats-section-label">Incidencias</div>
          <div class="stats-row">
            <div class="stat-item">
              <div
                class="stat-value"
                :class="
                  summary.absent_unjustified > 0
                    ? 'text-error'
                    : 'text-grey-darken-1'
                "
              >
                {{ summary.absent_unjustified }}
              </div>
              <div class="stat-label">Faltas</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-warning">{{ summary.late }}</div>
              <div class="stat-label">Retardos</div>
            </div>
            <div class="stat-item">
              <div
                class="stat-value"
                :class="
                  summary.late_consumed > 0
                    ? 'text-orange-darken-1'
                    : 'text-grey-darken-1'
                "
              >
                {{ summary.late_consumed }}
              </div>
              <div class="stat-label">R. Consumidos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Records table header -->
      <div class="d-flex align-center justify-space-between mb-2">
        <span
          class="text-caption font-weight-semibold text-uppercase text-medium-emphasis"
        >
          Registros del semestre
        </span>
        <v-chip size="x-small" variant="tonal" color="grey">
          {{ summary.records.length }} clases
        </v-chip>
      </div>

      <v-table density="compact" class="attendance-table rounded-lg" hover>
        <thead>
          <tr>
            <th class="text-caption font-weight-semibold">Clase</th>
            <th class="text-caption font-weight-semibold">Estado</th>
            <th class="text-caption font-weight-semibold">Observaciones</th>
            <th class="text-caption font-weight-semibold text-center">
              Ret. consumido
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="rec in sortedRecords"
            :key="rec.id"
            :class="rowClass(rec.status)"
          >
            <td style="max-width: 180px">
              <div class="text-body-2 font-weight-medium text-truncate">
                {{ rec.class_name ?? formatDate(rec.class_date) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(rec.class_date) }}
              </div>
            </td>
            <td>
              <v-chip
                :color="statusColor(rec.status)"
                size="x-small"
                label
                variant="tonal"
              >
                {{ statusLabel(rec.status) }}
              </v-chip>
            </td>
            <td style="max-width: 160px">
              <span
                v-if="rec.observations"
                class="text-caption text-truncate d-block"
                style="max-width: 155px"
              >
                {{ rec.observations }}
              </span>
              <span v-else class="text-disabled text-caption">—</span>
            </td>
            <td class="text-center">
              <v-icon
                v-if="rec.late_penalty_consumed"
                color="orange-darken-1"
                size="16"
              >
                mdi-circle-slice-8
              </v-icon>
              <span v-else class="text-disabled text-caption">—</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>

    <v-alert
      v-else-if="!loading"
      type="info"
      variant="tonal"
      density="compact"
      rounded="lg"
      icon="mdi-calendar-blank"
    >
      No hay registros de asistencia para este periodo.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type {
  AttendanceSummary,
  AttendanceSummaryRecord,
} from "@/interfaces/scholarship";
import dayjs from "dayjs";

const props = defineProps<{
  userId: number;
  year: number;
  month: number;
}>();

const store = useScholarshipStore();
const loading = ref<boolean>(false);
const summary = ref<AttendanceSummary | null>(null);

const load = async (): Promise<void> => {
  loading.value = true;
  summary.value =
    (await store.fetchAttendanceSummary(
      props.userId,
      props.year,
      props.month,
    )) ?? null;
  loading.value = false;
};

onMounted(load);
watch(() => `${props.userId}_${props.year}_${props.month}`, load);

// ── Computed ─────────────────────────────────────────────────────────────────

const sortedRecords = computed<AttendanceSummaryRecord[]>(() => {
  if (!summary.value) return [];
  return [...summary.value.records].sort((a, b) => {
    const da = a.class_date ? dayjs(a.class_date).valueOf() : 0;
    const db = b.class_date ? dayjs(b.class_date).valueOf() : 0;
    return da - db;
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: string | null): string => {
  if (!date) return "—";
  return dayjs(date).format("DD/MM/YYYY");
};

const rowClass = (status: string): string => {
  const map: Record<string, string> = {
    LATE: "row-late",
    JUSTIFIED_LATE: "row-late-justified",
    ABSENT: "row-absent",
    JUSTIFIED_ABSENCE: "row-justified",
  };
  return map[status] ?? "";
};

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
    JUSTIFIED_LATE: "Ret. justificado",
    ABSENT: "Falta",
    JUSTIFIED: "Justificada",
    JUSTIFIED_ABSENCE: "Ausencia just.",
  };
  return map[status] ?? status;
};
</script>

<style scoped>
/* ── Stats grid ────────────────────────────────────────────── */
.stats-grid {
  display: flex;
  align-items: stretch;
  gap: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  overflow: hidden;
}

.stats-section {
  flex: 1;
  padding: 8px 4px 10px;
}

.stats-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.45);
  text-align: center;
  margin-bottom: 6px;
}

.stats-separator {
  width: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  margin: 8px 0;
}

.stats-row {
  display: flex;
  align-items: stretch;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  position: relative;
  gap: 1px;
}

.stat-item + .stat-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  text-align: center;
  white-space: nowrap;
}

/* ── Table ─────────────────────────────────────────────────── */
.attendance-table :deep(thead tr th) {
  background: rgba(var(--v-theme-surface-variant), 0.5) !important;
  color: rgba(var(--v-theme-on-surface), 0.7);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.attendance-table :deep(tbody tr.row-late td) {
  background: rgba(var(--v-theme-warning), 0.04);
}

.attendance-table :deep(tbody tr.row-absent td) {
  background: rgba(var(--v-theme-error), 0.05);
}
</style>
