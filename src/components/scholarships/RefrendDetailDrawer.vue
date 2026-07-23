<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    width="420"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="row">
      <!-- ── Header card ──────────────────────────────────────────────────── -->
      <div class="drawer-header pa-4">
        <div class="d-flex align-start justify-space-between ga-2">
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              {{ row.refrend.snapshot_name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ row.refrend.snapshot_campus }} &middot;
              {{ row.refrend.snapshot_generation ?? "Sin generación" }}
              &middot; {{ periodLabel }}
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="emit('update:modelValue', false)"
          />
        </div>

        <v-chip
          class="mt-2"
          :color="statusChip(row.refrend).color"
          size="small"
          label
          variant="tonal"
        >
          {{ statusChip(row.refrend).label }}
        </v-chip>
        <div
          v-if="resolutionCauseLabel(row.refrend)"
          class="text-caption text-medium-emphasis mt-1"
        >
          {{ resolutionCauseLabel(row.refrend) }}
        </div>
      </div>

      <v-divider />

      <div class="pa-4">
        <!-- ── Financial breakdown ─────────────────────────────────────────── -->
        <div class="section-label mb-2">Financiero</div>
        <div class="d-flex flex-wrap ga-4 mb-4">
          <div>
            <div class="text-caption text-medium-emphasis">Monto base</div>
            <div class="text-body-2 font-weight-medium">
              {{ fmt(row.refrend.base_amount) }}
            </div>
          </div>
          <div v-if="Number(row.refrend.discount_amount) > 0">
            <div class="text-caption text-medium-emphasis">Descuento</div>
            <div class="text-body-2 font-weight-medium text-error">
              - {{ fmt(row.refrend.discount_amount) }} ({{
                row.refrend.discount_percentage
              }}%)
            </div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">Monto final</div>
            <div class="text-body-2 font-weight-bold text-success">
              {{ fmt(row.refrend.final_amount) }}
            </div>
          </div>
        </div>

        <!-- ── Academic discount (relocated from Atención primary columns) ─── -->
        <div class="section-label mb-2">Descuento académico</div>
        <div class="mb-4">
          <v-tooltip
            v-if="hasAcademicDiscount"
            location="bottom"
            max-width="280"
          >
            <template #activator="{ props: tp }">
              <v-chip
                v-bind="tp"
                size="small"
                color="orange-darken-1"
                variant="flat"
                label
              >
                - {{ row.refrend.snapshot_discount_percentage }}%
              </v-chip>
            </template>
            <div class="text-caption">
              <div v-if="row.refrend.snapshot_discount_reason">
                <span class="font-weight-bold">Motivo: </span>
                {{ row.refrend.snapshot_discount_reason }}
              </div>
            </div>
          </v-tooltip>
          <span v-else class="text-caption text-disabled"
            >Sin descuento académico</span
          >
        </div>

        <!-- ── Attendance stats-grid (full detail) ──────────────────────────── -->
        <div class="section-label mb-2">Asistencias</div>
        <ScholarshipAttendanceSummary
          :user-id="row.refrend.user_id"
          :year="year"
          :month="month"
        />

        <!-- ── Pedagogía (readonly) ─────────────────────────────────────────── -->
        <div class="section-label mt-4 mb-2">Revisión Pedagogía</div>
        <div
          v-if="row.refrend.pedagogia_observations"
          class="text-body-2 observation-box"
        >
          {{ row.refrend.pedagogia_observations }}
        </div>
        <span v-else class="text-caption text-disabled">Sin revisión</span>
      </div>

      <v-divider />

      <!-- ── Footer actions ───────────────────────────────────────────────── -->
      <div class="pa-3 d-flex justify-end ga-2">
        <v-btn
          v-if="showRecalculate"
          variant="tonal"
          color="teal"
          size="small"
          prepend-icon="mdi-refresh"
          :loading="recalcLoading"
          @click="emit('recalculate', row)"
        >
          Recalcular
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          @click="emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ScholarshipAttendanceSummary from "@/components/scholarships/ScholarshipAttendanceSummary.vue";
import {
  fmt,
  resolutionCauseLabel,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import { canRecordSituation } from "@/utils/refrendActionability";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

// ── Props / Emits ────────────────────────────────────────────────────────────
//
// Shared right-side detail drawer for Atención (design ADR D1). Hosts
// secondary/audit fields as grouped stat blocks instead of dense table
// columns: relocated `profile_discount`, full attendance stats-grid (reused
// from ScholarshipAttendanceSummary), Pedagogía-readonly, and the recalcular
// action moved out of the row's action column.

const props = defineProps<{
  modelValue: boolean;
  row: BulkRefrendRow | null;
  year: number;
  month: number;
  recalcLoading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  recalculate: [row: BulkRefrendRow];
}>();

// ── Computed ───────────────────────────────────────────────────────────────

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

const periodLabel = computed(
  () => `${MONTHS_ES[props.month - 1] ?? props.month} ${props.year}`,
);

const hasAcademicDiscount = computed(
  () =>
    !!props.row?.refrend.snapshot_discount_percentage &&
    Number(props.row.refrend.snapshot_discount_percentage) > 0,
);

// Recalcular is backend-gated to DRAFT only (RecalculateRefrendService); the
// isLocked-derived predicate is an extra safety net for the dual state
// machine (design ADR D5), not a replacement for that specific rule.
const showRecalculate = computed(
  () =>
    !!props.row &&
    props.row.refrend.workflow_status === "DRAFT" &&
    canRecordSituation(props.row.refrend),
);
</script>

<style scoped>
.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.observation-box {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.5;
}
</style>
