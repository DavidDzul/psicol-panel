<template>
  <div class="refrend-master-table-wrapper">
    <div class="d-flex align-center ga-3 mb-2 px-1">
      <span class="text-subtitle-2 font-weight-medium">{{
        tableInfo.campus
      }}</span>
      <v-divider vertical class="mx-1" />
      <span class="text-caption text-medium-emphasis">{{
        tableInfo.generation
      }}</span>
      <v-divider vertical class="mx-1" />
      <span class="text-caption text-medium-emphasis">{{
        tableInfo.period
      }}</span>
      <v-spacer />
      <span class="text-caption text-medium-emphasis"
        >{{ rows.length }} becarios</span
      >
    </div>

    <v-data-table
      :headers="headers"
      :items="displayRows"
      :loading="loading"
      class="elevation-1 refrend-master-table"
      :items-per-page="-1"
      hover
      item-value="refrend.id"
    >
      <template #bottom />
      <!-- ── IDENTIDAD ─────────────────────────────────────────────────────── -->

      <template #item.snapshot_name="{ item }">
        <div class="d-flex align-center ga-1 text-no-wrap">
          <span class="font-weight-medium">{{
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
                size="15"
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
      </template>

      <template #item.scholarship_type="{ item }">
        <v-chip
          v-if="item.refrend.snapshot_scholarship_type"
          size="x-small"
          color="primary"
          variant="tonal"
          label
        >
          {{ item.refrend.snapshot_scholarship_type }}
        </v-chip>
        <span v-else class="text-caption text-disabled">—</span>
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

      <!-- Faltas injustificadas en el mes del refrendo (dispara suspensión) -->
      <template #item.month_absent="{ item }">
        <v-chip
          :color="item.month_absent >= 1 ? 'error' : 'default'"
          size="x-small"
          :variant="item.month_absent >= 1 ? 'tonal' : 'text'"
          label
        >
          {{ item.month_absent }}
        </v-chip>
      </template>

      <!-- Retardos acumulados en el semestre (2 = suspensión) -->
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
              ? 'tonal'
              : 'text'
          "
          label
        >
          {{
            item.has_retardos_discount
              ? item.attendance_late
              : item.semester_lates_unconsumed
          }}/2
        </v-chip>
      </template>

      <!-- Impacto en pago -->
      <template #item.attendance_impact="{ item }">
        <v-chip
          :color="attendanceImpact(item).color"
          size="x-small"
          :variant="
            attendanceImpact(item).color === 'success' ? 'text' : 'tonal'
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

      <template #item.atencion="{ item }">
        <!-- Atención mode: botón de bandera + texto editable -->
        <div v-if="mode === 'atencion'" class="d-flex align-center ga-1">
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

        <!-- Pedagogía mode: solo lectura — descripción + observaciones de Atención -->
        <div v-else class="d-flex flex-column ga-0" style="max-width: 160px">
          <span
            v-if="item.incident_description"
            class="text-caption font-weight-medium text-truncate"
            :title="item.incident_description"
            >{{ item.incident_description }}</span
          >
          <span
            v-if="item.refrend.atencion_observations"
            class="text-caption text-medium-emphasis text-truncate"
            :title="item.refrend.atencion_observations"
            >{{ item.refrend.atencion_observations }}</span
          >
          <span
            v-if="
              !item.incident_description && !item.refrend.atencion_observations
            "
            class="text-caption text-disabled"
            >—</span
          >
        </div>
      </template>

      <template #item.pedagogia_readonly="{ item }">
        <div class="d-flex align-center ga-1">
          <v-icon
            icon="mdi-school-outline"
            size="x-small"
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
          <span v-else class="text-caption text-disabled">—</span>
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
            mode === 'pedagogia' || notificadoLoading === item.refrend.id
          "
          @update:model-value="
            mode === 'atencion' && toggleNotificado(item, $event)
          "
        />
      </template>

      <!-- ── ECONÓMICO ────────────────────────────────────────────────────── -->

      <template #item.base_amount="{ item }">
        <span class="text-caption">{{ fmt(item.refrend.base_amount) }}</span>
      </template>

      <template #item.discount_pct="{ item }">
        <span
          class="text-caption"
          :class="
            Number(item.refrend.discount_percentage) > 0 ? 'text-error' : ''
          "
        >
          {{ item.refrend.discount_percentage }}%
        </span>
      </template>

      <template #item.projected_amount="{ item }">
        <span class="text-caption font-weight-medium">{{
          fmt(item.refrend.final_amount)
        }}</span>
      </template>

      <!-- ── ACCIONES ─────────────────────────────────────────────────────── -->

      <template #item.payment_verify="{ item }">
        <div class="d-flex align-center ga-1">
          <v-btn
            v-if="
              ['DRAFT', 'CON_INCIDENCIA'].includes(
                item.refrend.workflow_status ?? '',
              )
            "
            :loading="approveLoading === item.refrend.id"
            size="x-small"
            variant="tonal"
            color="green"
            title="Validar pago al monto actual"
            @click="onApprove(item)"
          >
            <v-icon size="14" start>mdi-check</v-icon>
            Validar
          </v-btn>
          <RefrendSituationBar
            :current-resolution="item.refrend.resolution_type ?? null"
            :locked="isLocked(item.refrend)"
            :loading="
              situationLoadingId === item.refrend.id ||
              recalcLoading === item.refrend.id
            "
            @approve-full="onApproveFullPayment(item)"
            @recalculate="onRecalculate(item)"
            @open="(type) => openSituationDialog(item, type)"
          />
        </div>
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

const displayRows = computed(() => props.rows);

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
    campus: first?.snapshot_campus ?? "—",
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
  if (hasRet) return { label: "Retardos", color: "error" };
  return { label: "Sin novedad", color: "success" };
};

// ── Table headers ──────────────────────────────────────────────────────────

const BASE_HEADERS = [
  { title: "Becario", key: "snapshot_name", fixed: true, sortable: true },
  { title: "Tipo", key: "scholarship_type", width: 70, sortable: false },
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
    title: "Consecuencia",
    key: "attendance_impact",
    width: 150,
    sortable: false,
  },
  { title: "Clases", key: "attendance_total", width: 65, sortable: true },
  { title: "F.mes", key: "month_absent", width: 70, sortable: true },
  {
    title: "Ret.acum.",
    key: "semester_lates_unconsumed",
    width: 90,
    sortable: true,
  },
];

const PEDAGOGIA_HEADERS = [
  { title: "Pedagogía", key: "pedagogia", width: 180, sortable: false },
  { title: "Notif.", key: "notificado", width: 65, sortable: false },
  {
    title: "Consecuencia",
    key: "attendance_impact",
    width: 150,
    sortable: false,
  },
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 70, sortable: false },
  { title: "Final", key: "projected_amount", sortable: false },
  { title: "", key: "payment_verify", width: 80, sortable: false },
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

const LOCKED_STATUSES = new Set(["PAID", "AUTHORIZED"]);

const isLocked = (refrend: ScholarshipRefrend): boolean =>
  LOCKED_STATUSES.has(refrend.status);

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
  if (s === "CANCELLED") return { label: "Baja", color: "red-darken-3" };

  // LISTO_PARA_PAGO — mostrar resolución
  if (s === "LISTO_PARA_PAGO") {
    if (r === "BECA_MES") return { label: "Aprobado", color: "green" };
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

const onApprove = async (item: BulkRefrendRow): Promise<void> => {
  approveLoading.value = item.refrend.id;
  try {
    await store.approveAsIs(item.refrend.id);
  } finally {
    approveLoading.value = null;
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

/* Sticky header sin contenedor de scroll propio en la tabla */
.refrend-master-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
}
</style>
