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
        <v-chip
          v-if="semesterBadge"
          :color="semesterBadge.color"
          variant="flat"
          size="small"
          label
        >
          <v-icon start size="14">{{ semesterBadge.icon }}</v-icon>
          {{ semesterBadge.label }}
        </v-chip>
      </div>

      <!-- Stats strip -->
      <div class="stat-strip mb-4">
        <div v-for="(stat, i) in stats" :key="stat.label" class="stat-item">
          <div class="text-h6 font-weight-bold" :class="`text-${stat.color}`">
            {{ stat.value }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
          <v-divider
            v-if="i < stats.length - 1"
            vertical
            class="stat-divider"
          />
        </div>
      </div>

      <!-- Records table -->
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
            <th class="text-caption font-weight-semibold">Fecha</th>
            <th class="text-caption font-weight-semibold">Día</th>
            <th class="text-caption font-weight-semibold">Estado</th>
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
            <td class="text-body-2 font-weight-medium">
              {{ formatDate(rec.class_date) }}
            </td>
            <td class="text-caption text-medium-emphasis">
              {{ formatDay(rec.class_date) }}
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

const stats = computed(() => {
  if (!summary.value) return [];
  const s = summary.value;
  return [
    { label: "Clases", value: s.total, color: "grey" },
    { label: "Presentes", value: s.present, color: "success" },
    { label: "Retardos", value: s.late + s.late_justified, color: "warning" },
    { label: "Consumidos", value: s.late_consumed, color: "orange" },
    {
      label: "Pendientes",
      value: s.late_unconsumed,
      color:
        s.late_unconsumed >= 2
          ? "error"
          : s.late_unconsumed === 1
            ? "warning"
            : "grey",
    },
    { label: "F. injust.", value: s.absent_unjustified, color: "error" },
    { label: "F. just.", value: s.absent_justified, color: "blue" },
  ];
});

const semesterBadge = computed<{
  label: string;
  color: string;
  icon: string;
} | null>(() => {
  if (!summary.value) return null;
  const s = summary.value;
  // Prioritize the consumed-penalty fact so the badge stays stable once a
  // penalty was applied this semester, even when late_unconsumed drops to 0.
  if (s.late_consumed > 0)
    return {
      label: "Penalización aplicada",
      color: "error",
      icon: "mdi-alert-circle",
    };
  if (s.late_unconsumed > 0)
    return {
      label: `${s.late_unconsumed} retardo${s.late_unconsumed > 1 ? "s" : ""} pendiente${s.late_unconsumed > 1 ? "s" : ""}`,
      color: "warning",
      icon: "mdi-clock-outline",
    };
  return null;
});

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

const formatDay = (date: string | null): string => {
  if (!date) return "";
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[dayjs(date).day()] ?? "";
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
.stat-strip {
  display: flex;
  align-items: stretch;
  gap: 0;
  /* background: rgba(var(--v-theme-surface-variant), 0.4); */
  border-radius: 10px;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 6px;
  position: relative;
  gap: 1px;
}

.stat-item + .stat-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}

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
