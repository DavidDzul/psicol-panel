<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="indigo" size="small">mdi-school-outline</v-icon>
        Egresado
      </v-card-title>

      <v-card-text class="pt-0">
        <!-- sdd/egresado-baja-definitiva: EGRESADO is now a terminal cycle
             closure (CloseScholarshipCycleAction) — $0 this month, cycle
             stopped, irreversible. Replaces the old "se conserva el monto
             calculado" copy, which described the PRE-cut behavior. -->
        <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
          El becario egresa: este mes no se paga ($0), se cierra su ciclo y no
          se generarán más refrendos. Esta acción no se puede deshacer.
        </v-alert>

        <!-- sdd/revertir-pago-adelantado S10 (R21): informational only, the
             confirm button never depends on the preview. -->
        <CycleCutAdvanceWarning :preview="cutPreview ?? null" :loading="cutPreviewLoading" />
        <CycleCutWithholdingWarning :preview="cutPreview ?? null" :loading="cutPreviewLoading" />

        <!-- sdd/egresado-baja-definitiva PR3 (amendments #1987/#1988): the
             backend's cut guards (blocking later months, ACTIVA Telmex
             coverage) are rendered here instead of a
             generic toast — NO acknowledge checkbox, any of these BLOCKS
             outright and staff must resolve the underlying issue elsewhere,
             then retry. -->
        <v-alert v-if="blockResult" type="error" variant="tonal" density="compact" class="mb-3">
          <div class="font-weight-medium mb-1">{{ blockResult.msg }}</div>

          <template v-if="blockResult.status === 'cut_blocked' && blockResult.blocking_months?.length">
            <ul class="pl-4 mb-0">
              <li v-for="(m, i) in blockResult.blocking_months" :key="i">
                {{ monthLabel(m.period_month, m.period_year) }} — {{ CUT_BLOCK_REASON_LABELS[m.reason] ?? m.reason }}
              </li>
            </ul>
          </template>

          <template v-else-if="blockResult.status === 'cut_blocked' && blockResult.telmex_coverage">
            <div class="text-body-2">
              Cancela la cobertura Telmex en Becas Telmex (administration-panel) y
              vuelve a intentarlo.
            </div>
          </template>

        </v-alert>

        <v-textarea
          v-model="form.resolution_notes"
          label="Observaciones (opcional)"
          rows="2"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="indigo" variant="elevated" :loading="loading" @click="submit">
          Confirmar egreso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import CycleCutAdvanceWarning from "@/components/scholarships/CycleCutAdvanceWarning.vue";
import CycleCutWithholdingWarning from "@/components/scholarships/CycleCutWithholdingWarning.vue";
import type { CutBlockResult, CycleCutPreview, RecordSituationForm } from "@/interfaces/scholarship";
import { CUT_BLOCK_REASON_LABELS, MONTHS_ES } from "@/composables/useRefrendTableDisplay";

const props = defineProps<{
  loading?: boolean;
  blockResult?: CutBlockResult | null;
  cutPreview?: CycleCutPreview | null;
  cutPreviewLoading?: boolean;
}>();
const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const form = reactive({ resolution_notes: null as string | null });

watch(model, (v) => { if (!v) form.resolution_notes = null; });

const monthLabel = (month: number, year: number): string =>
  `${MONTHS_ES[month - 1] ?? month} ${year}`;

const submit = () => {
  emit("submit", {
    resolution_type: "EGRESADO",
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
