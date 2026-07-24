<template>
  <div class="generation-section mb-4">
    <div class="generation-header d-flex align-center ga-2 mb-2">
      <span class="text-caption font-weight-bold text-uppercase">{{
        generation
      }}</span>
      <v-chip size="x-small" variant="tonal" color="primary" label>
        {{ rows.length }}
      </v-chip>
    </div>

    <v-data-table
      :headers="headers"
      :items="rows"
      class="elevation-1 pedagogia-refrend-table"
      :items-per-page="-1"
      hover
      item-value="refrend.id"
      :row-props="({ item }) => ({ class: rowClass(item) })"
    >
      <template #bottom />

      <!-- ── IDENTIDAD ─────────────────────────────────────────────────────── -->

      <template #item.snapshot_name="{ item }">
        <div class="d-flex align-center ga-2 text-no-wrap py-1">
          <span class="font-weight-medium text-body-2">{{
            item.refrend.snapshot_name
          }}</span>
        </div>
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

      <!-- Incidencia cruda: icono + tooltip con el texto completo, no texto
           inline (ver IncidentTooltipIcon.vue). -->
      <template #item.incident_description="{ item }">
        <div class="d-flex justify-center">
          <IncidentTooltipIcon :text="item.incident_description" />
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
          @click="emit('open-pedagogia', item)"
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
          <RefrendSituationBar
            v-if="canRecordSituation(item.refrend)"
            :current-resolution="item.refrend.resolution_type ?? null"
            :locked="!canRecordSituation(item.refrend)"
            :amount-pending="item.refrend.amount_pending_from_previous"
            :workflow-status="item.refrend.workflow_status"
            :loading="situationLoadingId === item.refrend.id"
            @approve-full="emit('approve-full', item)"
            @approve-as-is="emit('approve-as-is', item)"
            @open="(type) => emit('open-situation', item, type)"
          />
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import RefrendSituationBar from "@/components/scholarships/RefrendSituationBar.vue";
import IncidentTooltipIcon from "@/components/scholarships/IncidentTooltipIcon.vue";
import {
  BASE_HEADERS,
  fmt,
  resolutionCauseLabel,
  rowClass,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import { canPedagogia, canRecordSituation } from "@/utils/refrendActionability";
import type { BulkRefrendRow, ResolutionType } from "@/interfaces/scholarship";

// ── Props / Emits ────────────────────────────────────────────────────────────
//
// One `v-data-table` per generación group (user feedback: "regresa a
// pedagogía en tabla y agrupado por generaciones como estaba antes" — table
// layout restored, board/card presentation reverted). Each section is always
// expanded — no Vuetify `group-by` collapsible rows, no per-section collapse
// control (consistent with the earlier "no per-generación collapse"
// decision the user approved). Actionability goes through
// `refrendActionability.ts` exclusively — no inline status checks (spec "Row
// Actionability Respects isLocked()").

type SituationKey = ResolutionType | "PAGO_MESES";

defineProps<{
  generation: string;
  rows: BulkRefrendRow[];
  situationLoadingId: number | null;
}>();

const emit = defineEmits<{
  "open-pedagogia": [row: BulkRefrendRow];
  "approve-full": [row: BulkRefrendRow];
  "approve-as-is": [row: BulkRefrendRow];
  "open-situation": [row: BulkRefrendRow, type: SituationKey];
}>();

const PEDAGOGIA_HEADERS = [
  {
    title: "Incidencia",
    key: "incident_description",
    width: 70,
    align: "center" as const,
    sortable: false,
  },
  { title: "Respuesta", key: "pedagogia", width: 180, sortable: false },
  { title: "Base", key: "base_amount", width: 100, sortable: false },
  { title: "Desc.%", key: "discount_pct", width: 80, sortable: false },
  { title: "Final", key: "projected_amount", width: 110, sortable: false },
  { title: "", key: "payment_verify", width: 160, sortable: false },
];

const headers = [...BASE_HEADERS, ...PEDAGOGIA_HEADERS];
</script>

<style scoped>
.generation-header {
  color: rgba(var(--v-theme-on-surface), 0.6);
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

.pedagogia-refrend-table :deep(tbody tr td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
