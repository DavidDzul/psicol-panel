<template>
  <div class="pedagogia-refrend-table-wrapper">
    <div class="table-header mb-3">
      <div class="d-flex align-center ga-2 flex-wrap">
        <!-- Identidad del periodo -->
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-map-marker-outline" size="16" color="primary" />
          <span class="text-subtitle-2 font-weight-bold">{{
            tableInfo.campus
          }}</span>
        </div>
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
          CERRAR REFRENDO {{ monthLabel }}
        </v-btn>

        <!-- Total -->
        <v-chip size="small" variant="tonal" color="grey-darken-1" label>
          <v-icon start size="13">mdi-account-group-outline</v-icon>
          {{ props.rows.length }} becarios
        </v-chip>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap mt-2">
        <v-select
          v-model="rowFilterMode"
          :items="ROW_FILTER_OPTIONS"
          label="Mostrar"
          variant="filled"
          density="compact"
          hide-details
          class="flex-0-0-auto"
          style="max-width: 200px"
        />
        <!-- Orthogonal to rowFilterMode: a becario can have both, either, or
             neither "con incidencia/retención" and "pago adelantado", so this
             is a separate selector that ANDs into displayRows instead of a
             third rowFilterMode value. -->
        <v-select
          v-model="advancePaymentOnly"
          :items="ADVANCE_PAYMENT_OPTIONS"
          label="Pago adelantado"
          variant="filled"
          density="compact"
          hide-details
          class="flex-0-0-auto"
          style="max-width: 200px"
        />
        <v-text-field
          v-model="searchQuery"
          placeholder="Buscar por nombre becario..."
          prepend-inner-icon="mdi-magnify"
          variant="filled"
          density="compact"
          hide-details
          clearable
          class="flex-1-1-auto"
          style="min-width: 220px"
        />

        <!-- Toggle de columnas opcionales (Monto mensual / Apoyo / Aumento
             temporal): las 3 ocultas por default, preferencia persistida en
             localStorage. -->
        <v-menu :close-on-content-click="false">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon="mdi-table-column"
              variant="text"
              density="comfortable"
              size="small"
              title="Columnas"
            />
          </template>
          <v-list density="compact" min-width="260">
            <v-list-subheader class="text-caption">
              Desglose informativo — ya incluido en Base
            </v-list-subheader>
            <v-list-item
              v-for="h in OPTIONAL_HEADERS"
              :key="h.key"
              @click="toggleColumn(h.key)"
            >
              <template #prepend>
                <v-checkbox-btn
                  :model-value="visibleOptionalColumns.includes(h.key)"
                  density="compact"
                />
              </template>
              <v-list-item-title class="text-body-2">{{
                h.title
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <div v-if="displayRows.length === 0 && !loading" class="text-center text-medium-emphasis pa-6">
      {{ emptyStateText }}
    </div>

    <!-- User feedback round 3: "prefiero que este como antes, ya que puedo ir
         desplegando u ocultando un grupo (generación) y no estar
         visualizando todos a la vez" — single v-data-table with Vuetify's
         native collapsible group-by (same pattern as AtencionRefrendTable's
         Incidencias variant), replacing the always-expanded
         one-table-per-generación layout from round 2. -->
    <v-data-table
      v-else
      :headers="headers"
      :items="displayRows"
      :loading="loading"
      :group-by="groupBy"
      class="elevation-1 pedagogia-refrend-table"
      :items-per-page="-1"
      hover
      item-value="refrend.id"
      :row-props="({ item }) => ({ class: rowClass(item) })"
    >
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
          <span class="font-weight-medium text-body-2">{{
            item.refrend.snapshot_name
          }}</span>
        </div>
      </template>

      <template #item.snapshot_scholarship_type="{ item }">
        <v-chip
          size="x-small"
          variant="tonal"
          label
          :color="scholarshipTypeColor(item.refrend.snapshot_scholarship_type)"
        >
          {{ item.refrend.snapshot_scholarship_type }}
        </v-chip>
      </template>

      <!-- ── REVISIÓN ─────────────────────────────────────────────────────── -->

      <template #item.workflow_status="{ item }">
        <div class="d-flex flex-column ga-1 py-2 justify-center align-center text-center">
          <StatusIcon
            :icon="statusChip(item.refrend).icon"
            :color="statusChip(item.refrend).color"
            :label="statusChip(item.refrend).label"
          />
          <span
            v-if="resolutionCauseLabel(item.refrend)"
            class="text-caption text-medium-emphasis"
            style="max-width: 90px"
          >
            {{ resolutionCauseLabel(item.refrend) }}
          </span>
        </div>
      </template>

      <template #item.pending_withholding_amount="{ item }">
        <PendingWithholdingChip :row="item" />
      </template>

      <!-- Incidencia cruda: botón que abre un modal con el texto completo, no
           texto inline ni tooltip (ver IncidentDetailIcon.vue). -->
      <template #item.incident_description="{ item }">
        <div class="d-flex justify-center">
          <IncidentDetailIcon
            :text="item.incident_description"
            title="Incidencia (Atención a Becarios)"
          />
        </div>
      </template>

      <template #item.pedagogia="{ item }">
        <v-btn
          :prepend-icon="
            item.refrend.pedagogia_observations
              ? 'mdi-school'
              : 'mdi-school-outline'
          "
          size="x-small"
          variant="tonal"
          :color="item.refrend.pedagogia_observations ? 'gray' : 'purple'"
          :disabled="!canPedagogia(item.refrend)"
          @click="openPedagogiaDialog(item)"
        >
          {{ item.refrend.pedagogia_observations ? "Visualizar" : "Registrar" }}
        </v-btn>
      </template>

      <!-- ── ECONÓMICO ────────────────────────────────────────────────────── -->

      <!-- Columnas opcionales (ocultas por default): desglose informativo
           que ya está incluido en "Base" — ver amountOrDash() por la
           nulabilidad asimétrica entre estos campos, y monthlyAmount() por
           cómo se deriva "Monto mensual" sin un campo de backend propio. -->
      <template #item.monthly_amount="{ item }">
        <span class="text-caption text-medium-emphasis">{{
          amountOrDash(monthlyAmount(item.refrend))
        }}</span>
      </template>

      <template #item.snapshot_monto_apoyo="{ item }">
        <span class="text-caption text-medium-emphasis">{{
          amountOrDash(item.refrend.snapshot_monto_apoyo)
        }}</span>
      </template>

      <template #item.snapshot_temporary_increase_amount="{ item }">
        <v-tooltip
          v-if="item.refrend.snapshot_temporary_increase_reason"
          :text="item.refrend.snapshot_temporary_increase_reason"
          location="top"
        >
          <template #activator="{ props: tipProps }">
            <span v-bind="tipProps" class="text-caption text-medium-emphasis">
              {{ amountOrDash(item.refrend.snapshot_temporary_increase_amount) }}
            </span>
          </template>
        </v-tooltip>
        <span v-else class="text-caption text-medium-emphasis">
          {{ amountOrDash(item.refrend.snapshot_temporary_increase_amount) }}
        </span>
      </template>

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
          <RefrendSituationBar
            v-if="canRecordSituation(item.refrend)"
            :current-resolution="item.refrend.resolution_type ?? null"
            :resolution-chip="statusChip(item.refrend)"
            :locked="!canRecordSituation(item.refrend)"
            :workflow-status="item.refrend.workflow_status"
            :has-attendance-discount="
              item.has_retardos_discount || item.has_falta_discount
            "
            :loading="situationLoadingId === item.refrend.id"
            @approve-full="onApproveFullPayment(item)"
            @clear-resolution="onClearResolution(item)"
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
      :final-amount="activeRowDueAmount"
      @submit="onSituationSubmit"
    />
    <SituationDescuentoDefinitivoDialog
      v-model="situationDialogs.DESCUENTO_DEFINITIVO"
      :loading="situationSubmitLoading"
      :final-amount="activeRowDueAmount"
      @submit="onSituationSubmit"
    />
    <SituationPagoMesesDialog
      v-model="situationDialogs.PAGO_MESES"
      :loading="situationSubmitLoading"
      :user-id="activeRow?.refrend.user_id"
      :current-month-amount="activeRowDueAmount"
      :period-year="activeRow?.refrend.period_year"
      :period-month="activeRow?.refrend.period_month"
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

    <ConfirmationDialog ref="confirmationDialog" />

    <!-- Cerrar refrendo confirmation -->
    <v-dialog v-model="closeDraftsDialog" max-width="440">
      <v-card>
        <v-card-title class="pa-4">Cerrar refrendo</v-card-title>
        <v-card-text>
          <p>
            Esto aprobará al 100% <strong>{{ cleanDraftIds.length }}</strong>
            refrendo(s) en Borrador sin nada que analizar (sin incidencia y
            sin descuento de asistencia aplicado), pasándolos a estado
            <strong>Listo para pago</strong>. Son becarios sin ninguna
            observación pendiente, por lo que no requieren revisión de
            Pedagogía.
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
import { computed, ref, watch } from "vue";
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import IncidentDetailIcon from "@/components/scholarships/IncidentDetailIcon.vue";
import PendingWithholdingChip from "@/components/scholarships/PendingWithholdingChip.vue";
import StatusIcon from "@/components/scholarships/StatusIcon.vue";
import RefrendPedagogiaDialog from "@/components/scholarships/RefrendPedagogiaDialog.vue";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";
import SituationRetenidaDialog from "@/components/scholarships/SituationRetenidaDialog.vue";
import SituationDescuentoDefinitivoDialog from "@/components/scholarships/SituationDescuentoDefinitivoDialog.vue";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import SituationSuspendidaDialog from "@/components/scholarships/SituationSuspendidaDialog.vue";
import SituationBajaDialog from "@/components/scholarships/SituationBajaDialog.vue";
import SituationEgresadoDialog from "@/components/scholarships/SituationEgresadoDialog.vue";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import {
  BASE_HEADERS,
  buildTableInfo,
  filterRowsByName,
  fmt,
  MONTHS_ES,
  resolutionCauseLabel,
  rowClass,
  scholarshipTypeColor,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import { canPedagogia, canRecordSituation, computeDueAmount } from "@/utils/refrendActionability";
import { getCleanDraftIds } from "@/utils/refrendBulkClose";
import {
  uiPreferenceKey,
  useStoredPreference,
} from "@/composables/useStoredPreference";
import type {
  BulkRefrendRow,
  ResolutionType,
  PedagogiaResolveForm,
  RecordSituationForm,
} from "@/interfaces/scholarship";

// ── Props ──────────────────────────────────────────────────────────────────
//
// User feedback round 3: single v-data-table with Vuetify's native
// collapsible group-by on `refrend.snapshot_generation` (same mechanism as
// AtencionRefrendTable's Incidencias variant) — user can expand/collapse
// each generación group instead of seeing every group at once. Same prop
// surface as every prior round; the row-filter criterion below was widened
// to also include becarios with a pending withholding and no incidencia
// (spec "Criterio de inclusión de filas en Pedagogía").

const props = defineProps<{
  rows: BulkRefrendRow[];
  loading?: boolean;
  year: number;
  month: number;
}>();

const searchQuery = ref("");

// ── Row filter mode ────────────────────────────────────────────────────────
//
// "incidencias" (default) reproduces the original always-on filter byte for
// byte. "todos" shows every fetched row, still subject to the name search.

type RowFilterMode = "incidencias" | "todos";

const ROW_FILTER_OPTIONS = [
  { value: "incidencias", title: "Con incidencias" },
  { value: "todos", title: "Todos" },
] as const;

const rowFilterMode = ref<RowFilterMode>("incidencias");

// Orthogonal filter (see toolbar comment): defaults off, combines with
// rowFilterMode via AND, independent of the name search.
const ADVANCE_PAYMENT_OPTIONS = [
  { value: false, title: "Todos" },
  { value: true, title: "Solo pago adelantado" },
] as const;

const advancePaymentOnly = ref(false);

const displayRows = computed(() => {
  let rows =
    rowFilterMode.value === "todos"
      ? props.rows
      : props.rows.filter(
          (r) => r.incidents_count > 0 || r.pending_withholding_count > 0,
        );
  if (advancePaymentOnly.value) {
    rows = rows.filter((r) => r.advance_payment_eligible);
  }
  return filterRowsByName(rows, searchQuery.value);
});

const emptyStateText = computed(() => {
  if (advancePaymentOnly.value) {
    return rowFilterMode.value === "todos"
      ? "Sin becarios de pago adelantado en este periodo."
      : "Sin becarios de pago adelantado con incidencia o retención pendiente en este periodo.";
  }
  return rowFilterMode.value === "todos"
    ? "Sin becarios en este periodo."
    : "Sin becarios con incidencia o retención pendiente en este periodo.";
});

// ── Grouping (collapsible, Vuetify native group-by) ──────────────────────────

const groupBy = computed(() => [
  { key: "refrend.snapshot_generation", order: "asc" as const },
]);

// Vuetify arranca su Set interno de grupos abiertos vacío (todo colapsado).
// Abrimos cada grupo la primera vez que su header se monta; si el usuario lo
// colapsa manualmente después, no lo volvemos a forzar a abrir.
const autoOpenedGroupIds = new Set<string>();

// Cambiar de modo puede desmontar la tabla (v-else de la lista vacía) o
// alterar drásticamente qué grupos existen; Vuetify resetea su set interno de
// grupos abiertos en ese caso, pero autoOpenedGroupIds persiste y los grupos
// vuelven a aparecer colapsados sin este reset.
watch([rowFilterMode, advancePaymentOnly], () => autoOpenedGroupIds.clear());

// ── Table headers ──────────────────────────────────────────────────────────
//
// Split in three groups (design D5, D6) to open a slot for the optional
// columns (Monto mensual / Apoyo / Aumento temporal) right before "Base",
// without moving PEDAGOGIA_* headers into the shared useRefrendTableDisplay
// module — they stay local to this component, same as AtencionRefrendTable's
// own headers.

const PEDAGOGIA_REVIEW_HEADERS = [
  {
    title: "Incidencia",
    key: "incident_description",
    width: 100,
    align: "center" as const,
    sortable: false,
  },
  { title: "Respuesta", key: "pedagogia", width: 180, sortable: false },
];

// sortable: false on all three — "monthly_amount" is a derived value with no
// backing field at all, and the other two keys do not resolve against
// BulkRefrendRow (the field lives under `.refrend`); the explicit #item.*
// slot renders each fine, but Vuetify's internal sort would use the raw path
// and sort by `undefined`.
const OPTIONAL_HEADERS = [
  { title: "Monto mensual", key: "monthly_amount", width: 120, sortable: false },
  { title: "Apoyo", key: "snapshot_monto_apoyo", width: 90, sortable: false },
  {
    title: "Aum. temporal",
    key: "snapshot_temporary_increase_amount",
    width: 115,
    sortable: false,
  },
] as const;

const PEDAGOGIA_AMOUNT_HEADERS = [
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 80, sortable: false },
  { title: "Final", key: "projected_amount", width: 110, sortable: false },
  { title: "", key: "payment_verify", width: 160, sortable: false },
];

type OptionalColumnKey = (typeof OPTIONAL_HEADERS)[number]["key"];

// JSON.parse succeeding is not the same as the parsed value matching the
// expected shape (e.g. a legacy pair of booleans from a previous version) —
// this guard is the composable's isValid parameter.
const isOptionalColumnKeyList = (raw: unknown): raw is OptionalColumnKey[] =>
  Array.isArray(raw) &&
  raw.every((k) => OPTIONAL_HEADERS.some((h) => h.key === k));

const visibleOptionalColumns = useStoredPreference<OptionalColumnKey[]>(
  uiPreferenceKey("pedagogia-refrend-table", "optional-columns"),
  [],
  isOptionalColumnKeyList,
);

const toggleColumn = (key: OptionalColumnKey): void => {
  visibleOptionalColumns.value = visibleOptionalColumns.value.includes(key)
    ? visibleOptionalColumns.value.filter((k) => k !== key)
    : [...visibleOptionalColumns.value, key];
};

// Filtering OPTIONAL_HEADERS (rather than mapping from the stored array)
// keeps declaration order stable regardless of the order the user toggled
// them in, and silently discards unknown keys even if isValid were bypassed.
const headers = computed(() => [
  ...BASE_HEADERS,
  ...PEDAGOGIA_REVIEW_HEADERS,
  ...OPTIONAL_HEADERS.filter((h) =>
    visibleOptionalColumns.value.includes(h.key),
  ),
  ...PEDAGOGIA_AMOUNT_HEADERS,
]);

// Both snapshot fields are informational and can be legitimately empty, but
// with asymmetric nullability: snapshot_monto_apoyo persists as "0" when not
// applicable, snapshot_temporary_increase_amount persists as null. A single
// helper normalizes both to "—" so the same row never shows "$0.00" in one
// optional column and "—" in the other.
const amountOrDash = (value: string | null): string =>
  value !== null && Number(value) > 0 ? fmt(value) : "—";

// Derived "Monto mensual": snapshot_gross_amount, snapshot_monto_apoyo, and
// snapshot_temporary_increase_amount are all frozen at the same instant for a
// given period, so subtracting the other two components out of the gross
// always reconstructs the exact monthly base — the sum of the 3 optional
// columns is mathematically guaranteed to equal "Base" without a dedicated
// backend field, and without risk of drift if the calculation formula
// changes later.
//
// Edge case: older/incomplete refrends without a frozen snapshot_gross_amount
// fall back to base_amount in the "Base" cell (see #item.base_amount below),
// but there is nothing to derive Monto mensual from in that case — it renders
// "—" rather than a value that could silently disagree with "Base".
const monthlyAmount = (refrend: BulkRefrendRow["refrend"]): string | null => {
  if (refrend.snapshot_gross_amount === null) return null;
  const gross = Number(refrend.snapshot_gross_amount);
  const apoyo = Number(refrend.snapshot_monto_apoyo ?? 0);
  const increase = Number(refrend.snapshot_temporary_increase_amount ?? 0);
  return String(gross - apoyo - increase);
};

// ── Table title ────────────────────────────────────────────────────────────

const tableInfo = computed(() =>
  buildTableInfo(props.rows, props.year, props.month),
);

const monthLabel = computed(
  () => (MONTHS_ES[props.month - 1] ?? String(props.month)).toUpperCase(),
);

// ── Store ──────────────────────────────────────────────────────────────────

const store = useScholarshipStore();

// ── Active row state ───────────────────────────────────────────────────────

const activeRow = ref<BulkRefrendRow | null>(null);

// ── Confirmation dialog (shared component, ref + await open() pattern) ─────

const confirmationDialog = ref();

// Passed to SituationRetenidaDialog/SituationPagoMesesDialog instead of raw
// refrend.final_amount, which can carry a previous resolution's effect on
// this same refrend (see computeDueAmount's docblock).
const activeRowDueAmount = computed(() =>
  activeRow.value ? computeDueAmount(activeRow.value.refrend) : null,
);

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
  DESCUENTO_DEFINITIVO: false,
  PAGO_MESES: false,
  SUSPENDIDA: false,
  BAJA_DEFINITIVA: false,
  EGRESADO: false,
  REEMBOLSO_PARCIAL: false,
});
const situationSubmitLoading = ref(false);
const situationLoadingId = ref<number | null>(null);

// Tracks which situationDialogs entry is currently open so onSituationSubmit
// can close the exact dialog the user opened, instead of inferring it from
// the submitted resolution_type (fragile: SituationPagoMesesDialog can emit
// either BECA_MES or SIN_PAGO depending on its "pagar mes en curso" checkbox,
// and SIN_PAGO is also its own standalone dialog's key).
const activeSituationKey = ref<SituationKey | null>(null);

const openSituationDialog = (
  item: BulkRefrendRow,
  type: SituationKey,
): void => {
  activeRow.value = item;
  activeSituationKey.value = type;
  situationDialogs.value[type] = true;
};

// ── Cerrar refrendo (borradores sin nada que analizar) ──────────────────────
//
// `rows`/`displayRows` ya vienen filtradas a solo incidencias, así que un
// becario limpio nunca aparece ahí. Para saber cuántos hay que cerrar, hace
// falta leer `store.incidenciasRows` directo (fetch SIN filtrar) — mismo
// razonamiento que la tabla original. La condición de "limpio" en sí vive en
// `getCleanDraftIds` (`@/utils/refrendBulkClose`), portada VERBATIM y
// cubierta por tests unitarios (ver
// `src/utils/__tests__/refrendBulkClose.test.ts`).

const closingDrafts = ref(false);
const closeDraftsDialog = ref(false);

const cleanDraftIds = computed(() => getCleanDraftIds(store.incidenciasRows));

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
  const r = item.refrend;
  const hasAttendanceDiscount =
    item.has_retardos_discount || item.has_falta_discount;
  const academicPct = Number(r.snapshot_discount_percentage ?? 0);
  const academicClause =
    academicPct > 0
      ? ` Se mantiene el descuento académico del ${academicPct}%.`
      : "";
  // Only claim to forgive faltas/retardos when there's actually an active
  // discount to forgive — same reasoning as RefrendSituationBar's label.
  const forgivenessClause = hasAttendanceDiscount
    ? " Se perdonan sus faltas/retardos de este mes."
    : "";
  const body =
    `¿Confirmás pagar ${fmt(computeDueAmount(r))} a ${r.snapshot_name} ` +
    `(${MONTHS_ES[props.month - 1]} ${props.year})?${forgivenessClause}${academicClause}`;

  const confirmed = await confirmationDialog.value?.open({
    title: hasAttendanceDiscount ? "Pagar sin descuento por faltas" : "Aprobar",
    body,
  });
  if (!confirmed) return;

  situationLoadingId.value = item.refrend.id;
  try {
    await store.approveFullPayment(item.refrend.id);
  } finally {
    situationLoadingId.value = null;
  }
};

const onClearResolution = async (item: BulkRefrendRow): Promise<void> => {
  situationLoadingId.value = item.refrend.id;
  try {
    await store.clearRefrendResolution(item.refrend.id);
  } finally {
    situationLoadingId.value = null;
  }
};

const onSituationSubmit = async (form: RecordSituationForm): Promise<void> => {
  if (!activeRow.value) return;
  situationSubmitLoading.value = true;
  try {
    await store.recordPaymentSituation(activeRow.value.refrend.id, form);
    // Close the dialog the user actually opened (activeSituationKey), not
    // the one inferred from form.resolution_type — SituationPagoMesesDialog
    // can emit either BECA_MES or SIN_PAGO depending on its "pagar mes en
    // curso" checkbox, and inferring from SIN_PAGO would close the wrong
    // (standalone) dialog.
    if (activeSituationKey.value) {
      situationDialogs.value[activeSituationKey.value] = false;
      activeSituationKey.value = null;
    }
  } finally {
    situationSubmitLoading.value = false;
  }
};
</script>

<style scoped>
.pedagogia-refrend-table-wrapper {
  width: 100%;
}

.table-header {
  padding: 6px 2px;
}

.pedagogia-refrend-table :deep(thead tr th) {
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.pedagogia-refrend-table :deep(tr.row-pending td) {
  background-color: rgba(255, 193, 7, 0.06);
}
.pedagogia-refrend-table :deep(tr.row-incident td) {
  background-color: rgba(255, 152, 0, 0.08);
}

/* Columna fija (Becario): fondo sólido para ocultar las columnas que se
   deslizan por debajo al hacer scroll horizontal. */
.pedagogia-refrend-table :deep(.v-data-table-column--fixed) {
  background: rgb(var(--v-theme-surface));
  z-index: 3;
}
.pedagogia-refrend-table :deep(tr.row-pending .v-data-table-column--fixed) {
  background-color: rgb(255, 249, 235) !important;
}
.pedagogia-refrend-table :deep(tr.row-incident .v-data-table-column--fixed) {
  background-color: rgb(255, 248, 242) !important;
}

.pedagogia-refrend-table :deep(tbody tr td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
