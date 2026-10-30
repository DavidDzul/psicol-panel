<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="red-darken-2" size="small">mdi-account-off-outline</v-icon>
        Baja definitiva
      </v-card-title>

      <v-card-text class="pt-0">
        <!-- sdd/egresado-baja-definitiva: BAJA_DEFINITIVA is now a terminal
             cycle closure too (CloseScholarshipCycleAction) — $0 this month,
             cycle stopped, account deactivated, irreversible. -->
        <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
          El becario causa baja definitiva: este mes no se paga ($0), se
          cierra su ciclo, no se generarán más refrendos y su cuenta se
          desactiva. Esta acción no se puede deshacer.
        </v-alert>

        <!-- sdd/revertir-pago-adelantado S10 (R21): informational only, the
             confirm button never depends on the preview. -->
        <CycleCutAdvanceWarning :preview="cutPreview ?? null" :loading="cutPreviewLoading" />
        <CycleCutWithholdingWarning :preview="cutPreview ?? null" :loading="cutPreviewLoading" />

        <!-- sdd/egresado-baja-definitiva PR3 (amendments #1987/#1988): same
             blocking display as SituationEgresadoDialog.vue — NO acknowledge
             checkbox, NO "se marcarán como Perdidas" copy (FORFEITED is out
             of scope). Pending withholdings no longer block: the cut cancels
             them (CycleCutWithholdingWarning above). -->
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

        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
        <v-radio-group v-model="form.resolution_cause" class="mt-0 mb-3" hide-details>
          <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="red-darken-2" />
          <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="red-darken-2" />
          <v-radio label="Dejó la escuela por problemas personales" value="DEJO_ESCUELA_PERSONALES" color="red-darken-2" />
          <v-radio label="Dejó la escuela por falta de orientación vocacional" value="DEJO_ESCUELA_VOCACIONAL" color="red-darken-2" />
          <v-radio label="Desapareció sin avisar" value="DESAPARECIO" color="red-darken-2" />
          <v-radio label="Faltas al reglamento" value="FALTAS_REGLAMENTO" color="red-darken-2" />
          <v-radio label="Otro" value="OTRO" color="red-darken-2" />
        </v-radio-group>
        <v-text-field
          v-if="form.resolution_cause === 'OTRO'"
          v-model="form.resolution_notes"
          label="Especificar causa *"
          variant="outlined"
          density="compact"
          class="mb-2"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="red-darken-2" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Confirmar baja
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
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

const form = reactive({ resolution_cause: null as string | null, resolution_notes: null as string | null });

watch(model, (v) => { if (!v) { form.resolution_cause = null; form.resolution_notes = null; } });

const monthLabel = (month: number, year: number): string =>
  `${MONTHS_ES[month - 1] ?? month} ${year}`;

const isValid = computed(() =>
  !!form.resolution_cause &&
  (form.resolution_cause !== "OTRO" || !!form.resolution_notes?.trim())
);

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "BAJA_DEFINITIVA",
    resolution_cause: form.resolution_cause,
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
