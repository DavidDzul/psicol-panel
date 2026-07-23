<template>
  <v-card
    class="pedagogia-case-card"
    :class="rowClass(row)"
    variant="outlined"
  >
    <!-- ── Identity + status badge (primary visual element, design ADR D4) ── -->
    <div class="d-flex align-start justify-space-between ga-2 pa-3 pb-2">
      <div class="flex-grow-1">
        <div class="text-body-2 font-weight-medium">
          {{ row.refrend.snapshot_name }}
        </div>
      </div>
      <div class="d-flex flex-column ga-1 align-end">
        <v-chip
          :color="statusChip(row.refrend).color"
          size="small"
          label
          variant="tonal"
        >
          {{ statusChip(row.refrend).label }}
        </v-chip>
        <span
          v-if="resolutionCauseLabel(row.refrend)"
          class="text-caption text-medium-emphasis text-right"
          style="max-width: 180px"
        >
          {{ resolutionCauseLabel(row.refrend) }}
        </span>
      </div>
    </div>

    <v-divider />

    <!-- ── Incident (full text, decompressed — was truncated+tooltip in the table) ── -->
    <div class="pa-3 pb-2">
      <div class="section-label mb-1">Incidencia</div>
      <p v-if="row.incident_description" class="text-body-2 mb-0">
        {{ row.incident_description }}
      </p>
      <span v-else class="text-caption text-disabled">Sin incidencia</span>
    </div>

    <v-divider />

    <!-- ── Financial stat-blocks (decompressed "Final" cell, design D4) ────── -->
    <div class="pa-3 pb-2">
      <div class="d-flex flex-wrap ga-4">
        <div>
          <div class="text-caption text-medium-emphasis">Base</div>
          <div class="text-body-2 font-weight-medium">
            {{ fmt(row.refrend.snapshot_gross_amount ?? row.refrend.base_amount) }}
          </div>
          <div
            v-if="
              row.refrend.snapshot_discount_percentage &&
              Number(row.refrend.snapshot_discount_percentage) > 0
            "
            class="text-caption text-orange-darken-1"
          >
            - {{ row.refrend.snapshot_discount_percentage }}%
          </div>
        </div>

        <div>
          <div class="text-caption text-medium-emphasis">Desc. %</div>
          <div
            class="text-body-2"
            :class="
              Number(row.refrend.discount_percentage) > 0
                ? 'text-error'
                : 'text-medium-emphasis'
            "
          >
            {{ row.refrend.discount_percentage }}%
          </div>
        </div>

        <div>
          <div class="text-caption text-medium-emphasis">Final</div>
          <div class="text-body-2 font-weight-bold text-success">
            {{ fmt(row.refrend.final_amount) }}
          </div>
          <template v-if="Number(row.refrend.amount_pending_from_previous) > 0">
            <div class="text-caption text-teal-darken-1">
              + {{ fmt(row.refrend.amount_pending_from_previous) }} ret.
            </div>
            <div class="text-caption font-weight-bold text-teal-darken-2">
              = {{ fmt(row.refrend.total_to_pay) }}
            </div>
          </template>
          <template
            v-else-if="Number(row.refrend.refund_amount_from_previous) > 0"
          >
            <div class="text-caption text-green-darken-1">
              + {{ fmt(row.refrend.refund_amount_from_previous!) }} reemb.
            </div>
            <div class="text-caption font-weight-bold text-green-darken-2">
              = {{ fmt(row.refrend.total_to_pay) }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- ── Situation actions (1:1 with PedagogiaRefrendTable's payment_verify column) ── -->
    <div class="pa-3 d-flex align-center flex-wrap ga-2">
      <v-btn
        :prepend-icon="
          row.refrend.pedagogia_observations ? 'mdi-school' : 'mdi-school-outline'
        "
        size="x-small"
        variant="tonal"
        :color="row.refrend.pedagogia_observations ? 'gray' : 'purple'"
        :disabled="!canPedagogia(row.refrend)"
        @click="emit('open-pedagogia', row)"
      >
        {{ row.refrend.pedagogia_observations ? "Visualizar" : "Registrar" }}
      </v-btn>

      <RefrendSituationBar
        v-if="canRecordSituation(row.refrend)"
        :current-resolution="row.refrend.resolution_type ?? null"
        :locked="!canRecordSituation(row.refrend)"
        :amount-pending="row.refrend.amount_pending_from_previous"
        :workflow-status="row.refrend.workflow_status"
        :loading="situationLoading"
        @approve-full="emit('approve-full', row)"
        @approve-as-is="emit('approve-as-is', row)"
        @open="(type) => emit('open-situation', row, type)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import {
  fmt,
  resolutionCauseLabel,
  rowClass,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import { canPedagogia, canRecordSituation } from "@/utils/refrendActionability";
import type {
  BulkRefrendRow,
  ResolutionType,
} from "@/interfaces/scholarship";

// ── Props / Emits ────────────────────────────────────────────────────────────
//
// One card per Pedagogía case (design ADR D4 — generación is the outer
// section, workflow_status is the card's badge/accent; explicitly NOT a
// kanban column-per-status layout). Actions map 1:1 to
// `PedagogiaRefrendTable.vue`'s row actions: `pedagogia` button
// (Registrar/Visualizar), and `RefrendSituationBar` for
// approve-full/approve-as-is/situation dialogs. Actionability MUST go
// through `refrendActionability.ts` — no inline status checks (spec
// "Row Actionability Respects isLocked()").
//
// DEVIATION from the original table: the old inline
// `canPedagogia = (status) => status === 'CON_INCIDENCIA'` did not check
// `isLocked()`, unlike the shared `canPedagogia()` predicate used here. Same
// class of fix already applied to Atención's button in Phase 2 (see
// apply-progress) — a stale/inconsistent workflow_status could otherwise
// leave the pedagogia button enabled on a locked row.

type SituationKey = ResolutionType | "PAGO_MESES";

defineProps<{
  row: BulkRefrendRow;
  situationLoading?: boolean;
}>();

const emit = defineEmits<{
  "open-pedagogia": [row: BulkRefrendRow];
  "approve-full": [row: BulkRefrendRow];
  "approve-as-is": [row: BulkRefrendRow];
  "open-situation": [row: BulkRefrendRow, type: SituationKey];
}>();
</script>

<style scoped>
.pedagogia-case-card {
  width: 100%;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.pedagogia-case-card.row-pending {
  border-left: 3px solid rgba(255, 193, 7, 0.6);
}

.pedagogia-case-card.row-incident {
  border-left: 3px solid rgba(255, 152, 0, 0.6);
}
</style>
