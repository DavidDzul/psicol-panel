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

        <!-- Cerrar refrendo (borradores sin nada que analizar) -->
        <v-btn
          v-if="cleanDraftIds.length > 0"
          color="red"
          variant="elevated"
          size="small"
          :loading="closingDrafts"
          :disabled="closingDrafts"
          @click="closeDraftsDialog = true"
        >
          Cerrar refrendo
        </v-btn>

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

      <template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
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

      <template #item.incident_description="{ item }">
        <v-tooltip
          v-if="item.incident_description"
          location="bottom"
          max-width="320"
          :text="item.incident_description"
        >
          <template #activator="{ props: tp }">
            <span
              v-bind="tp"
              class="text-caption text-medium-emphasis incident-text"
            >
              {{ item.incident_description }}
            </span>
          </template>
        </v-tooltip>
        <span v-else class="text-disabled text-caption">—</span>
      </template>

      <template #item.pedagogia="{ item }">
        <v-btn
          :prepend-icon="
            item.refrend.pedagogia_observations
              ? 'mdi-school'
              : 'mdi-school-outline'
          "
          size="x-small"
          :variant="item.refrend.pedagogia_observations ? 'tonal' : 'tonal'"
          :color="item.refrend.pedagogia_observations ? 'gray' : 'purple'"
          :disabled="!canPedagogia(item.refrend.workflow_status)"
          @click="openPedagogiaDialog(item)"
        >
          {{ item.refrend.pedagogia_observations ? "Visualizar" : "Registrar" }}
        </v-btn>
      </template>

      <!-- ── ECONÓMICO ────────────────────────────────────────────────────── -->

      <template #item.base_amount="{ item }">
        <div class="d-flex flex-column">
          <span class="text-caption">{{
            fmt(item.refrend.snapshot_gross_amount ?? item.refrend.base_amount)
          }}</span>
          <div
            v-if="
              item.refrend.snapshot_discount_percentage &&
              Number(item.refrend.snapshot_discount_percentage) > 0
            "
            class="d-flex align-center ga-1 mt-1"
          >
            <span class="text-caption text-orange-darken-1">
              - {{ item.refrend.snapshot_discount_percentage }}%
            </span>
          </div>
        </div>
      </template>

      <template #item.discount_pct="{ item }">
        <span
          class="text-caption"
          :class="
            Number(item.refrend.discount_percentage) > 0
              ? 'text-error'
              : 'text-medium-emphasis'
          "
          >{{ item.refrend.discount_percentage }}%</span
        >
      </template>

      <template #item.projected_amount="{ item }">
        <div class="d-flex flex-column">
          <span class="text-caption font-weight-medium">{{
            fmt(item.refrend.final_amount)
          }}</span>
          <template
            v-if="Number(item.refrend.amount_pending_from_previous) > 0"
          >
            <span class="text-caption text-teal-darken-1">
              + {{ fmt(item.refrend.amount_pending_from_previous) }} ret.
            </span>
            <span class="text-caption font-weight-bold text-teal-darken-2">
              = {{ fmt(item.refrend.total_to_pay) }}
            </span>
          </template>
          <template
            v-else-if="Number(item.refrend.refund_amount_from_previous) > 0"
          >
            <span class="text-caption text-green-darken-1">
              + {{ fmt(item.refrend.refund_amount_from_previous!) }} reemb.
            </span>
            <span class="text-caption font-weight-bold text-green-darken-2">
              = {{ fmt(item.refrend.total_to_pay) }}
            </span>
          </template>
        </div>
      </template>

      <!-- ── ACCIONES ─────────────────────────────────────────────────────── -->

      <template #item.payment_verify="{ item }">
        <div class="d-flex align-center ga-1">
          <!-- situación especial: barra de resolución -->
          <RefrendSituationBar
            v-if="!isLocked(item.refrend)"
            :current-resolution="item.refrend.resolution_type ?? null"
            :locked="isLocked(item.refrend)"
            :amount-pending="item.refrend.amount_pending_from_previous"
            :workflow-status="item.refrend.workflow_status"
            :loading="situationLoadingId === item.refrend.id"
            @approve-full="onApproveFullPayment(item)"
            @approve-as-is="onApproveAsIs(item)"
            @open="(type) => openSituationDialog(item, type)"
          />
        </div>
      </template>
    </v-data-table>

    <!-- ── Dialogs (mounted once) ────────────────────────────────────────── -->

    <RefrendPedagogiaDialog
      v-model="pedagogiaOpen"
      :loading="pedagogiaLoading"
      :clear-loading="clearPedagogiaLoading === activeRow?.refrend.id"
      :atencion-observations="activeRow?.refrend.atencion_observations ?? null"
      :initial-comment="activeRow?.refrend.pedagogia_observations ?? null"
      @submit="onPedagogiaSubmit"
      @remove="onClearPedagogiaFromDialog"
    />

    <SituationSinPagoDialog
      v-model="situationDialogs.SIN_PAGO"
      :loading="situationSubmitLoading"
      @submit="onSituationSubmit"
    />
    <SituationRetenidaDialog
      v-model="situationDialogs.RETENIDA"
      :loading="situationSubmitLoading"
      @submit="onSituationSubmit"
    />
    <SituationPagoMesesDialog
      v-model="situationDialogs.PAGO_MESES"
      :loading="situationSubmitLoading"
      :amount-pending="activeRow?.refrend.amount_pending_from_previous"
      :base-amount="activeRow?.refrend.base_amount"
      @submit="onSituationSubmit"
    />
    <SituationSuspendidaDialog
      v-model="situationDialogs.SUSPENDIDA"
      :loading="situationSubmitLoading"
      @submit="onSituationSubmit"
    />
    <SituationBajaDialog
      v-model="situationDialogs.BAJA_DEFINITIVA"
      :loading="situationSubmitLoading"
      @submit="onSituationSubmit"
    />
    <SituationEgresadoDialog
      v-model="situationDialogs.EGRESADO"
      :loading="situationSubmitLoading"
      @submit="onSituationSubmit"
    />

    <!-- Cerrar refrendo confirmation -->
    <v-dialog v-model="closeDraftsDialog" max-width="440">
      <v-card>
        <v-card-title class="pa-4">Cerrar refrendo</v-card-title>
        <v-card-text>
          <p>
            Esto aprobará al 100% <strong>{{ cleanDraftIds.length }}</strong>
            refrendo(s) en Borrador sin nada que analizar (sin incidencia y
            sin descuento de asistencia aplicado), pasándolos a estado
            <strong>Listo para pago</strong>. No aparecen en esta tabla
            porque no tienen ninguna observación pendiente.
          </p>
          <v-alert type="warning" variant="tonal" density="compact" class="mt-3">
            Solo se cierran los becarios <strong>sin incidencia</strong>. Los
            que sí tienen una incidencia y todavía no tienen ninguna acción
            registrada sobre ella deben resolverse manualmente — este botón
            no los afecta.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeDraftsDialog = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="red"
            variant="elevated"
            :loading="closingDrafts"
            @click="onCloseCleanDrafts"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import RefrendPedagogiaDialog from "@/components/scholarships/RefrendPedagogiaDialog.vue";
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";
import SituationRetenidaDialog from "@/components/scholarships/SituationRetenidaDialog.vue";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import SituationSuspendidaDialog from "@/components/scholarships/SituationSuspendidaDialog.vue";
import SituationBajaDialog from "@/components/scholarships/SituationBajaDialog.vue";
import SituationEgresadoDialog from "@/components/scholarships/SituationEgresadoDialog.vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import {
  BASE_HEADERS,
  buildTableInfo,
  filterRowsByName,
  fmt,
  isLocked,
  resolutionCauseLabel,
  rowClass,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import type {
  BulkRefrendRow,
  WorkflowStatus,
  ResolutionType,
  PedagogiaResolveForm,
  RecordSituationForm,
} from "@/interfaces/scholarship";

// ── Props ──────────────────────────────────────────────────────────────────

const props = defineProps<{
  rows: BulkRefrendRow[];
  loading?: boolean;
  year: number;
  month: number;
}>();

const searchQuery = ref("");

// Pedagogía solo revisa becarios con incidencia del periodo, agrupados por
// la generación snapshoteada — equivalente a la variante "Incidencias" de
// Atención, pero sin UI para alternarla (ver ScholarshipRefrendsView, donde
// viewVariant queda fijo en "incidencias" para mode === "pedagogia").
const displayRows = computed(() => {
  const rows = props.rows.filter((r) => r.incidents_count > 0);
  return filterRowsByName(rows, searchQuery.value);
});

// ── Grouping ─────────────────────────────────────────────────────────────
// Agrupa por la generación SNAPSHOTEADA en el refrendo de ese periodo,
// no por la generación actual del becario.
const groupBy = [
  { key: "refrend.snapshot_generation", order: "asc" as const },
];

// ── Group expand/collapse ────────────────────────────────────────────────
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

// ── Table headers ──────────────────────────────────────────────────────────

const PEDAGOGIA_HEADERS = [
  {
    title: "Incidencia",
    key: "incident_description",
    width: 180,
    sortable: false,
  },
  { title: "Respuesta", key: "pedagogia", width: 180, sortable: false },
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 80, sortable: false },
  { title: "Final", key: "projected_amount", width: 110, sortable: false },
  { title: "", key: "payment_verify", width: 160, sortable: false },
];

const headers = [...BASE_HEADERS, ...PEDAGOGIA_HEADERS];

// ── Helpers ────────────────────────────────────────────────────────────────

const canPedagogia = (status: WorkflowStatus | null): boolean =>
  status === "CON_INCIDENCIA";

// ── Active row state ───────────────────────────────────────────────────────

const activeRow = ref<BulkRefrendRow | null>(null);

// ── Pedagogia dialog ───────────────────────────────────────────────────────

const pedagogiaOpen = ref(false);
const pedagogiaLoading = ref(false);
const clearPedagogiaLoading = ref<number | null>(null);

const openPedagogiaDialog = (item: BulkRefrendRow): void => {
  activeRow.value = item;
  pedagogiaOpen.value = true;
};

const onPedagogiaSubmit = async (form: PedagogiaResolveForm): Promise<void> => {
  if (!activeRow.value) return;
  pedagogiaLoading.value = true;
  try {
    await store.pedagogiaResolve(activeRow.value.refrend.id, form);
    pedagogiaOpen.value = false;
  } finally {
    pedagogiaLoading.value = false;
  }
};

const onClearPedagogiaFromDialog = async (): Promise<void> => {
  if (!activeRow.value) return;
  clearPedagogiaLoading.value = activeRow.value.refrend.id;
  try {
    await store.pedagogiaResolve(activeRow.value.refrend.id, { comment: null });
    pedagogiaOpen.value = false;
  } finally {
    clearPedagogiaLoading.value = null;
  }
};

// ── Situation dialogs ─────────────────────────────────────────────────────

type SituationKey = ResolutionType | "PAGO_MESES";

const situationDialogs = ref<Record<SituationKey, boolean>>({
  BECA_MES: false,
  SIN_PAGO: false,
  RETENIDA: false,
  PAGO_MESES: false,
  SUSPENDIDA: false,
  BAJA_DEFINITIVA: false,
  EGRESADO: false,
  REEMBOLSO_PARCIAL: false,
});
const situationSubmitLoading = ref(false);
const situationLoadingId = ref<number | null>(null);
const situationLoadingType = ref<SituationKey | null>(null);

const openSituationDialog = (
  item: BulkRefrendRow,
  type: SituationKey,
): void => {
  activeRow.value = item;
  situationDialogs.value[type] = true;
};

// ── Cerrar refrendo (borradores sin nada que analizar) ──────────────────────
// `rows`/`displayRows` ya vienen filtradas a solo incidencias (ver comentario
// de arriba), así que un becario limpio nunca aparece ahí. Para saber cuántos
// hay que cerrar, hace falta leer store.incidenciasRows directo (fetch SIN
// filtrar). "Limpio" = sin incidencia formal Y sin descuento automático de
// asistencia ya aplicado (retardos/falta no generan incidencia, se aplican
// directo — ver AttendancePenaltyService), para no aprobar al 100% una fila
// que en realidad tiene un descuento silencioso sin revisar.
const closingDrafts = ref(false);
const closeDraftsDialog = ref(false);

const cleanDraftIds = computed(() =>
  store.incidenciasRows
    .filter(
      (r) =>
        r.refrend.workflow_status === "DRAFT" &&
        r.incidents_count === 0 &&
        !r.has_falta_discount &&
        !r.has_retardos_discount &&
        r.month_absent === 0 &&
        r.semester_lates_unconsumed < 2,
    )
    .map((r) => r.refrend.id),
);

const onCloseCleanDrafts = async (): Promise<void> => {
  closingDrafts.value = true;
  try {
    await store.bulkApprove(cleanDraftIds.value);
    closeDraftsDialog.value = false;
  } finally {
    closingDrafts.value = false;
  }
};

const onApproveFullPayment = async (item: BulkRefrendRow): Promise<void> => {
  situationLoadingId.value = item.refrend.id;
  try {
    await store.approveFullPayment(item.refrend.id);
  } finally {
    situationLoadingId.value = null;
  }
};

const onApproveAsIs = async (item: BulkRefrendRow): Promise<void> => {
  situationLoadingId.value = item.refrend.id;
  try {
    await store.atencionApprove(item.refrend.id);
  } finally {
    situationLoadingId.value = null;
  }
};

const onSituationSubmit = async (form: RecordSituationForm): Promise<void> => {
  if (!activeRow.value) return;
  situationSubmitLoading.value = true;
  try {
    await store.recordPaymentSituation(activeRow.value.refrend.id, form);
    const key =
      form.carryover_months_count && form.resolution_type === "BECA_MES"
        ? "PAGO_MESES"
        : (form.resolution_type as SituationKey);
    situationDialogs.value[key] = false;
  } finally {
    situationSubmitLoading.value = false;
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

/* Group header row (agrupado por snapshot_generation) */
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
