<template>
  <div class="pedagogia-case-board">
    <div class="board-header mb-3">
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
          Cerrar refrendo
        </v-btn>

        <!-- Total -->
        <v-chip size="small" variant="tonal" color="grey-darken-1" label>
          <v-icon start size="13">mdi-account-group-outline</v-icon>
          {{ props.rows.length }} becarios
        </v-chip>
      </div>

      <v-text-field
        v-model="searchQuery"
        placeholder="Buscar por nombre becario..."
        prepend-inner-icon="mdi-magnify"
        variant="filled"
        density="compact"
        hide-details
        clearable
        class="mt-2"
      />
    </div>

    <div v-if="loading" class="d-flex justify-center pa-6">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <div v-if="groups.length === 0" class="text-center text-medium-emphasis pa-6">
        Sin becarios con incidencia en este periodo.
      </div>

      <div
        v-for="group in groups"
        :key="group.generation"
        class="generation-section mb-4"
      >
        <div class="generation-header d-flex align-center ga-2 mb-2">
          <span class="text-caption font-weight-bold text-uppercase">{{
            group.generation
          }}</span>
          <v-chip size="x-small" variant="tonal" color="primary" label>
            {{ group.rows.length }}
          </v-chip>
        </div>

        <div class="cards-grid">
          <PedagogiaCaseCard
            v-for="row in group.rows"
            :key="row.refrend.id"
            :row="row"
            :situation-loading="situationLoadingId === row.refrend.id"
            @open-pedagogia="openPedagogiaDialog"
            @approve-full="onApproveFullPayment"
            @approve-as-is="onApproveAsIs"
            @open-situation="openSituationDialog"
          />
        </div>
      </div>
    </template>

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
            <strong>Listo para pago</strong>. No aparecen en este tablero
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
import PedagogiaCaseCard from "@/components/scholarships/PedagogiaCaseCard.vue";
import RefrendPedagogiaDialog from "@/components/scholarships/RefrendPedagogiaDialog.vue";
import SituationSinPagoDialog from "@/components/scholarships/SituationSinPagoDialog.vue";
import SituationRetenidaDialog from "@/components/scholarships/SituationRetenidaDialog.vue";
import SituationPagoMesesDialog from "@/components/scholarships/SituationPagoMesesDialog.vue";
import SituationSuspendidaDialog from "@/components/scholarships/SituationSuspendidaDialog.vue";
import SituationBajaDialog from "@/components/scholarships/SituationBajaDialog.vue";
import SituationEgresadoDialog from "@/components/scholarships/SituationEgresadoDialog.vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { groupRowsByGeneration } from "@/composables/useRefrendGrouping";
import { buildTableInfo, filterRowsByName } from "@/composables/useRefrendTableDisplay";
import { getCleanDraftIds } from "@/utils/refrendBulkClose";
import type {
  BulkRefrendRow,
  ResolutionType,
  PedagogiaResolveForm,
  RecordSituationForm,
} from "@/interfaces/scholarship";

// ── Props ──────────────────────────────────────────────────────────────────
//
// Same prop surface as `PedagogiaRefrendTable.vue` (drop-in compatible for
// the Phase 4 cutover). Data scope is UNCHANGED: only `incidents_count > 0`
// rows are shown (design ADR D3 — no widening of the fetched dataset, only
// how it's grouped/rendered).

const props = defineProps<{
  rows: BulkRefrendRow[];
  loading?: boolean;
  year: number;
  month: number;
}>();

const searchQuery = ref("");

// Pedagogía solo revisa becarios con incidencia del periodo, agrupados por
// la generación snapshoteada — mismo alcance de datos que la tabla original
// (ver comentario equivalente en PedagogiaRefrendTable.vue).
const displayRows = computed(() => {
  const rows = props.rows.filter((r) => r.incidents_count > 0);
  return filterRowsByName(rows, searchQuery.value);
});

// ── Grouping (design ADR D3/D4: generación section, workflow_status badge) ──

const groups = computed(() => groupRowsByGeneration(displayRows.value));

// ── Board title ────────────────────────────────────────────────────────────

const tableInfo = computed(() =>
  buildTableInfo(props.rows, props.year, props.month),
);

// ── Store ──────────────────────────────────────────────────────────────────

const store = useScholarshipStore();

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

const openSituationDialog = (
  item: BulkRefrendRow,
  type: SituationKey,
): void => {
  activeRow.value = item;
  situationDialogs.value[type] = true;
};

// ── Cerrar refrendo (borradores sin nada que analizar) ──────────────────────
//
// `rows`/`displayRows` ya vienen filtradas a solo incidencias, así que un
// becario limpio nunca aparece ahí. Para saber cuántos hay que cerrar, hace
// falta leer `store.incidenciasRows` directo (fetch SIN filtrar) — mismo
// razonamiento que `PedagogiaRefrendTable.vue`. La condición de "limpio" en
// sí vive en `getCleanDraftIds` (`@/utils/refrendBulkClose`), portada
// VERBATIM y cubierta por tests unitarios (ver
// `src/utils/__tests__/refrendBulkClose.test.ts`) — este es el punto de
// mayor riesgo de correctitud de todo el cambio.

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
.pedagogia-case-board {
  width: 100%;
}

.board-header {
  padding: 6px 2px;
}

.generation-header {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}
</style>
