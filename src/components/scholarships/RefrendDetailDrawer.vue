<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    width="540"
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
        <!-- ── Attendance stats-grid (full detail) ──────────────────────────── -->
        <div class="section-label mb-2">Asistencias</div>
        <ScholarshipAttendanceSummary
          :user-id="row.refrend.user_id"
          :year="year"
          :month="month"
        />
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
  resolutionCauseLabel,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import { canRecordSituation } from "@/utils/refrendActionability";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

// ── Props / Emits ────────────────────────────────────────────────────────────
//
// Shared right-side detail drawer for Atención (design ADR D1). User feedback
// round 2: dropped the financial breakdown + relocated `profile_discount`
// stat block and the "Revisión Pedagogía" section from here — the drawer now
// focuses on the attendance stats-grid (reused from
// ScholarshipAttendanceSummary) + the recalcular action. R. Pedagogía moved
// back to its own icon+tooltip table column (see AtencionRefrendTable.vue /
// IncidentTooltipIcon.vue). Widened (420px → 540px) per explicit request,
// even though content shrank.

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
</style>
