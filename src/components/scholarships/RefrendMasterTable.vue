<template>
  <div class="refrend-master-table-wrapper">
    <div class="d-flex align-center ga-3 mb-2 px-1">
      <span class="text-subtitle-2 font-weight-medium">{{ tableInfo.campus }}</span>
      <v-divider vertical class="mx-1" />
      <span class="text-caption text-medium-emphasis">{{ tableInfo.generation }}</span>
      <v-divider vertical class="mx-1" />
      <span class="text-caption text-medium-emphasis">{{ tableInfo.period }}</span>
      <v-spacer />
      <span class="text-caption text-medium-emphasis">{{ rows.length }} becarios</span>
    </div>

    <v-data-table
      v-model:expanded="expanded"
      :headers="headers"
      :items="rows"
      :loading="loading"
      density="compact"
      fixed-header
      height="calc(100vh - 280px)"
      class="elevation-1 refrend-master-table"
      :items-per-page="50"
      hover
      item-value="refrend.id"
      show-expand
    >
      <!-- ── IDENTIDAD ─────────────────────────────────────────────────────── -->

      <template #item.snapshot_name="{ item }">
        <div class="d-flex align-center ga-1 text-no-wrap">
          <span class="font-weight-medium">{{
            item.refrend.snapshot_name
          }}</span>
          <v-chip
            v-if="item.incidents_count > 0"
            :color="item.incidents_count >= 3 ? 'error' : 'warning'"
            size="x-small"
            variant="tonal"
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

      <template #item.snapshot_scholarship_type="{ item }">
        <v-chip size="x-small" variant="outlined" label>{{
          item.refrend.snapshot_scholarship_type
        }}</v-chip>
      </template>

      <!-- ── ACADÉMICO ────────────────────────────────────────────────────── -->

      <template #item.last_grade="{ item }">
        <v-chip :color="academicColor(item.academic_status)" size="small" label>
          {{ item.last_grade ?? "—" }}
        </v-chip>
      </template>

      <!-- ── ASISTENCIAS ──────────────────────────────────────────────────── -->

      <template #item.attendance_present="{ item }">
        <span class="text-success font-weight-medium text-caption">{{
          item.attendance_present
        }}</span>
      </template>

      <template #item.attendance_absent="{ item }">
        <span class="text-error font-weight-medium text-caption">{{
          item.attendance_absent
        }}</span>
      </template>

      <template #item.attendance_absent_justified="{ item }">
        <span class="text-caption">{{ item.attendance_absent_justified }}</span>
      </template>

      <template #item.attendance_late="{ item }">
        <span class="text-warning font-weight-medium text-caption">{{
          item.attendance_late
        }}</span>
      </template>

      <template #item.attendance_late_justified="{ item }">
        <span class="text-caption">{{ item.attendance_late_justified }}</span>
      </template>

      <template #item.attendance_late_consumed="{ item }">
        <span class="text-caption">{{ item.attendance_late_consumed }}</span>
      </template>

      <template #item.attendance_late_unconsumed="{ item }">
        <v-chip
          :color="
            item.attendance_late_unconsumed >= 2
              ? 'error'
              : item.attendance_late_unconsumed === 1
                ? 'warning'
                : 'default'
          "
          size="x-small"
          :variant="item.attendance_late_unconsumed > 0 ? 'tonal' : 'text'"
        >
          {{ item.attendance_late_unconsumed }}
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
        <span class="text-caption font-weight-medium">{{ fmt(item.refrend.final_amount) }}</span>
      </template>

      <!-- ── ACCIONES ─────────────────────────────────────────────────────── -->

      <template #item.payment_verify="{ item }">
        <div class="d-flex align-center ga-1 flex-wrap">
          <!-- Recalculate (DRAFT only) -->
          <v-btn
            v-if="item.refrend.workflow_status === 'DRAFT'"
            :loading="recalcLoading === item.refrend.id"
            icon="mdi-refresh"
            size="x-small"
            variant="text"
            color="teal"
            title="Recalcular refrendo"
            @click="onRecalculate(item)"
          />
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
          <!-- Situation quick-access bar -->
          <RefrendSituationBar
            :current-resolution="item.refrend.resolution_type ?? null"
            :locked="isLocked(item.refrend)"
            :active-type="situationLoadingId === item.refrend.id ? situationLoadingType : null"
            @submit-direct="(type) => onSituationDirect(item, type)"
            @open="(type) => openSituationDialog(item, type)"
          />
        </div>
      </template>

      <!-- ── EXPANDED ROW ─────────────────────────────────────────────────── -->

      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="pa-4 bg-grey-lighten-5">
            <div
              class="text-caption font-weight-medium text-medium-emphasis mb-2"
            >
              DETALLE DE ASISTENCIAS — {{ item.refrend.snapshot_name }}
            </div>
            <ScholarshipAttendanceSummary
              :user-id="item.refrend.user_id"
              :year="year"
              :month="month"
            />
          </td>
        </tr>
      </template>
    </v-data-table>

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
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const tableInfo = computed(() => {
  const first = props.rows[0]?.refrend;
  return {
    campus:     first?.snapshot_campus     ?? "—",
    generation: first?.snapshot_generation ?? "—",
    period:     `${MONTHS_ES[(props.month - 1)] ?? props.month} ${props.year}`,
  };
});

// ── Store ──────────────────────────────────────────────────────────────────

const store = useScholarshipStore();

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
  { title: "Pres.", key: "attendance_present", width: 60, sortable: true },
  { title: "Faltas", key: "attendance_absent", width: 65, sortable: true },
  {
    title: "F.J.",
    key: "attendance_absent_justified",
    width: 55,
    sortable: false,
  },
  { title: "Ret.", key: "attendance_late", width: 55, sortable: true },
  {
    title: "R.J.",
    key: "attendance_late_justified",
    width: 50,
    sortable: false,
  },
  {
    title: "R.C.",
    key: "attendance_late_consumed",
    width: 50,
    sortable: false,
  },
  {
    title: "R.nc.",
    key: "attendance_late_unconsumed",
    width: 65,
    sortable: true,
  },
  // ACADÉMICO
  { title: "Promedio", key: "last_grade", width: 90, sortable: true },
  // IDENTIDAD (referencia, menos frecuente)

  {
    title: "Tipo",
    key: "snapshot_scholarship_type",
    width: 70,
    sortable: false,
  },
  // ECONÓMICO
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 70, sortable: false },
  { title: "Final", key: "projected_amount", sortable: false },
  // ACCIONES
  { title: "", key: "payment_verify", width: 80, sortable: false },
] as const;

// ── Expanded rows ──────────────────────────────────────────────────────────

const expanded = ref<string[]>([]);

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

const openSituationDialog = (item: BulkRefrendRow, type: SituationKey): void => {
  activeRow.value = item;
  situationDialogs.value[type] = true;
};

const onSituationDirect = async (item: BulkRefrendRow, type: ResolutionType): Promise<void> => {
  situationLoadingId.value = item.refrend.id;
  situationLoadingType.value = type;
  try {
    await store.recordPaymentSituation(item.refrend.id, { resolution_type: type });
  } finally {
    situationLoadingId.value = null;
    situationLoadingType.value = null;
  }
};

const onSituationSubmit = async (form: RecordSituationForm): Promise<void> => {
  if (!activeRow.value) return;
  situationSubmitLoading.value = true;
  try {
    await store.recordPaymentSituation(activeRow.value.refrend.id, form);
    const key = (form.carryover_months_count && form.resolution_type === "BECA_MES")
      ? "PAGO_MESES"
      : form.resolution_type as SituationKey;
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
  width: 100%;
}
</style>
