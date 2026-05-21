<template>
  <div class="refrend-master-table-wrapper">
    <v-data-table
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
    >
      <!-- Becario (sticky left) -->
      <template #item.snapshot_name="{ item }">
        <div class="d-flex align-center ga-1">
          <span class="font-weight-medium text-no-wrap">{{ item.refrend.snapshot_name }}</span>
          <v-chip
            v-if="item.incidents_count >= 3"
            color="error"
            size="x-small"
            variant="tonal"
            class="ml-1"
          >
            {{ item.incidents_count }}
          </v-chip>
          <v-chip
            v-else-if="item.incidents_count >= 1"
            color="warning"
            size="x-small"
            variant="tonal"
            class="ml-1"
          >
            {{ item.incidents_count }}
          </v-chip>
        </div>
      </template>

      <!-- Asistencias summary -->
      <template #item.attendance_summary="{ item }">
        <span class="text-caption">
          <span class="text-success">P:{{ item.attendance_present }}</span>
          <span class="ml-1 text-warning">R:{{ item.attendance_late }}</span>
          <span class="ml-1 text-error">F:{{ item.attendance_absent }}</span>
        </span>
      </template>

      <!-- Retardos no consumidos -->
      <template #item.attendance_late_unconsumed="{ item }">
        <span :class="item.attendance_late_unconsumed >= 2 ? 'text-error font-weight-bold' : ''">
          {{ item.attendance_late_unconsumed }}
        </span>
      </template>

      <!-- Promedio / estado académico -->
      <template #item.last_grade="{ item }">
        <v-chip
          :color="academicColor(item.academic_status)"
          size="small"
          label
        >
          {{ item.last_grade ?? '-' }}
        </v-chip>
      </template>

      <!-- Monto proyectado (inline edit) -->
      <template #item.projected_amount="{ item }">
        <div v-if="isLocked(item.refrend)" class="text-caption font-weight-medium">
          {{ formatCurrency(item.projected_amount) }}
        </div>
        <div v-else class="d-flex align-center ga-1">
          <v-text-field
            :model-value="editingAmountId === item.refrend.id ? amountDraft : item.refrend.final_amount"
            density="compact"
            variant="plain"
            hide-details
            type="number"
            min="0"
            style="max-width: 90px"
            @focus="startEditAmount(item)"
            @blur="saveAmount(item)"
            @update:model-value="amountDraft = $event"
            @keydown.enter="saveAmount(item)"
            @keydown.escape="cancelEditAmount"
          />
        </div>
      </template>

      <!-- Etiquetas de atención (inline editor) -->
      <template #item.atencion_labels="{ item }">
        <RefrendInlineLabelsEditor
          :model-value="item.refrend.atencion_labels ?? []"
          :disabled="isLocked(item.refrend)"
          @update:model-value="onLabelsChange(item, $event)"
        />
      </template>

      <!-- Estado -->
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.refrend.status)" size="small" label>
          {{ statusLabel(item.refrend.status) }}
        </v-chip>
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center">
          <v-btn
            icon="mdi-comment-edit"
            size="x-small"
            variant="text"
            :disabled="isLocked(item.refrend)"
            @click="openAtencionDialog(item)"
          />
          <v-btn
            icon="mdi-eye"
            size="x-small"
            variant="text"
            :to="{ name: 'ScholarshipRefrendDetailsView', params: { id: item.refrend.id } }"
          />
          <v-btn
            v-if="item.incidents_count > 0"
            icon="mdi-alert-circle"
            size="x-small"
            variant="text"
            color="warning"
            @click="openIncidentDialog(item)"
          />
        </div>
      </template>
    </v-data-table>

    <!-- ScholarshipAtencionReviewDialog mounted ONCE -->
    <ScholarshipAtencionReviewDialog
      v-if="activeRow !== null"
      :model-value="atencionDialogOpen"
      :refrend="activeRow.refrend"
      :loading="atencionLoading"
      @update:model-value="atencionDialogOpen = $event"
      @submit="onAtencionSubmit"
    />

    <!-- Incident resolution dialog -->
    <v-dialog v-model="incidentDialogOpen" max-width="480" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
          <v-icon color="warning" size="small">mdi-alert-circle</v-icon>
          Resolver incidencia
        </v-card-title>
        <v-card-text class="pt-0">
          <p class="text-body-2 mb-3">
            Becario: <strong>{{ incidentRow?.refrend.snapshot_name }}</strong>
            — {{ incidentRow?.incidents_count }} incidencia(s).
          </p>
          <v-textarea
            v-model="incidentComment"
            label="Comentario de resolución"
            rows="3"
            variant="outlined"
            counter="500"
            maxlength="500"
            :error-messages="incidentCommentError"
            placeholder="Describe el motivo o resolución de la incidencia..."
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeIncidentDialog">Cancelar</v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :disabled="incidentComment.trim().length < 10"
            :loading="incidentLoading"
            @click="submitIncident"
          >
            Resolver
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type {
  BulkRefrendRow,
  ScholarshipRefrend,
  RefrendStatus,
} from "@/interfaces/scholarship";
import type { ReviewForm } from "@/interfaces/scholarship";

const ScholarshipAtencionReviewDialog = defineAsyncComponent(
  () => import("@/components/scholarships/ScholarshipAtencionReviewDialog.vue"),
);

// ── RefrendInlineLabelsEditor subcomponent ─────────────────────────────────

const RefrendInlineLabelsEditor = {
  name: "RefrendInlineLabelsEditor",
  props: {
    modelValue: {
      type: Array as () => string[],
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props: { modelValue: string[]; disabled: boolean }, ctx: { emit: (event: string, ...args: unknown[]) => void }) {
    const newLabel = ref<string>("");
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const emitDebounced = (value: string[]): void => {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        ctx.emit("update:modelValue", value);
      }, 400);
    };

    const addLabel = (): void => {
      const trimmed = newLabel.value.trim();
      if (!trimmed || props.disabled) return;
      const updated = [...props.modelValue, trimmed];
      newLabel.value = "";
      emitDebounced(updated);
    };

    const removeLabel = (label: string): void => {
      if (props.disabled) return;
      const updated = props.modelValue.filter((l) => l !== label);
      emitDebounced(updated);
    };

    return { newLabel, addLabel, removeLabel };
  },
  template: `
    <div class="d-flex flex-wrap align-center ga-1" style="min-width: 180px">
      <v-chip
        v-for="label in modelValue"
        :key="label"
        size="x-small"
        closable
        :disabled="disabled"
        @click:close="removeLabel(label)"
      >{{ label }}</v-chip>
      <v-text-field
        v-if="!disabled"
        v-model="newLabel"
        density="compact"
        variant="plain"
        hide-details
        placeholder="+ etiqueta"
        style="max-width: 100px; min-width: 80px"
        @keydown.enter.prevent="addLabel"
      />
    </div>
  `,
};

// ── Props & emits ──────────────────────────────────────────────────────────

const props = defineProps<{
  rows: BulkRefrendRow[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  atencionSaved: [refrend: ScholarshipRefrend];
}>();

// ── Store ──────────────────────────────────────────────────────────────────

const store = useScholarshipStore();

// ── Table headers ──────────────────────────────────────────────────────────

const headers = [
  { title: "Becario", key: "snapshot_name", fixed: true, width: 220, sortable: true },
  { title: "Generación", key: "refrend.snapshot_generation", width: 120, sortable: false },
  { title: "Sede", key: "refrend.snapshot_campus", width: 90, sortable: false },
  { title: "Tipo", key: "refrend.snapshot_scholarship_type", width: 70, sortable: false },
  { title: "Asist.", key: "attendance_summary", width: 130, sortable: false },
  { title: "Ret. nc.", key: "attendance_late_unconsumed", width: 80, sortable: true },
  { title: "Promedio", key: "last_grade", width: 100, sortable: false },
  { title: "% Desc.", key: "active_discount_pct", width: 80, sortable: false },
  { title: "Monto base", key: "refrend.base_amount", width: 110, sortable: false },
  { title: "Monto proy.", key: "projected_amount", width: 120, sortable: false },
  { title: "Etiquetas", key: "atencion_labels", width: 240, sortable: false },
  { title: "Estado", key: "status", width: 140, sortable: false },
  { title: "", key: "actions", width: 100, sortable: false },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const LOCKED_STATUSES: RefrendStatus[] = ["PAID", "AUTHORIZED"];

const isLocked = (refrend: ScholarshipRefrend): boolean =>
  LOCKED_STATUSES.includes(refrend.status);

const formatCurrency = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value));

const academicColor = (status: BulkRefrendRow["academic_status"]): string => {
  const map: Record<BulkRefrendRow["academic_status"], string> = {
    ok: "green",
    low_grade: "orange",
    missing_subjects: "red",
    inactive: "grey",
  };
  return map[status] ?? "grey";
};

const statusColor = (status: RefrendStatus): string => {
  const map: Record<RefrendStatus, string> = {
    DRAFT: "grey",
    ATENCION_REVIEW: "blue",
    PEDAGOGIA_REVIEW: "purple",
    AUTHORIZED: "green",
    PAID: "teal",
    WITHHELD: "orange",
    CANCELLED: "red",
  };
  return map[status] ?? "grey";
};

const statusLabel = (status: RefrendStatus): string => {
  const map: Record<RefrendStatus, string> = {
    DRAFT: "Borrador",
    ATENCION_REVIEW: "Rev. Atención",
    PEDAGOGIA_REVIEW: "Rev. Pedagogía",
    AUTHORIZED: "Autorizado",
    PAID: "Pagado",
    WITHHELD: "Retenido",
    CANCELLED: "Cancelado",
  };
  return map[status] ?? status;
};

// ── Inline labels ──────────────────────────────────────────────────────────

const onLabelsChange = async (item: BulkRefrendRow, newLabels: string[]): Promise<void> => {
  try {
    await store.patchInline(item.refrend.id, { atencion_labels: newLabels });
  } catch {
    // rollback already handled in store
  }
};

// ── Inline amount ──────────────────────────────────────────────────────────

const editingAmountId = ref<number | null>(null);
const amountDraft = ref<string>("");

const startEditAmount = (item: BulkRefrendRow): void => {
  editingAmountId.value = item.refrend.id;
  amountDraft.value = item.refrend.final_amount;
};

const saveAmount = async (item: BulkRefrendRow): Promise<void> => {
  if (editingAmountId.value !== item.refrend.id) return;
  editingAmountId.value = null;
  const parsed = parseFloat(amountDraft.value);
  if (isNaN(parsed) || parsed < 0) return;
  try {
    await store.patchInline(item.refrend.id, { final_amount_override: parsed });
  } catch {
    // rollback handled in store
  }
};

const cancelEditAmount = (): void => {
  editingAmountId.value = null;
};

// ── Atencion dialog (mounted once) ─────────────────────────────────────────

const activeRow = ref<BulkRefrendRow | null>(null);
const atencionDialogOpen = ref<boolean>(false);
const atencionLoading = ref<boolean>(false);

const openAtencionDialog = (item: BulkRefrendRow): void => {
  activeRow.value = item;
  atencionDialogOpen.value = true;
};

const onAtencionSubmit = async (form: ReviewForm): Promise<void> => {
  if (!activeRow.value) return;
  atencionLoading.value = true;
  try {
    const updated = await store.submitAtencionReview(activeRow.value.refrend.id, form);
    if (updated) {
      emit("atencionSaved", updated);
    }
    atencionDialogOpen.value = false;
  } finally {
    atencionLoading.value = false;
  }
};

// ── Incident resolution dialog ─────────────────────────────────────────────

const incidentRow = ref<BulkRefrendRow | null>(null);
const incidentDialogOpen = ref<boolean>(false);
const incidentComment = ref<string>("");
const incidentCommentError = ref<string>("");
const incidentLoading = ref<boolean>(false);

const openIncidentDialog = (item: BulkRefrendRow): void => {
  incidentRow.value = item;
  incidentComment.value = "";
  incidentCommentError.value = "";
  incidentDialogOpen.value = true;
};

const closeIncidentDialog = (): void => {
  incidentDialogOpen.value = false;
  incidentRow.value = null;
};

const submitIncident = async (): Promise<void> => {
  if (!incidentRow.value) return;
  const comment = incidentComment.value.trim();
  if (comment.length < 10) {
    incidentCommentError.value = "El comentario debe tener al menos 10 caracteres.";
    return;
  }
  incidentLoading.value = true;
  try {
    await store.patchInline(incidentRow.value.refrend.id, {
      atencion_observations: comment,
    });
    closeIncidentDialog();
  } catch {
    incidentCommentError.value = "Error al guardar. Intenta de nuevo.";
  } finally {
    incidentLoading.value = false;
  }
};
</script>

<style scoped>
.refrend-master-table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.refrend-master-table {
  min-width: 1400px;
}
</style>
