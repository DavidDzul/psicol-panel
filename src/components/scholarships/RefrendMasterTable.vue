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
      :items="rows"
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
          <v-chip
            v-if="item.refrend.snapshot_scholarship_type"
            size="x-small"
            color="primary"
            variant="plain"
            label
          >
            {{ item.refrend.snapshot_scholarship_type }}
          </v-chip>
          <v-chip
            v-if="item.incidents_count > 0"
            :color="item.incidents_count >= 3 ? 'error' : 'warning'"
            size="x-small"
            variant="flat"
            >{{ item.incidents_count }}</v-chip
          >
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

      <!-- ── ACADÉMICO ────────────────────────────────────────────────────── -->

      <template #item.last_grade="{ item }">
        <v-chip :color="academicColor(item.academic_status)" size="small" label>
          {{ item.last_grade ?? "—" }}
        </v-chip>
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
          :color="workflowColor(item.refrend.workflow_status)"
          size="small"
          label
          variant="tonal"
        >
          {{ workflowLabel(item.refrend.workflow_status) }}
        </v-chip>
      </template>

      <template #item.atencion="{ item }">
        <div class="d-flex align-center ga-1">
          <!-- Flag: habilitado en DRAFT (registrar) y CON_INCIDENCIA (editar) -->
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

          <!-- Tooltip con detalle de incidencia activa -->
          <v-tooltip
            v-if="item.incident_description"
            location="bottom"
            max-width="280"
          >
            <template #activator="{ props: tooltipProps }">
              <v-icon
                v-bind="tooltipProps"
                icon="mdi-alert-circle-outline"
                size="14"
                color="orange-darken-2"
                class="flex-shrink-0"
              />
            </template>
            <div class="text-caption">
              <div class="font-weight-bold mb-1">
                {{ item.incident_category }} — {{ item.incident_type }}
              </div>
              <div>{{ item.incident_description }}</div>
            </div>
          </v-tooltip>

          <!-- Observación (solo lectura, truncada) -->
          <span
            v-if="item.refrend.atencion_observations"
            class="text-caption text-medium-emphasis text-truncate"
            style="max-width: 110px"
            :title="item.refrend.atencion_observations"
            >{{ item.refrend.atencion_observations }}</span
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
          :disabled="notificadoLoading === item.refrend.id"
          @update:model-value="toggleNotificado(item, $event)"
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
          <!-- Aprobar al monto actual -->
          <v-btn
            v-if="
              item.refrend.workflow_status != null &&
              ['DRAFT', 'CON_INCIDENCIA'].includes(item.refrend.workflow_status)
            "
            :loading="approveLoading === item.refrend.id"
            size="x-small"
            variant="tonal"
            color="green"
            title="Aprobar al monto actual"
            @click="onApprove(item)"
          >
            <v-icon size="14" start>mdi-check</v-icon>
            Aprobar
          </v-btn>

          <!-- Clear flag (CON_INCIDENCIA only) -->
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

          <!-- Otras acciones: Pago 100%, Recalcular, Situaciones especiales -->
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
      :initial-description="activeRow?.refrend.atencion_observations ?? null"
      :initial-category="(activeRow?.incident_category as any) ?? null"
      @submit="onAtencionSubmit"
    />

    <RefrendPedagogiaDialog
      v-model="pedagogiaOpen"
      :loading="pedagogiaLoading"
      :atencion-observations="activeRow?.refrend.atencion_observations ?? null"
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
}>();

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
  return { label: "Sin impacto", color: "success" };
};

// ── Table headers ──────────────────────────────────────────────────────────

const headers = [
  // IDENTIDAD (ancla fija)
  {
    title: "Becario",
    key: "snapshot_name",
    fixed: true,
    sortable: true,
  },
  // REVISIÓN (lo más importante para el operador)
  { title: "Estado", key: "workflow_status", sortable: false },
  {
    title: "Atención a Becarios/as",
    key: "atencion",
    sortable: false,
  },
  { title: "Pedagogía", key: "pedagogia", width: 180, sortable: false },
  { title: "Notif.", key: "notificado", width: 65, sortable: false },
  // ASISTENCIAS
  { title: "Clases", key: "attendance_total", width: 65, sortable: true },
  { title: "F.mes", key: "month_absent", width: 70, sortable: true },
  {
    title: "Ret.acum.",
    key: "semester_lates_unconsumed",
    width: 90,
    sortable: true,
  },
  { title: "Impacto", key: "attendance_impact", width: 150, sortable: false },
  // ACADÉMICO
  { title: "Promedio", key: "last_grade", width: 90, sortable: true },
  // IDENTIDAD (referencia, menos frecuente)

  // ECONÓMICO
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 70, sortable: false },
  { title: "Final", key: "projected_amount", sortable: false },
  // ACCIONES
  { title: "", key: "payment_verify", width: 80, sortable: false },
] as const;

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

const academicColor = (status: BulkRefrendRow["academic_status"]): string =>
  ({
    ok: "green",
    low_grade: "orange",
    missing_subjects: "red",
    inactive: "grey",
  })[status] ?? "grey";

const workflowColor = (status: WorkflowStatus | null): string => {
  const map: Record<string, string> = {
    DRAFT: "grey",
    CON_INCIDENCIA: "orange",
    PENDIENTE_NOTIFICACION: "blue",
    LISTO_PARA_PAGO: "green",
    CLOSED: "teal",
  };
  return map[status ?? "DRAFT"] ?? "grey";
};

const workflowLabel = (status: WorkflowStatus | null): string => {
  const map: Record<string, string> = {
    DRAFT: "Borrador",
    CON_INCIDENCIA: "Con incidencia",
    PENDIENTE_NOTIFICACION: "Pend. notif.",
    LISTO_PARA_PAGO: "Listo para pago",
    CLOSED: "Cerrado",
  };
  return map[status ?? "DRAFT"] ?? status ?? "—";
};

const canPedagogia = (status: WorkflowStatus | null): boolean =>
  status === "CON_INCIDENCIA" || status === "PENDIENTE_NOTIFICACION";

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
    const isEdit = activeRow.value.refrend.workflow_status === "CON_INCIDENCIA";
    if (isEdit) {
      await store.patchInline(activeRow.value.refrend.id, {
        atencion_observations: form.description.trim() || null,
      });
    } else {
      await store.atencionFlag(activeRow.value.refrend.id, form);
    }
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
