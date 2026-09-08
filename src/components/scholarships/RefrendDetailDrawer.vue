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
            <v-chip
              class="mt-1"
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
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="emit('update:modelValue', false)"
          />
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
import ScholarshipAttendanceSummary from "@/components/scholarships/ScholarshipAttendanceSummary.vue";
import {
  resolutionCauseLabel,
  statusChip,
} from "@/composables/useRefrendTableDisplay";
import type { BulkRefrendRow } from "@/interfaces/scholarship";

// ── Props / Emits ────────────────────────────────────────────────────────────
//
// Shared right-side detail drawer for Verificación (design ADR D1). User feedback
// round 2: dropped the financial breakdown + relocated `profile_discount`
// stat block and the "Revisión Aprobación" section from here — the drawer now
// focuses on the attendance stats-grid (reused from
// ScholarshipAttendanceSummary). The recalcular action moved out to its own
// row column in VerificacionRefrendTable.vue. R. Aprobación moved back to its own
// icon+modal table column (see VerificacionRefrendTable.vue /
// IncidentDetailIcon.vue). Widened (420px → 540px) per explicit request,
// even though content shrank.

const props = defineProps<{
  modelValue: boolean;
  row: BulkRefrendRow | null;
  year: number;
  month: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
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
