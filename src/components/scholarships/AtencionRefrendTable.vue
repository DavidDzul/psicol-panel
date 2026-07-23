<template>
  <div class="atencion-refrend-table-wrapper">
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
      class="elevation-1 atencion-refrend-table"
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
          <v-tooltip
            v-if="hasAcademicDiscount(item)"
            location="bottom"
            max-width="260"
          >
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

      <template #item.attendance_total="{ item }">
        <v-btn
          variant="text"
          size="x-small"
          color="primary"
          title="Ver detalle"
          @click="openDetailDrawer(item)"
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
            :disabled="!canAtencion(item.refrend)"
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

      <!-- Repurposed as drawer trigger (design ADR D2: pedagogia_readonly → drawer,
           full observations text now lives in RefrendDetailDrawer) -->
      <template #item.pedagogia_readonly="{ item }">
        <v-btn
          variant="text"
          size="x-small"
          :color="hasPedagogiaResponse(item) ? 'green' : 'primary'"
          title="Ver detalle"
          @click="openDetailDrawer(item)"
        >
          <v-icon size="13" start>{{
            hasPedagogiaResponse(item)
              ? "mdi-check-circle-outline"
              : "mdi-eye-outline"
          }}</v-icon>
          {{ hasPedagogiaResponse(item) ? "Revisado" : "Ver detalle" }}
        </v-btn>
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

    </v-data-table>

    <!-- ── Detail drawer (secondary/audit fields, design ADR D1) ───────────── -->
    <RefrendDetailDrawer
      v-model="detailDrawerOpen"
      :row="detailDrawerRow"
      :year="year"
      :month="month"
      :recalc-loading="!!detailDrawerRow && recalcLoading === detailDrawerRow.refrend.id"
      @recalculate="onRecalculate"
    />

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
import RefrendAtencionDialog from "@/components/scholarships/RefrendAtencionDialog.vue";
import RefrendDetailDrawer from "@/components/scholarships/RefrendDetailDrawer.vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import {
  BASE_HEADERS,
  buildTableInfo,
  filterRowsByName,
  resolutionCauseLabel,
  rowClass,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import { canAtencion } from "@/utils/refrendActionability";
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

// ── Academic discount helper (relocated chip, design ADR D2) ────────────────
// `attendance_impact` was removed entirely — fully redundant with
// `month_absent` + `semester_lates_unconsumed`, both already visible inline
// (see spec "Primary columns exclude redundant/noise fields").

const hasAcademicDiscount = (item: BulkRefrendRow): boolean =>
  !!item.refrend.snapshot_discount_percentage &&
  Number(item.refrend.snapshot_discount_percentage) > 0;

// ── Table headers ──────────────────────────────────────────────────────────

const ATENCION_COMPLETA_HEADERS = [
  { title: "Incidencia", key: "atencion", sortable: false },
  { title: "Clases", key: "attendance_total", width: 65, sortable: true },
  { title: "F.mes", key: "month_absent", width: 75, sortable: true },
  {
    title: "Ret.acum.",
    key: "semester_lates_unconsumed",
    width: 90,
    sortable: true,
  },
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

// ── Detail drawer (design ADR D1) ────────────────────────────────────────────
// Repurposes the former "Clases" attendance-dialog trigger as the shared
// row detail drawer trigger; also hosts the recalcular action (moved out of
// the row's action column) and the relocated profile_discount detail.

const detailDrawerOpen = ref(false);
const detailDrawerRow = ref<BulkRefrendRow | null>(null);

const openDetailDrawer = (item: BulkRefrendRow): void => {
  detailDrawerRow.value = item;
  detailDrawerOpen.value = true;
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
.atencion-refrend-table-wrapper {
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
.atencion-refrend-table :deep(.v-data-table-column--fixed) {
  background: rgb(var(--v-theme-surface));
  z-index: 3;
}
.atencion-refrend-table :deep(tr.row-pending .v-data-table-column--fixed) {
  background-color: rgb(255, 249, 235) !important;
}
.atencion-refrend-table :deep(tr.row-incident .v-data-table-column--fixed) {
  background-color: rgb(255, 248, 242) !important;
}

/* Sticky header */
.atencion-refrend-table :deep(thead tr th) {
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
.atencion-refrend-table :deep(tr.row-pending td) {
  background-color: rgba(255, 193, 7, 0.06);
}
.atencion-refrend-table :deep(tr.row-incident td) {
  background-color: rgba(255, 152, 0, 0.08);
}

/* Separador más visible entre filas */
.atencion-refrend-table :deep(tbody tr td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
