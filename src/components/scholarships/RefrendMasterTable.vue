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

        <!-- Bulk approve -->
        <v-btn
          v-if="mode === 'pedagogia' && cleanDraftIds.length > 0"
          color="green-darken-1"
          variant="elevated"
          size="small"
          :loading="bulkLoading"
          :disabled="bulkLoading"
          prepend-icon="mdi-check-all"
          rounded="lg"
          @click="onBulkApproveClean"
        >
          APROBAR {{ cleanDraftIds.length }} SIN OBS.
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

      <template #bottom />
      <!-- ── IDENTIDAD ─────────────────────────────────────────────────────── -->

      <template #item.snapshot_name="{ item }">
        <div class="d-flex align-center ga-2 text-no-wrap py-1">
          <div class="d-flex flex-column">
            <div class="d-flex align-center ga-1">
              <span class="font-weight-medium text-body-2">{{
                item.refrend.snapshot_name
              }}</span>
              <v-tooltip
                v-if="item.incidents_count > 0"
                location="bottom"
                max-width="280"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-icon
                    v-bind="tooltipProps"
                    :icon="
                      item.incidents_count >= 3
                        ? 'mdi-alert-circle'
                        : 'mdi-alert-circle-outline'
                    "
                    size="14"
                    :color="item.incidents_count >= 3 ? 'error' : 'warning'"
                  />
                </template>
                <div class="text-caption">
                  <div class="font-weight-bold mb-1">
                    {{ item.incidents_count }} incidencia(s)
                  </div>
                  <div v-if="item.incident_description">
                    {{ item.incident_description }}
                  </div>
                </div>
              </v-tooltip>
            </div>
            <div class="d-flex align-center ga-1 mt-1">
              <v-chip
                v-if="item.refrend.snapshot_scholarship_type"
                size="x-small"
                color="primary"
                variant="tonal"
                label
                >{{ item.refrend.snapshot_scholarship_type }}</v-chip
              >
            </div>
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
            item.has_retardos_discount
              ? item.attendance_late
              : item.semester_lates_unconsumed
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
        <v-chip
          :color="statusChip(item.refrend).color"
          size="small"
          label
          variant="tonal"
        >
          {{ statusChip(item.refrend).label }}
        </v-chip>
      </template>

      <template #item.resolution_cause_label="{ item }">
        <v-tooltip
          v-if="resolutionCauseLabel(item.refrend)"
          location="bottom"
          max-width="260"
          :text="resolutionCauseLabel(item.refrend)!"
        >
          <template #activator="{ props: tp }">
            <span
              v-bind="tp"
              class="text-caption text-medium-emphasis text-truncate d-block"
              style="max-width: 170px; cursor: default"
            >
              {{ resolutionCauseLabel(item.refrend) }}
            </span>
          </template>
        </v-tooltip>
        <span v-else class="text-caption text-disabled">—</span>
      </template>

      <template #item.atencion="{ item }">
        <div class="d-flex align-center ga-1">
          <v-btn
            icon="mdi-flag-outline"
            size="x-small"
            variant="text"
            color="blue"
            :disabled="
              !['DRAFT', 'CON_INCIDENCIA'].includes(
                item.refrend.workflow_status ?? '',
              )
            "
            :title="
              item.refrend.workflow_status === 'CON_INCIDENCIA'
                ? 'Editar incidencia'
                : 'Registrar incidencia'
            "
            @click="openAtencionDialog(item)"
          />
          <v-btn
            v-if="item.refrend.workflow_status === 'CON_INCIDENCIA'"
            :loading="clearFlagLoading === item.refrend.id"
            icon="mdi-flag-remove-outline"
            size="x-small"
            variant="text"
            color="orange-darken-2"
            title="Quitar incidencia (vuelve a Borrador)"
            @click="onClearFlag(item)"
          />
          <span
            v-if="item.refrend.atencion_observations"
            class="text-caption text-medium-emphasis text-truncate"
            style="max-width: 110px"
            :title="item.refrend.atencion_observations"
            >{{ item.refrend.atencion_observations }}</span
          >
        </div>
      </template>

      <template #item.pedagogia_readonly="{ item }">
        <div class="d-flex align-center ga-1">
          <v-icon
            icon="mdi-school-outline"
            size="18"
            :color="
              item.refrend.pedagogia_observations ? 'deep-purple' : 'disabled'
            "
          />
          <span
            v-if="item.refrend.pedagogia_observations"
            class="text-caption text-medium-emphasis text-truncate"
            style="max-width: 120px"
            :title="item.refrend.pedagogia_observations"
            >{{ item.refrend.pedagogia_observations }}</span
          >
        </div>
      </template>

      <template #item.pedagogia="{ item }">
        <div class="d-flex align-center ga-1">
          <v-btn
            icon="mdi-school-outline"
            size="x-small"
            variant="text"
            color="deep-purple"
            :disabled="!canPedagogia(item.refrend.workflow_status)"
            @click="openPedagogiaDialog(item)"
          />
          <span
            v-if="item.refrend.pedagogia_observations"
            class="text-caption text-medium-emphasis text-truncate"
            style="max-width: 120px"
            :title="item.refrend.pedagogia_observations"
            >{{ item.refrend.pedagogia_observations }}</span
          >
        </div>
      </template>

      <template #item.notificado="{ item }">
        <v-checkbox
          :model-value="!!item.refrend.notified_at"
          color="teal"
          density="compact"
          hide-details
          :disabled="
            mode === 'pedagogia' ||
            item.refrend.workflow_status !== 'LISTO_PARA_PAGO' ||
            notificadoLoading === item.refrend.id
          "
          @update:model-value="
            mode === 'atencion' &&
            item.refrend.workflow_status === 'LISTO_PARA_PAGO' &&
            toggleNotificado(item, $event)
          "
        />
      </template>

      <!-- ── ECONÓMICO ────────────────────────────────────────────────────── -->

      <template #item.base_amount="{ item }">
        <div class="d-flex flex-column">
          <span class="text-caption">{{ fmt(item.refrend.base_amount) }}</span>
          <div
            v-if="item.refrend.snapshot_discount_percentage"
            class="d-flex align-center ga-1 mt-1"
          >
            <span class="text-caption text-orange-darken-1">
              -{{ item.refrend.snapshot_discount_percentage }}%
            </span>
            <v-tooltip
              :text="
                item.refrend.snapshot_discount_reason ?? 'Sin motivo registrado'
              "
              location="bottom"
            >
              <template #activator="{ props }">
                <v-icon v-bind="props" size="12" color="orange-darken-1">
                  mdi-information-outline
                </v-icon>
              </template>
            </v-tooltip>
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
        <span class="text-caption font-weight-medium">{{
          fmt(item.refrend.final_amount)
        }}</span>
      </template>

      <!-- ── ACCIONES ─────────────────────────────────────────────────────── -->

      <template #item.payment_verify="{ item }">
        <div class="d-flex align-center ga-1">
          <!-- apply-or-not: DRAFT con consecuencia o CON_INCIDENCIA -->
          <v-btn
            v-if="
              item.refrend.workflow_status === 'CON_INCIDENCIA' ||
              (item.refrend.workflow_status === 'DRAFT' &&
                (item.has_falta_discount ||
                  item.has_retardos_discount ||
                  item.month_absent >= 1 ||
                  item.semester_lates_unconsumed >= 2 ||
                  item.incidents_count > 0))
            "
            :loading="approveLoading === item.refrend.id"
            size="small"
            variant="elevated"
            color="green"
            title="Aprobar pago al monto actual"
            @click="onApprove(item)"
          >
            <v-icon size="16" start>mdi-check</v-icon>
            Aprobar
          </v-btn>

          <!-- situación especial: barra de resolución -->
          <RefrendSituationBar
            v-if="!isLocked(item.refrend)"
            :current-resolution="item.refrend.resolution_type ?? null"
            :locked="isLocked(item.refrend)"
            :loading="
              situationLoadingId === item.refrend.id ||
              recalcLoading === item.refrend.id
            "
            @approve-full="onApproveFullPayment(item)"
            @open="(type) => openSituationDialog(item, type)"
          />
        </div>
      </template>

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
      :initial-description="activeRow?.incident_description ?? null"
      :initial-category="(activeRow?.incident_category as any) ?? null"
      @submit="onAtencionSubmit"
    />

    <RefrendPedagogiaDialog
      v-model="pedagogiaOpen"
      :loading="pedagogiaLoading"
      :atencion-observations="activeRow?.refrend.atencion_observations ?? null"
      :initial-comment="activeRow?.refrend.pedagogia_observations ?? null"
      @submit="onPedagogiaSubmit"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { campusMap } from "@/constants";
import ScholarshipAttendanceSummary from "@/components/scholarships/ScholarshipAttendanceSummary.vue";
import RefrendAtencionDialog from "@/components/scholarships/RefrendAtencionDialog.vue";
import RefrendPedagogiaDialog from "@/components/scholarships/RefrendPedagogiaDialog.vue";
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";
import SituationRetenidaDialog from "@/components/scholarships/SituationRetenidaDialog.vue";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import SituationSuspendidaDialog from "@/components/scholarships/SituationSuspendidaDialog.vue";
import SituationBajaDialog from "@/components/scholarships/SituationBajaDialog.vue";
import SituationEgresadoDialog from "@/components/scholarships/SituationEgresadoDialog.vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type {
  BulkRefrendRow,
  RefrendStatus,
  ScholarshipRefrend,
  WorkflowStatus,
  ResolutionType,
  AtencionFlagForm,
  PedagogiaResolveForm,
  RecordSituationForm,
} from "@/interfaces/scholarship";

// ── Props ──────────────────────────────────────────────────────────────────

const props = defineProps<{
  rows: BulkRefrendRow[];
  loading?: boolean;
  year: number;
  month: number;
  mode?: "atencion" | "pedagogia";
}>();

const mode = computed(() => props.mode ?? "atencion");

const searchQuery = ref("");

const displayRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.rows;
  return props.rows.filter((r) =>
    r.refrend.snapshot_name.toLowerCase().includes(q),
  );
});

// ── Table title ────────────────────────────────────────────────────────────

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const tableInfo = computed(() => {
  const first = props.rows[0]?.refrend;
  return {
    campus:
      campusMap.get(first?.snapshot_campus ?? "")?.text ??
      first?.snapshot_campus ??
      "—",
    generation: first?.snapshot_generation ?? "—",
    period: `${MONTHS_ES[props.month - 1] ?? props.month} ${props.year}`,
  };
});

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

const BASE_HEADERS = [
  {
    title: "Becario",
    key: "snapshot_name",
    fixed: true,
    minWidth: "200px",
    sortable: true,
  },
  { title: "Estado", key: "workflow_status", width: 160, sortable: false },
];

const ATENCION_HEADERS = [
  { title: "Atención a Becarios/as", key: "atencion", sortable: false },
  {
    title: "Pedagogía",
    key: "pedagogia_readonly",
    width: 180,
    sortable: false,
  },
  { title: "Notif.", key: "notificado", width: 65, sortable: false },
  {
    title: "Asist. Penalización",
    key: "attendance_impact",
    width: 150,
    sortable: false,
  },
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

const PEDAGOGIA_HEADERS = [
  { title: "Motivo", key: "resolution_cause_label", width: 180, sortable: false },
  { title: "Pedagogía", key: "pedagogia", width: 180, sortable: false },
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 80, sortable: false },
  { title: "Final", key: "projected_amount", width: 110, sortable: false },
  { title: "", key: "payment_verify", width: 160, sortable: false },
];

const headers = computed(() => [
  ...BASE_HEADERS,
  ...(mode.value === "atencion" ? ATENCION_HEADERS : PEDAGOGIA_HEADERS),
]);

// ── Attendance detail dialog ────────────────────────────────────────────────

const attendanceDialogOpen = ref(false);
const attendanceDialogRow = ref<BulkRefrendRow | null>(null);

const openAttendanceDetail = (item: BulkRefrendRow): void => {
  attendanceDialogRow.value = item;
  attendanceDialogOpen.value = true;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const LOCKED_STATUSES = new Set<RefrendStatus>([
  "PAID",
  "AUTHORIZED",
  "CANCELLED",
]);

const isLocked = (refrend: ScholarshipRefrend): boolean =>
  LOCKED_STATUSES.has(refrend.status) || refrend.workflow_status === "CLOSED";

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

const statusChip = (
  refrend: BulkRefrendRow["refrend"],
): { label: string; color: string } => {
  const s = refrend.workflow_status;
  const r = refrend.resolution_type;

  if (s === "DRAFT") return { label: "Borrador", color: "grey" };
  if (s === "CON_INCIDENCIA")
    return { label: "Con incidencia", color: "orange" };
  if (s === "PENDIENTE_NOTIFICACION")
    return { label: "Pend. notif.", color: "blue" };
  if (s === "CLOSED") return { label: "Pagado", color: "teal" };
  if (refrend.status === "CANCELLED") return { label: "Baja", color: "red-darken-3" };

  if (s === "LISTO_PARA_PAGO") {
    if (r === "SIN_PAGO") return { label: "Sin pago", color: "red" };
    if (r === "RETENIDA") return { label: "Retenida", color: "amber-darken-2" };
    if (r === "EGRESADO") return { label: "Egresado", color: "blue-grey" };
    if (r === "BAJA_DEFINITIVA")
      return { label: "Baja definitiva", color: "red-darken-3" };
    if (r === "SUSPENDIDA") {
      const pct = refrend.suspension_percentage ?? null;
      return {
        label: pct ? `Suspendido ${pct}%` : "Suspendido",
        color: "deep-orange",
      };
    }
    return { label: "Listo para pago", color: "green" };
  }

  return { label: s ?? "—", color: "grey" };
};

const CAUSE_LABELS: Record<string, string> = {
  FALTAS_FI:                              "Faltas a F.I.",
  SIN_ENTREVISTA_CALIFICACIONES:          "Sin entrevista de calificaciones",
  NO_ENTREGO_CALIFICACIONES_PROVISIONALES:"No entregó cal. provisionales",
  NO_ENTREGO_CALIFICACIONES_ORIGINALES:   "No entregó cal. originales",
  BAJO_PROMEDIO:                          "Bajo promedio",
  FALTAS_FORMACION_INTEGRAL:              "Faltas a F.I.",
  LLEVARSE_EXTRAORDINARIO:                "Por llevarse a extraordinario",
  DEJO_ESCUELA_PERSONALES:                "Dejó la escuela (personal)",
  DEJO_ESCUELA_VOCACIONAL:                "Dejó la escuela (vocacional)",
  DESAPARECIO:                            "Desapareció sin avisar",
  FALTAS_REGLAMENTO:                      "Faltas al reglamento",
};

const resolutionCauseLabel = (refrend: ScholarshipRefrend): string | null => {
  if (!refrend.resolution_cause) return null;
  if (refrend.resolution_cause === "OTRO") return refrend.resolution_notes ?? null;
  return CAUSE_LABELS[refrend.resolution_cause] ?? refrend.resolution_cause;
};

const rowClass = (item: BulkRefrendRow): string => {
  const s = item.refrend.workflow_status;
  if (s === "CON_INCIDENCIA") return "row-incident";
  if (s === "DRAFT") return "row-pending";
  return "";
};

const canPedagogia = (status: WorkflowStatus | null): boolean =>
  status === "CON_INCIDENCIA";

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

// ── Pedagogia dialog ───────────────────────────────────────────────────────

const pedagogiaOpen = ref(false);
const pedagogiaLoading = ref(false);

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

// ── Approve ────────────────────────────────────────────────────────────────

const approveLoading = ref<number | null>(null);
const bulkLoading = ref(false);

const cleanDraftIds = computed(() =>
  displayRows.value
    .filter(
      (r) =>
        r.refrend.workflow_status === "DRAFT" &&
        !r.has_falta_discount &&
        !r.has_retardos_discount &&
        r.month_absent === 0 &&
        r.semester_lates_unconsumed < 2 &&
        r.incidents_count === 0,
    )
    .map((r) => r.refrend.id),
);

const onApprove = async (item: BulkRefrendRow): Promise<void> => {
  approveLoading.value = item.refrend.id;
  try {
    await store.approveAsIs(item.refrend.id);
  } finally {
    approveLoading.value = null;
  }
};

const onBulkApproveClean = async (): Promise<void> => {
  if (!cleanDraftIds.value.length) return;
  bulkLoading.value = true;
  try {
    await store.bulkApprove(cleanDraftIds.value);
  } finally {
    bulkLoading.value = false;
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
