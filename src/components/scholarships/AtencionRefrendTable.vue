<template>
  <div class="refrend-master-table-wrapper">
    <div class="table-header mb-3">
      <div class="d-flex align-center ga-2 flex-wrap">
        <!-- Identidad del periodo -->
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-map-marker-outline" size="16" color="primary" />
          <span class="text-subtitle-2 font-weight-bold">{{
            tableInfo.campus
          }}</span>
        </div>
        <v-chip size="x-small" variant="tonal" color="primary" label>
          {{ tableInfo.generation }}
        </v-chip>
        <v-chip size="x-small" variant="outlined" color="grey-darken-1" label>
          <v-icon start size="12">mdi-calendar-month-outline</v-icon>
          {{ tableInfo.period }}
        </v-chip>

        <v-spacer />

        <!-- Total -->
        <v-chip size="small" variant="tonal" color="grey-darken-1" label>
          <v-icon start size="13">mdi-account-group-outline</v-icon>
          {{ rows.length }} becarios
        </v-chip>
      </div>
    </div>

    <v-data-table
      :headers="headers"
      :items="displayRows"
      :loading="loading"
      :group-by="groupBy"
      class="elevation-1 refrend-master-table"
      :items-per-page="-1"
      hover
      item-value="refrend.id"
      :row-props="({ item }) => ({ class: rowClass(item) })"
    >
      <template #top>
        <div class="px-3 pt-3 pb-2">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar por nombre becario..."
            prepend-inner-icon="mdi-magnify"
            variant="filled"
            density="compact"
            hide-details
            clearable
          />
        </div>
      </template>

      <template
        v-if="viewVariant === 'incidencias'"
        #group-header="{ item, columns, toggleGroup, isGroupOpen }"
      >
        <tr
          @vue:mounted="
            !autoOpenedGroupIds.has(item.id) &&
            !isGroupOpen(item) &&
            (autoOpenedGroupIds.add(item.id), toggleGroup(item))
          "
        >
          <td :colspan="columns.length" class="group-header-row">
            <v-btn
              size="x-small"
              variant="text"
              :icon="
                isGroupOpen(item) ? 'mdi-chevron-down' : 'mdi-chevron-right'
              "
              @click="toggleGroup(item)"
            />
            <span class="text-caption font-weight-bold text-uppercase">
              {{ item.value ?? "Sin generación" }}
            </span>
          </td>
        </tr>
      </template>

      <template #bottom />
      <!-- ── IDENTIDAD ─────────────────────────────────────────────────────── -->

      <template #item.snapshot_name="{ item }">
        <div class="d-flex align-center ga-2 text-no-wrap py-1">
          <div class="d-flex flex-column">
            <span class="font-weight-medium text-body-2">{{
              item.refrend.snapshot_name
            }}</span>
          </div>
        </div>
      </template>

      <template #item.snapshot_campus="{ item }">
        <span class="text-caption">{{ item.refrend.snapshot_campus }}</span>
      </template>

      <template #item.snapshot_generation="{ item }">
        <span class="text-caption">{{
          item.refrend.snapshot_generation ?? "—"
        }}</span>
      </template>

      <!-- ── ASISTENCIAS ──────────────────────────────────────────────────── -->

      <template #item.profile_discount="{ item }">
        <template
          v-if="
            item.refrend.snapshot_discount_percentage &&
            Number(item.refrend.snapshot_discount_percentage) > 0
          "
        >
          <v-tooltip location="bottom" max-width="260">
            <template #activator="{ props: tp }">
              <v-chip
                v-bind="tp"
                size="x-small"
                color="orange-darken-1"
                variant="flat"
                label
              >
                - {{ item.refrend.snapshot_discount_percentage }}%
              </v-chip>
            </template>
            <div class="text-caption">
              <div v-if="item.refrend.snapshot_discount_reason">
                <span class="font-weight-bold">Motivo: </span>
                {{ item.refrend.snapshot_discount_reason }}
              </div>
            </div>
          </v-tooltip>
        </template>
        <span v-else class="text-caption text-disabled">—</span>
      </template>

      <template #item.attendance_total="{ item }">
        <v-btn
          variant="text"
          size="x-small"
          color="primary"
          title="Ver detalle de asistencias"
          @click="openAttendanceDetail(item)"
        >
          <v-icon size="13" start>mdi-calendar-check-outline</v-icon>
          {{ item.attendance_total }}
        </v-btn>
      </template>

      <!-- Faltas mes + Retardos acumulados combinados -->
      <template #item.month_absent="{ item }">
        <v-chip
          :color="item.month_absent >= 1 ? 'error' : 'default'"
          size="x-small"
          :variant="item.month_absent >= 1 ? 'flat' : 'text'"
          label
          >{{ item.month_absent }}</v-chip
        >
      </template>

      <template #item.semester_lates_unconsumed="{ item }">
        <v-chip
          :color="
            item.has_retardos_discount || item.semester_lates_unconsumed >= 2
              ? 'error'
              : item.semester_lates_unconsumed === 1
                ? 'warning'
                : 'default'
          "
          size="x-small"
          :variant="
            item.has_retardos_discount || item.semester_lates_unconsumed >= 1
              ? 'flat'
              : 'text'
          "
          label
          >{{
            item.has_retardos_discount ? 2 : item.semester_lates_unconsumed
          }}/2</v-chip
        >
      </template>

      <!-- Impacto en pago -->
      <template #item.attendance_impact="{ item }">
        <v-chip
          :color="attendanceImpact(item).color"
          size="x-small"
          :variant="
            attendanceImpact(item).color === 'success' ? 'text' : 'flat'
          "
          label
        >
          {{ attendanceImpact(item).label }}
        </v-chip>
      </template>

      <!-- ── REVISIÓN ─────────────────────────────────────────────────────── -->

      <template #item.workflow_status="{ item }">
        <div class="d-flex flex-column ga-1 py-2 justify-center text-center">
          <v-chip
            class="justify-center text-center"
            :color="statusChip(item.refrend).color"
            size="small"
            label
            variant="tonal"
          >
            {{ statusChip(item.refrend).label }}
          </v-chip>
          <span
            v-if="resolutionCauseLabel(item.refrend)"
            class="text-caption text-medium-emphasis"
            style="max-width: 155px"
          >
            {{ resolutionCauseLabel(item.refrend) }}
          </span>
        </div>
      </template>

      <template #item.atencion="{ item }">
        <div class="d-flex align-center ga-2">
          <v-btn
            :prepend-icon="
              hasPedagogiaResponse(item)
                ? 'mdi-eye-outline'
                : item.refrend.workflow_status === 'CON_INCIDENCIA'
                  ? 'mdi-flag'
                  : 'mdi-flag-outline'
            "
            size="x-small"
            :variant="
              hasPedagogiaResponse(item)
                ? 'tonal'
                : item.refrend.workflow_status === 'CON_INCIDENCIA'
                  ? 'tonal'
                  : 'tonal'
            "
            :color="
              hasPedagogiaResponse(item)
                ? 'grey'
                : item.refrend.workflow_status === 'CON_INCIDENCIA'
                  ? 'orange-darken-2'
                  : 'blue'
            "
            :disabled="
              !['DRAFT', 'CON_INCIDENCIA'].includes(
                item.refrend.workflow_status ?? '',
              )
            "
            @click="openAtencionDialog(item)"
          >
            {{
              hasPedagogiaResponse(item)
                ? "Visualizar"
                : item.refrend.workflow_status === "CON_INCIDENCIA"
                  ? "Editar"
                  : "Registrar"
            }}
          </v-btn>
          <span
            v-if="item.refrend.atencion_observations"
            class="text-caption text-medium-emphasis text-truncate"
            style="max-width: 100px"
            :title="item.refrend.atencion_observations"
            >{{ item.refrend.atencion_observations }}</span
          >
        </div>
      </template>

      <template #item.pedagogia_readonly="{ item }">
        <div
          v-if="item.refrend.pedagogia_observations"
          class="d-flex flex-column ga-1 py-1"
        >
          <v-tooltip location="bottom" max-width="300">
            <template #activator="{ props: tp }">
              <span
                v-bind="tp"
                class="text-caption text-medium-emphasis incident-text"
              >
                <v-icon size="xs" color="green"
                  >mdi-check-circle-outline</v-icon
                >
                {{ item.refrend.pedagogia_observations }}
              </span>
            </template>
            <div class="text-caption">
              <div class="font-weight-bold mb-1">Revisión Pedagogía</div>
              {{ item.refrend.pedagogia_observations }}
            </div>
          </v-tooltip>
        </div>
        <span v-else class="text-caption text-disabled">Sin revisión</span>
      </template>

      <template #item.notificado="{ item }">
        <v-checkbox
          :model-value="!!item.refrend.notified_at"
          color="teal"
          density="compact"
          hide-details
          :disabled="
            item.refrend.workflow_status !== 'LISTO_PARA_PAGO' ||
            notificadoLoading === item.refrend.id
          "
          @update:model-value="
            item.refrend.workflow_status === 'LISTO_PARA_PAGO' &&
            toggleNotificado(item, $event)
          "
        />
      </template>

      <!-- ── ACCIONES ─────────────────────────────────────────────────────── -->

      <template #item.atencion_actions="{ item }">
        <v-btn
          v-if="item.refrend.workflow_status === 'DRAFT'"
          :loading="recalcLoading === item.refrend.id"
          icon
          size="x-small"
          variant="text"
          color="teal"
          @click="onRecalculate(item)"
        >
          <v-icon size="16">mdi-refresh</v-icon>
          <v-tooltip activator="parent" location="top">Recalcular</v-tooltip>
        </v-btn>
      </template>
    </v-data-table>

    <!-- ── Dialog: detalle asistencias ──────────────────────────────────── -->
    <v-dialog v-model="attendanceDialogOpen" max-width="680" scrollable>
      <v-card v-if="attendanceDialogRow">
        <v-card-title class="text-subtitle-2 font-weight-medium pa-4 pb-2">
          Asistencias — {{ attendanceDialogRow.refrend.snapshot_name }}
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <ScholarshipAttendanceSummary
            :user-id="attendanceDialogRow.refrend.user_id"
            :year="year"
            :month="month"
          />
        </v-card-text>
        <v-card-actions class="justify-end pa-3">
          <v-btn variant="text" @click="attendanceDialogOpen = false"
            >Cerrar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Dialogs (mounted once) ────────────────────────────────────────── -->

    <RefrendAtencionDialog
      v-model="atencionOpen"
      :loading="atencionLoading"
      :clear-loading="clearFlagLoading === activeRow?.refrend.id"
      :initial-description="activeRow?.incident_description ?? null"
      :initial-category="(activeRow?.incident_category as any) ?? null"
      :readonly="!!activeRow?.refrend.pedagogia_observations"
      @submit="onAtencionSubmit"
      @remove="onClearFlagFromDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ScholarshipAttendanceSummary from "@/components/scholarships/ScholarshipAttendanceSummary.vue";
import RefrendAtencionDialog from "@/components/scholarships/RefrendAtencionDialog.vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import {
  BASE_HEADERS,
  buildTableInfo,
  filterRowsByName,
  resolutionCauseLabel,
  rowClass,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow, AtencionFlagForm } from "@/interfaces/scholarship";

// ── Props ──────────────────────────────────────────────────────────────────

const props = defineProps<{
  rows: BulkRefrendRow[];
  loading?: boolean;
  year: number;
  month: number;
  viewVariant?: "completa" | "incidencias";
}>();

const viewVariant = computed(() => props.viewVariant ?? "completa");

const searchQuery = ref("");

const displayRows = computed(() => {
  let rows = props.rows;
  if (viewVariant.value === "incidencias") {
    rows = rows.filter((r) => r.incidents_count > 0);
  }
  return filterRowsByName(rows, searchQuery.value);
});

// ── Grouping (Incidencias variant only) ─────────────────────────────────────
// Agrupa por la generación SNAPSHOTEADA en el refrendo de ese periodo,
// no por la generación actual del becario.
const groupBy = computed(() =>
  viewVariant.value === "incidencias"
    ? [{ key: "refrend.snapshot_generation", order: "asc" as const }]
    : [],
);

// ── Group expand/collapse (variante Incidencias) ────────────────────────────
// Vuetify arranca su Set interno de grupos abiertos vacío (todo colapsado).
// Abrimos cada grupo la primera vez que su header se monta; si el usuario lo
// colapsa manualmente después, no lo volvemos a forzar a abrir.
const autoOpenedGroupIds = new Set<string>();

// ── Table title ────────────────────────────────────────────────────────────

const tableInfo = computed(() =>
  buildTableInfo(props.rows, props.year, props.month),
);

// ── Store ──────────────────────────────────────────────────────────────────

const store = useScholarshipStore();

// ── Attendance impact helpers ───────────────────────────────────────────────

type ImpactInfo = { label: string; color: string };

const attendanceImpact = (item: BulkRefrendRow): ImpactInfo => {
  // Prioridad: descuentos ya aplicados en el refrendo (más preciso que conteos en vivo,
  // porque los retardos se marcan como consumidos al generar el refrendo).
  const hasFalta = item.has_falta_discount || item.month_absent >= 1;
  const hasRet =
    item.has_retardos_discount || item.semester_lates_unconsumed >= 2;
  if (hasFalta && hasRet) return { label: "Falta + Ret.", color: "error" };
  if (hasFalta) return { label: "Falta", color: "error" };
  if (hasRet) return { label: "Retardos acumulados", color: "error" };
  return { label: "", color: "success" };
};

// ── Table headers ──────────────────────────────────────────────────────────

const ATENCION_COMPLETA_HEADERS = [
  { title: "Incidencia", key: "atencion", sortable: false },
  {
    title: "Asist. Penalización",
    key: "attendance_impact",
    width: 150,
    sortable: false,
  },
  { title: "Desc. acad.", key: "profile_discount", width: 95, sortable: false },
  { title: "Clases", key: "attendance_total", width: 65, sortable: true },
  { title: "F.mes", key: "month_absent", width: 75, sortable: true },
  {
    title: "Ret.acum.",
    key: "semester_lates_unconsumed",
    width: 90,
    sortable: true,
  },
  { title: "", key: "atencion_actions", width: 50, sortable: false },
];

const ATENCION_INCIDENCIAS_HEADERS = [
  { title: "Incidencia", key: "atencion", sortable: false },
  {
    title: "R. Pedagogía",
    key: "pedagogia_readonly",
    width: 180,
    sortable: false,
  },
  { title: "¿Notificado?", key: "notificado", width: 65, sortable: false },
];

const headers = computed(() => [
  ...BASE_HEADERS,
  ...(viewVariant.value === "incidencias"
    ? ATENCION_INCIDENCIAS_HEADERS
    : ATENCION_COMPLETA_HEADERS),
]);

// ── Attendance detail dialog ────────────────────────────────────────────────

const attendanceDialogOpen = ref(false);
const attendanceDialogRow = ref<BulkRefrendRow | null>(null);

const openAttendanceDetail = (item: BulkRefrendRow): void => {
  attendanceDialogRow.value = item;
  attendanceDialogOpen.value = true;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const hasPedagogiaResponse = (item: BulkRefrendRow): boolean =>
  !!item.refrend.pedagogia_observations;

// ── Active row state ───────────────────────────────────────────────────────

const activeRow = ref<BulkRefrendRow | null>(null);

// ── Atencion dialog ────────────────────────────────────────────────────────

const atencionOpen = ref(false);
const atencionLoading = ref(false);

const openAtencionDialog = (item: BulkRefrendRow): void => {
  activeRow.value = item;
  atencionOpen.value = true;
};

const onAtencionSubmit = async (form: AtencionFlagForm): Promise<void> => {
  if (!activeRow.value) return;
  atencionLoading.value = true;
  try {
    await store.atencionFlag(activeRow.value.refrend.id, form);
    atencionOpen.value = false;
  } finally {
    atencionLoading.value = false;
  }
};

// ── Clear flag ─────────────────────────────────────────────────────────────

const clearFlagLoading = ref<number | null>(null);

const onClearFlag = async (item: BulkRefrendRow): Promise<void> => {
  clearFlagLoading.value = item.refrend.id;
  try {
    await store.clearFlag(item.refrend.id);
  } finally {
    clearFlagLoading.value = null;
  }
};

const onClearFlagFromDialog = async (): Promise<void> => {
  if (!activeRow.value) return;
  clearFlagLoading.value = activeRow.value.refrend.id;
  try {
    await store.clearFlag(activeRow.value.refrend.id);
    atencionOpen.value = false;
  } finally {
    clearFlagLoading.value = null;
  }
};

// ── Notificado toggle ──────────────────────────────────────────────────────

const notificadoLoading = ref<number | null>(null);

const toggleNotificado = async (
  item: BulkRefrendRow,
  value: boolean | null,
): Promise<void> => {
  notificadoLoading.value = item.refrend.id;
  try {
    await store.patchInline(item.refrend.id, {
      notified_at: value ? new Date().toISOString() : null,
      notification_method: value ? "EMAIL" : null,
    });
  } finally {
    notificadoLoading.value = null;
  }
};

// ── Recalculate ────────────────────────────────────────────────────────────

const recalcLoading = ref<number | null>(null);

const onRecalculate = async (item: BulkRefrendRow): Promise<void> => {
  recalcLoading.value = item.refrend.id;
  try {
    await store.recalculateRefrend(item.refrend.id);
  } finally {
    recalcLoading.value = null;
  }
};
</script>

<style scoped>
.incident-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 170px;
  cursor: default;
  line-height: 1.4;
}

.refrend-master-table-wrapper {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

/* Table info header */
.table-header {
  padding: 6px 2px;
}

/* Group header row (variante Incidencias, agrupado por snapshot_generation) */
.group-header-row {
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 4px 8px !important;
}

/* Columna fija: fondo sólido para ocultar el scroll */
.refrend-master-table :deep(.v-data-table-column--fixed) {
  background: rgb(var(--v-theme-surface));
  z-index: 3;
}
.refrend-master-table :deep(tr.row-pending .v-data-table-column--fixed) {
  background-color: rgb(255, 249, 235) !important;
}
.refrend-master-table :deep(tr.row-incident .v-data-table-column--fixed) {
  background-color: rgb(255, 248, 242) !important;
}

/* Sticky header */
.refrend-master-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

/* Filas con acción pendiente */
.refrend-master-table :deep(tr.row-pending td) {
  background-color: rgba(255, 193, 7, 0.06);
}
.refrend-master-table :deep(tr.row-incident td) {
  background-color: rgba(255, 152, 0, 0.08);
}

/* Separador más visible entre filas */
.refrend-master-table :deep(tbody tr td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
